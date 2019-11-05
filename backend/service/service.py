"""
Go Service

Routes incoming alias by locating matching pattern and target in the database
if the pattern is a capture group it uses standard regex substitution to
construct the modified target from the incoming alias.
"""
import re
import sre_constants
import sre_parse
from os import getenv

import pymongo.errors
from flask import Flask, abort, redirect
from flask_pymongo import PyMongo

# Initialize the application.
# pylint: disable=invalid-name
app = Flask(__name__)

# Basic configuration
app.config['MONGO_URI'] = getenv('MONGO_URI', default='mongodb://db:27017/go')

# Initialize database connection
mongo = PyMongo(app)

def sort_regex(shortcut_list):
    """
    Sort list in the following order
        1. The smallest maximum width of the regex
        2. The shortest regex string
        3. Regex string in alphabetical order (exception for '.', '?')
    """
    def ranking(item):
        """ Sorting function """
        regex = item['pattern'] + '$'
        regex_max_width = int(sre_parse.parse(regex).getwidth()[1])

        # Capture group should not impact length
        l = re.sub(r'[()]', '', item['pattern'])
        # two character specifier should not impact length
        l = re.sub(r'\\(\w)', '\1', l)
        length = len(l)

        # "\d" and "\w" placed before "."
        a = re.sub(r'[\\]', u"\U0010FFFD", item['pattern'])
        # "atf" before "(atf)" with "at." last
        a = re.sub(r'[(]', '', a)
        # Make sure regex symbols after letters or numbers
        alphabetical = re.sub(r'[.?*)]', u"\U0010FFFF", a)

        # patterns with infinite wildcards like \d+ or .*
        if regex_max_width >= int(sre_constants.MAXREPEAT):
            # in this case longer string more specific
            length = -length
        return (regex_max_width, length, alphabetical)

    return sorted(shortcut_list, key=ranking)


def best_target_match(alias, items):
    """
    Finds the best target to return on incoming alias and mongodb result
    """
    items = sort_regex(items)

    for item in items:
        match = re.match(item['pattern']+"$", alias, re.I)
        if match:
            # Only substitute matching part of alias
            try:
                target = re.sub(
                    "^" + item['pattern'] + "$",  # make sure entire pattern
                    item['target'],
                    match.group(0),  # only matching part not entire alias
                    flags=re.I  # case insensitive
                )
            except sre_constants.error:
                target = item['target']
            return target


@app.route('/<path:alias>')
def go_routing(alias):
    """ Takes alias and redirects user to target found in database. """
    # Prevent database injection
    alias = alias.replace('"', '')
    # Reverse regex match
    query = {
        '$where':
            # case insensitive and exact match
            '"{}".match(new RegExp("^" + this.pattern + "$", "i"))'.
            format(alias)
    }

    result = []
    try:
        result = list(mongo.db.shortcuts.find(query))
    except pymongo.errors.OperationFailure: # Handle parse errors
        abort(400)
        return redirect('localhost')

    target = best_target_match(alias, result)
    if target is None:
        return redirect("/#?search={}".format(alias))  # Consistent return statement
    return redirect(target)
