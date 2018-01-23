import copy
import jwt
import re
import secrets
import time
import sys

from eve.io.mongo import Validator
from eve.auth import BasicAuth, TokenAuth
from flask import abort, request, Response, jsonify
from flask_cors import cross_origin
from ldap3 import Server, Connection, SUBTREE, ALL_ATTRIBUTES, ALL
from ldap3.core.connection import SIMPLE, SYNC
from ldap3.core.exceptions import LDAPInvalidCredentialsResult

from flask_jwt_extended import (
        jwt_required, get_jwt_identity,
        create_access_token, create_refresh_token,
        jwt_refresh_token_required)

class APIMockTokenAuthenticator(TokenAuth):
    """
    Authentication class. It handles all communication with the ldap server
    and is responsible for creating new tokens for logins.
    """

    def __init__(self):
        super(APIMockTokenAuthenticator, self)

    def jwt_app(self, app):
        """
        When added, generate a new secret and add it to the app config.
        """
        self.app = app
        self.app.config['JWT_SECRET_KEY'] = secrets.token_urlsafe(64)
        self.ldap_server = Server(self.app.config['LDAP_SERVER'],
                                  self.app.config['LDAP_PORT'], get_info=ALL)
        self.admin_groups = self.app.config["LDAP_TOOLS_ADMIN_GROUPS"]

    def _is_in_admin_group(self, username, connection):
        """
        Check if the user is part of a admin group.
        """
        return True if username == "admin" else False

    def _find_full_name(self, user, connection):
        """
        Find the full name of a user.
        """
        return user

    def _get_ldap_connection(self, username, password):
        """
        Trying to establish a connection. If it fails, it returns a None connection.
        """
        return None

    def ldap_auth(self, username, password):
        """
        Authenticate a user against a LDAP server.
        """

        full_name = self._find_full_name(username,None)

        identity = "{};{}".format(
                    full_name,
                    "user" if not self._is_in_admin_group(
                        username, None) else
                            "admin")
        return identity

    def get_user_and_group(self):
        """
        Get the current user and group from a request.
        """
        headers = request.headers
        auth = headers['Authorization']

        if auth:
            token = auth.split(" ")[1]
            decoded_token = jwt.decode(token, self.app.config['JWT_SECRET_KEY'])
            identity = decoded_token['identity']
            user_group = identity.split(";")
            return user_group
        return []

    @cross_origin()
    def login(self):
        """
        Use this endpoint to login and to obtain a token.
        Must be provided with ldap user credentials.
        """
        username = request.json.get('username', None)
        password = request.json.get('password', None)

        if not username and not password:
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
        Search for endpoints that are allowed to be called without authentication.
        Otherwise find the token and then authenticate.
        """
        auth_endpoints = self.app.config['LDAP_AUTH_ENDPOINTS']
        for res in auth_endpoints:
            match = re.compile(res)
            if match.fullmatch(resource) and not auth_endpoints[res]:
                return True

        return super(APIMockTokenAuthenticator, self).authorized(allowed_roles, resource, method)
