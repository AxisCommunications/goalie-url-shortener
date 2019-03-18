"""
Validators used by the go/ api.

PatternValidator - Cerberus validation class
http://python-eve.org/validation.html#custom-data-types

"""

import re

from eve.io.mongo import Validator


REG = re.compile(
    "^" +
    # Protocol identifier
    "(?:(?:https?|ftp)://)" +
    # user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" + "(?:" +
    # IP address dotted notation octets
    # excludes loopback network 0.0.0.0
    # excludes reserved space >= 224.0.0.0
    # excludes network & broacast addresses
    # (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])"
    + "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}"
    + "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))"
    + "|"
    +
    # host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
    # domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
    # TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    # TLD may end with dot
    "\\.?" + ")" +
    # port number
    "(?::\\d{2,5})?" +
    # resource path
    "(?:[/?#]\\S*)?" + "$",
    re.IGNORECASE,
)


class PatternValidator(Validator):
    """ Extends the Cerberus validation with custom rules. """

    def _validator_target(self, field, value):
        """ Test if valid target field. """
        if not REG.match(value):
            self._error(field, "{} is not a valid target".format(value))

    def _validator_regex(self, field, value):
        """ Test to make sure valid regex value. """
        try:
            re.compile(value)
        except re.error:
            self._error(field, "{} is not a valid regex".format(value))

