"""
API for the GO service.
"""

import re
import secrets
import time
from string import whitespace

import jwt
from eve.auth import TokenAuth
from eve.io.mongo import Validator
from flask import abort, jsonify, request
from flask_cors import cross_origin
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required)
from ldap3 import ALL, ALL_ATTRIBUTES, SUBTREE, Connection, Server
from ldap3.core.connection import SIMPLE, SYNC


class PatternValidator(Validator):
    """
    Class which validates an incoming regex.
    """

    def __init__(self, application, *args, **kwargs):
        super(PatternValidator, self).__init__(*args, **kwargs)
        self.app = application
        self.allowed_capture = [r'\d+', r'\w+', r'\S+', r'\d', r'\w', r'\S']
        datasource, _, _, _ = self.app.data.datasource(self.resource)
        self.mongodb = self.app.data.driver.db[datasource]

    @staticmethod
    def contains_whitespace(pattern):
        """ Check if pattern contains whitespace characters. """
        return any(character in pattern for character in whitespace)

    @staticmethod
    def contains_non_word_character(pattern):
        """ Check if pattern contains non-word character. """
        return bool(re.search(r'\W', pattern))

    @staticmethod
    def extract_capture_groups(pattern):
        """ Extracts regex string inside the capture groups. """
        return re.findall(r'\((.*?)\)', pattern)

    @staticmethod
    def invalid_first_capture_group(group):
        """ The first capture group is only allowed word characters or '|' """
        return group == '' or bool(re.search(r'[^a-zA-Z0-9_\|]', group))

    @staticmethod
    def extract_words(pattern):
        """ Extracts whole words from pattern """
        return re.findall(r'\b\w+\b', pattern)

    def construct_search_query(self, search):
        """ Constructs MongoDB query, with language set to none to reduce
            unexpected behavior, also exludes itself if already exist.
            The exclude is needed for the patch requests. """
        query = {'$text': {'$search': search, '$language': 'none'}}
        try:
            id_field = self.app.config.get('ID_FIELD', '_id')
            query[id_field] = {'$ne': self.document_id}
        except AttributeError:
            # document does not exist in database, this is safe to ignore
            pass
        return query

    def valid_capture(self, group):
        """ Check if the group is one of the allowed regex operations """
        return group in self.allowed_capture

    def valid_sub_points(self, expected_number):
        """ Checks if the target has valid insertion numbers """
        target = self.document.get('target')
        insertion_locations = re.findall(r'\\(\d+)', target)
        m = max([int(x) for x in insertion_locations])
        return m >= 1 and m <= expected_number

    def single_word_pattern(self, field, pattern):
        """ Validate patterns consisting of single word """
        if self.contains_non_word_character(pattern):
            self._error(field, "Pattern must only contain word characters")
        elif self.mongodb.find_one(self.construct_search_query(pattern)):
            self._error(field, "Pattern must be unique")

    def _validate_type_urlpattern(self, field, pattern):
        """Custom cerberus validator for the schema type urlpattern"""

        try:
            re.compile(pattern)
        except re.error:
            self._error(field, "Pattern must be a valid python regex")
            return

        # check for capture groups in pattern
        capture_groups = self.extract_capture_groups(pattern)
        group_count = len(capture_groups)

        if group_count == 0:
            self.single_word_pattern(field, pattern)
            if self._error:
                return

        elif group_count == 1:
            self._error(field, "Capture group support require more arguments")
            return

        elif group_count > 1:
            if self.invalid_first_capture_group(capture_groups[0]):
                self._error(field, "First pattern group must only contain word "
                            "characters split by '|'")
                return

            for group in capture_groups[1:]:
                if not self.valid_capture(group):
                    self._error(field,
                                'Pattern capture groups only allows {}'.format(
                                    ' '.join(self.allowed_capture)))
                    return

            words = self.extract_words(capture_groups[0])
            for word in words:
                if self.mongodb.find_one(self.construct_search_query(word)):
                    self._error(
                        field, "{} not unique".format(word))
                    return

            if not self.valid_sub_points(group_count):
                self._error(field, "Mismatch between capture groups and target"
                " insertion location")
        if not self._error:
            self._error(field, "Pattern not understood by server")


class APITokenAuthenticator(TokenAuth):
    """
    Authentication class. It handles all communication with the ldap server
    and is responsible for creating new tokens for logins.
    """

    UNAUTHORIZED = 401

    def __init__(self):
        super(APITokenAuthenticator, self)

    def jwt_app(self, app):
        """
        When added, generate a new secret and add it to the app config.
        """
        self.app = app
        self.app.config['JWT_SECRET_KEY'] = secrets.token_urlsafe(64)
        self.ldap_server = Server(self.app.config['LDAP_SERVER'],
                                  self.app.config['LDAP_PORT'], get_info=ALL)
        self.admin_groups = self.app.config["LDAP_TOOLS_ADMIN_GROUPS"]

    def _check_empty_token(self):
        headers = request.headers
        auth = headers['Authorization']

        if auth == "Bearer":
            abort(self.UNAUTHORIZED)

    def _decode_token(self):
        """
        Use to decode a token.
        """
        self._check_empty_token()

        headers = request.headers
        auth = headers['Authorization']

        if auth:
            token = auth.split(" ")[1]
            try:
                decoded_token = jwt.decode(
                    token, self.app.config['JWT_SECRET_KEY'])
                return decoded_token
            except:
                abort(self.UNAUTHORIZED)
        else:
            abort(self.UNAUTHORIZED)

    def _is_in_admin_group(self, username, connection):
        """
        Check if the user is part of a admin group.
        """
        is_admin = False
        for group in self.admin_groups:
            if connection.search(
                    search_base=self.app.config['LDAP_AUTH_BASEDN'],
                    search_filter=self.app.config['LDAP_GROUP_SEARCH_FILTER'].format(
                        username, group),
                    search_scope=SUBTREE,
                    attributes=ALL_ATTRIBUTES):
                is_admin = True
                break
        return is_admin

    def _find_full_name(self, user, connection):
        """
        Find the full name of a user.
        """
        connection.search(search_base=self.app.config['LDAP_AUTH_BASEDN'],
                          search_filter=self.app.config['LDAP_SAMACCOUNT_FILTER'].format(
                              user),
                          search_scope=SUBTREE,
                          attributes=ALL_ATTRIBUTES)
        if not connection.response:
            return ""

        try:
            samaccountname = connection.response[0]['raw_attributes']['sAMAccountName']
        except KeyError:
            samaccountname = None

        return str(samaccountname[0], 'utf-8') if samaccountname else ""

    def _get_ldap_connection(self, username, password):
        """
        Trying to establish a connection. If it fails, it returns a None connection.
        """
        try:
            connection = Connection(self.ldap_server,
                                    authentication=SIMPLE,
                                    user=username,
                                    password=password,
                                    client_strategy=SYNC,
                                    auto_bind=self.app.config['AUTH_LDAP_INITIAL_AS_USER'],
                                    raise_exceptions=True)
        except Exception:
            self.app.logger.warning("Unable to establish connection to : {}".format(
                self.app.config['LDAP_SERVER']))
            return None
        return connection

    def ldap_auth(self, username, password):
        """
        Authenticate a user against a LDAP server.
        """
        ldap_user = self.app.config['AUTH_LDAP_INITIAL_PATTERN'].format(
            username)

        try:
            connection = self._get_ldap_connection(ldap_user, password)
            if not connection:
                return ""

            full_name = self._find_full_name(username, connection)

            if full_name:
                identity = "{};{}".format(
                    full_name,
                    "user" if not self._is_in_admin_group(
                        username, connection) else
                    "admin")
            else:
                identity = ""
            connection.unbind()
        except Exception as e:
            self.app.logger.warning(e)

        return identity

    def get_user_and_group(self):
        """
        Get the current user and group from a request.
        """

        decoded_token = self._decode_token()

        identity = decoded_token['identity']

        user_group = identity.split(";")
        return user_group

    @cross_origin()
    def login(self):
        """
        Use this endpoint to login and to obtain a token.
        Must be provided with ldap user credentials.
        """
        username = request.json.get('username', None)
        password = request.json.get('password', None)

        if not username or not password:
            return jsonify({"msg": "Missing either username or password"}), 401

        identity = self.ldap_auth(username, password)
        if not identity:
            return jsonify({"msg": "Invalid credentials"}), 401

        user = identity.split(';')[1]
        tokens = {
            'rights': user,
            'access_token': create_access_token(identity=identity),
            'refresh_token': create_refresh_token(identity=identity)
        }
        return jsonify(tokens), 200

    #@jwt_refresh_token_required
    @cross_origin(expose_headers=['Authorization', 'Content-Type'])
    def refresh(self):
        """
        Generate a new access token given a refresh token.
        """
        current_user = ';'.join(self.get_user_and_group())
        tokens = {
            'access_token': create_access_token(identity=current_user)
        }

        return jsonify(tokens), 200

    @jwt_required
    def check_auth(self, token, allowed_roles, resource, method):
        """
        Function for really check if a token is valid.
        """
        return True

    def authorized(self, allowed_roles, resource, method):
        """
        Search for endpoints that are allowed to be called without
        authentication. Otherwise find the token and then authenticate.
        """
        self._check_empty_token()

        auth_endpoints = self.app.config['LDAP_AUTH_ENDPOINTS']
        for res in auth_endpoints:
            match = re.compile(res)
            if match.fullmatch(resource) and not auth_endpoints[res]:
                return True

        return super(APITokenAuthenticator, self).authorized(allowed_roles,
                                                             resource, method)


class API:
    """
    Class which represents the Go API. It takes care of authentication of users.
    """
    ACCESS_DENIED = 401
    METHOD_NOT_ALLOWED = 405

    def __init__(self, app):
        self.app = app
        self.ldap_server = Server(self.app.config['LDAP_SERVER'],
                                  self.app.config['LDAP_PORT'])

    def lookup_user(self, lookup):
        """
        Decide which entries a user has access to.
        """
        user_group = self.app.auth.get_user_and_group()
        if not user_group:
            abort(self.METHOD_NOT_ALLOWED)
        else:
            if user_group[1] == "user":
                lookup['ldapuser'] = {'$eq': user_group[0]}
        return lookup

    def pre_patch(self, resource, request, lookup):
        """
        Check which group a user belongs to. If in user, then filter out all
        entries that belongs to the user. Users in the admin group can update
        all entries.
        """
        lookup = self.lookup_user(lookup)

    def pre_delete(self, resource, requestf, lookup):
        """
        Check which group a user belongs to. If in user, then filter out all
        entries that belongs to the user. Users in the admin group can delete
        all entries.
        """
        lookup = self.lookup_user(lookup)

    def deleted_item(self, request, item):
        """
        Inform that an deletion has been made.
        """
        user_group = self.app.auth.get_user_and_group()
        now = time.strftime("%Y-%m-%d %H:%M:%S")
        self.app.logger.debug(("{}: Delete performed " +
                               "by {} on alias {}").format(now,
                                                           user_group[0],
                                                           item['pattern']))

    def insert(self, resource, updates):
        """
        Links a user to a inserted alias pattern pair.
        """
        user_group = self.app.auth.get_user_and_group()

        if not user_group:
            abort(self.METHOD_NOT_ALLOWED)
        else:
            for update in updates:
                update['ldapuser'] = user_group[0]

    def inserted_item(self, resource, item):
        """
        Inform that an insertion has been made.
        """
        user_group = self.app.auth.get_user_and_group()
        now = time.strftime("%Y-%m-%d %H:%M:%S")
        self.app.logger.debug(("{}: Insert performed by " +
                               "{}, inserted {}").format(now,
                                                         user_group[0],
                                                         item[0]['pattern']))

    def updated_item(self, resource, updates, original):
        """
        Inform that a user has updated an item.
        """
        user_group = self.app.auth.get_user_and_group()

        update_time = updates['_updated']
        update_time = update_time.strftime("%Y-%m-%d %H:%M:%S")
        self.app.logger.debug(("{}: Patch performed by {} " +
                               "on {} to {}").format(update_time,
                                                     user_group[0],
                                                     original['target'],
                                                     updates['target']))
