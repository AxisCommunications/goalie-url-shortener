import logging
import ssl

MONGO_HOST = 'db'
MONGO_PORT = 27028
MONGO_DBNAME = 'aliases_db'
MONGO_QUERY_BLACKLIST = []

XML = False
JSON = True

LDAP_SERVER = 'ldap://ldap.example.com'
LDAP_PORT = 8080

LDAP_USE_TLS = False
LDAP_REQUIRE_CERT = ssl.CERT_NONE
AUTH_LDAP_INITIAL_PATTERN = "{}@example.com"
AUTH_LDAP_INITIAL_AS_USER = True
LDAP_AUTH_BASEDN = 'dc=example,dc=com'
LDAP_SAMACCOUNT_FILTER = "(sAMAccountName={})"
LDAP_GROUP_SEARCH_FILTER = "(&" + LDAP_SAMACCOUNT_FILTER + "(memberOf={}))"
LDAP_CN_MATCH = 'CN=([^,]+),.*'

LDAP_TOOLS_ADMIN_GROUPS = ["cn=org-example,ou=role,ou=groups,dc=example,dc=com",
                           "cn=org-example,ou=role,ou=groups,dc=example,dc=com",
                           "cn=org-example,ou=role,ou=groups,dc=example,dc=com"]
LDAP_AUTH_ENDPOINTS = {"api\/all": False,  # pylint: disable=anomalous-backslash-in-string
                       "api\/all\/.+": False,  # pylint: disable=anomalous-backslash-in-string
                       "api": True}

RESOURCE_METHODS = ['GET', 'PATCH', 'POST']
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']
ITEM_LOOKUP = True

IF_MATCH = False
BULK_ENABLED = False
SOFT_DELETE = False

X_DOMAINS = '*'
X_ALLOW_CREDENTIALS = True
X_HEADERS = ['Authorization', 'Content-Type']
X_EXPOSE_HEADERS = ['Authorization', 'Content-Type']

CACHE_CONTROL = 'max-age=6'
CACHE_EXPIRES = 6

LOGGING_LEVEL = logging.DEBUG

schema = {
    'pattern': {
        'type': 'urlpattern',
        'required': True,
        'unique': True,
    },
    'target': {
        'type': 'string',
        'required': True
    },
    'ldapuser': {
        'type': 'string'
    }
}

all_alias = {
    'item_title': 'all',
    'resource_methods': ['GET'],
    'datasource': {
        'source': 'aliases_db',
        'projection': {
            'pattern': 1,
            'target': 1,
            'ldapuser': 1}
    }
}

get_ldapuser_alias = {
    'url': 'api/all/<regex("[\w\s]+"):ldapuser>',  # pylint: disable=anomalous-backslash-in-string
    'item_title': 'ldapuser/alias',
    'resource_methods': ['GET'],
    'datasource': {
        'source': 'aliases_db'
    },
    'schema': schema
}

alias = {
    'item_title': 'alias',
    'resource_methods': ['POST'],
    'item_methods': ['DELETE', 'PATCH', 'PUT'],
    'datasource': {
        'source': 'aliases_db'
    },
    'schema': schema
}

DOMAIN = {
    'api/all': all_alias,
    'api/all/user': get_ldapuser_alias,
    'api': alias
}
