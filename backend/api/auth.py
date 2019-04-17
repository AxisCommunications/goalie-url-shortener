"""
Authentication Classes used by the go/ api.

JWTAuth - Eve authentication class
http://python-eve.org/authentication.html#token-based-authentication
"""

import datetime
import ssl

import jwt
from bson.errors import BSONError
from bson.objectid import ObjectId
from eve.auth import TokenAuth
from eve.render import send_response
from flask import jsonify, request
from ldap3 import SUBTREE, Connection, Server, Tls
from ldap3.core.exceptions import LDAPException


class JWTAuth(TokenAuth):
    """Rewritten Token Authenticator class that utilizes a ldap connection for
    the initial authentication then continues the authentication with JWT
    tokens."""

    def __init__(self):
        self.app = None
        self.server = None

    def initiate(self, app):
        """Creates a reference to the app object and initiates the ldap
        connection by setting configuration options and binding lazily"""
        self.app = app

        # Set up TLS configuration for ldap connection
        tls = Tls(
            validate=ssl.CERT_REQUIRED,
            version=ssl.PROTOCOL_TLSv1,
            ca_certs_file="/run/secrets/ldap_ca_crt",
        )

        # Configure ldap server settings
        self.server = Server(
            host=self.app.config["LDAP_URI"], use_ssl=True, tls=tls, get_info=None
        )

    def create_token(self, identity, admin=False):
        """ Returns a jwt token from the identity and admin fields. """
        iat = datetime.datetime.utcnow()  # issued at time
        delta = self.app.config.get("JWT_EXP_DELTA", 20)
        exp = iat + datetime.timedelta(minutes=delta)  # expiration time

        payload = {"iat": iat, "exp": exp, "identity": identity, "admin": admin}

        return jwt.encode(payload, self.app.config.get("JWT_SECRET"), algorithm="HS256")

    def refresh(self):
        """ A flask endpoint to refresh the jwt token. Must be provided with a
        valid jwt token. """
        method = request.method
        resource = request.endpoint.split("|")[0]  # /refresh -> refresh

        if method == "OPTIONS":  # CORS request
            return send_response(resource, None)

        if not request.is_json:
            return jsonify({"msg": "Missing JSON in request"}), 400

        token = request.json.get("token", None)
        if not token:
            return jsonify({"msg": "Missing token parameter"}), 400

        try:
            payload = jwt.decode(
                token, self.app.config.get("JWT_SECRET"), algorithms="HS256"
            )
        except jwt.exceptions.DecodeError:
            return jsonify({"msg": "Invalid token"}), 401

        identity = payload.get("identity", "")
        admin = payload.get("admin", False)
        token = self.create_token(identity, admin=admin)

        return send_response(resource, ({"token": token},))

    def login(self):
        """ A flask endpoint to login and to obtain a token. Must be provided
        with valid ldap user credentials. """
        method = request.method
        resource = request.endpoint.split("|")[0]  # /login -> login

        if method == "OPTIONS":  # CORS request
            return send_response(resource, None)

        if not request.is_json:
            return jsonify({"msg": "Missing JSON in request"}), 400

        username = request.json.get("username", None).lower()  # Note lowercase
        password = request.json.get("password", None)
        if not username:
            return jsonify({"msg": "Missing username parameter"}), 400
        if not password:
            return jsonify({"msg": "Missing password parameter"}), 400

        user = "{}@{}".format(username, self.app.config["LDAP_EMAIL_DOMAIN"])

        ldap_filter = "(&({user_key}={user})({admin_key}={admin_value}))".format(
            user_key=self.app.config["LDAP_USER_KEY"],
            user=username,
            admin_key=self.app.config["LDAP_ADMIN_KEY"],
            admin_value=self.app.config["LDAP_ADMIN_VALUE"],
        )

        try:
            with Connection(
                self.server,
                user=user,
                password=password,
                read_only=True,
                raise_exceptions=True,
            ) as conn:

                conn.search(
                    search_base=self.app.config["LDAP_SEARCH_BASE"],
                    search_filter=ldap_filter,
                    search_scope=SUBTREE,
                )

                if conn.entries:
                    token = self.create_token(username, admin=True)
                else:
                    token = self.create_token(username, admin=False)
                response = send_response(resource, ({"token": token},))
                return response
        except LDAPException:
            # LDAP error the user credentials are not valid
            return jsonify({"msg": "Invalid credentials"}), 401

    def check_auth(self, token, allowed_roles, resource, method):
        """Checks if authentication provided is valid and if the user is
        authorized on the resource"""

        path = request.path.split("/")[-1]

        try:
            payload = jwt.decode(
                token, self.app.config.get("JWT_SECRET"), algorithms="HS256"
            )
            identity = payload.get("identity")
            admin = payload.get("admin", False)

            # Posting new shortcut
            if path == "shortcuts" and method == "POST" and identity:
                ldapuser = request.json.get("ldapuser")
                return identity == ldapuser

            # Patching or deleting existing shortcut
            elif method == "PATCH" or method == "DELETE":
                if admin:
                    return True

                item_id = path
                shortcuts = self.app.data.driver.db["shortcuts"]
                shortcut = shortcuts.find_one({"_id": ObjectId(item_id)})
                ldapuser = shortcut.get("ldapuser")

                if ldapuser and identity:
                    return ldapuser == identity

        except jwt.exceptions.DecodeError:  # Invalid token
            return False
        except BSONError:  # Invalid _id field
            return False
        return False  # Default case
