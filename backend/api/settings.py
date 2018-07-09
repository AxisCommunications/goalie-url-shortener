"""
Settings file for the API.
"""

# LDAP configuration
LDAP_SERVER = 'ldap.example.com'
LDAP_SECURE_PORT = 636
LDAP_SEARCH_BASE = 'dc=example,dc=com'
LDAP_USER_FIELD = 'sAMAccountName'
LDAP_ADMIN_FIELD = 'memberOf'
LDAP_ADMIN_GROUP = \
    'cn=org-example,ou=role,ou=groups,dc=example,dc=com'

# JWT authentication settings
JWT_EXP_DELTA = 20

############################################################
# Python Eve configuration http://python-eve.org/config.html
############################################################

# Database configuration
MONGO_URI = 'mongodb://{host}:{port}/{database}'.format(
    host='db',
    port=27028,
    database='aliases_db'
)
MONGO_QUERY_BLACKLIST = ['$where']  # Enables the regex feature

# Turn off XML and only utilize the JSON renderer
RENDERERS = ['eve.render.JSONRenderer']

# Allowed resource methods
RESOURCE_METHODS = ['GET', 'POST']
# Resource methods that does not require authentication
PUBLIC_METHODS = ['GET']

# Allowed item methods
ITEM_METHODS = ['GET', 'PATCH', 'DELETE']
# Item methods that does not require authentication
PUBLIC_ITEM_METHODS = ['GET']

# Disables concurrency control http://python-eve.org/features.html#concurrency
IF_MATCH = False
# Disables bulk inserts
BULK_ENABLED = False


# Makes development easier can be deleted for increased security
X_DOMAINS = '*'
# X_ALLOW_CREDENTIALS = True
X_HEADERS = ['Authorization', 'Content-Type']
X_EXPOSE_HEADERS = ['Authorization', 'Content-Type']
# How long the client should cache the response
CACHE_CONTROL = 'max-age=6'

# Let every request go to /api/<endpoint>
URL_PREFIX = 'api'

# Data validation http://python-eve.org/validation.html
DOMAIN = {
    'shortcuts': {
        'item_title': 'shortcuts',
        'datasource': {
            'source': 'aliases_db'
        },
        'schema': {
            'pattern': {
                'type': 'string',
                'validator': 'regex',
                'required': True,
                'unique': True,
            },
            'target': {
                'type': 'string',
                'validator': 'target',
                'required': True
            },
            'ldapuser': {
                'type': 'string',
                'required': True
            }
        }
    }
}
