"""
Settings file for the API.
"""
from os import getenv

# LDAP configuration
LDAP_URI = getenv('LDAP_URI', default='ldap://ldap.example.com')
LDAP_SEARCH_BASE = getenv('LDAP_SEARCH_BASE', default='dc=example,dc=com')
LDAP_USER_KEY = getenv('LDAP_USER_KEY', default='sAMAccountName')
LDAP_EMAIL_DOMAIN = getenv('LDAP_EMAIL_DOMAIN', default='example.com')
LDAP_ADMIN_KEY = getenv('LDAP_ADMIN_KEY', default='memberOf')
LDAP_ADMIN_VALUE = getenv(
    'LDAP_ADMIN_VALUE', default='cn=admins,dc=example,dc=com')

# JWT authentication settings in minutes
JWT_EXP_DELTA = 20

############################################################
# Python Eve configuration http://python-eve.org/config.html
############################################################

# Database configuration
MONGO_URI = getenv('MONGO_URI', default='mongodb://db:27017/go')
MONGO_QUERY_BLACKLIST = ['$where']  # Removes $regex from blacklist

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
X_HEADERS = ['Authorization', 'Content-Type']
X_EXPOSE_HEADERS = ['Authorization', 'Content-Type']
# How long the client should cache the response
CACHE_CONTROL = 'max-age=6'

# Let every request go to /api/<endpoint>
URL_PREFIX = 'api'

# Data validation http://python-eve.org/validation.html
DOMAIN = {
    'shortcuts': {  # This name becomes the database collection
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
