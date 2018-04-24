"""
Go Service

Routes incoming alias by locating matching pattern and target in the database
if the pattern is a capture group it uses standard regex substitution to
construct the modified target from the incoming alias.
"""
import re
import sre_constants
import sre_parse

from flask import Flask, abort, redirect
from flask_pymongo import PyMongo

# Initialize the application.
app = Flask(__name__)  # pylint: disable=invalid-name

# Basic configuration
app.config.update(
    DEBUG=False,  # Toggle useful debugging prints
    MONGO_HOST='db',
    MONGO_PORT=27028,
    MONGO_DBNAME='aliases_db'
)

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
        regex = item['pattern'] + '$'
        regex_max_width = int(sre_parse.parse(regex).getwidth()[1])
        length = len(item['pattern'])
        # Make sure ".", "*" and "?" are placed last
        alphabetical = re.sub('[.?*]', u"\U0010FFFF", item['pattern'])
        # special case for patterns with infinite wildcards like \d+ or .*
        if (regex_max_width >= int(sre_constants.MAXREPEAT)):
            # in this case we consider the longer string to be more specific
            length = -length
        return (regex_max_width, length, alphabetical)

    return sorted(shortcut_list, key=ranking)


def best_target_match(alias, items):
    """ Finds the best target to return on incoming alias and
        mongodb result """
    items = sort_regex(items)

    app.logger.debug("Sorted: %s", items)

    for item in items:
        match = re.match(item['pattern']+"$", alias, re.I)
        if match:
            # Only substitute matching part of alias
            app.logger.debug("Item: %s", item)
            target = re.sub(
                "^" + item['pattern'] + "$",  # make sure entire pattern
                item['target'],
                match.group(0),  # only matching part not entire alias
                flags=re.I  # case insensitive
            )
            app.logger.debug("Target: %s", target)
            return target


@app.route('/<path:alias>')
def go_routing(alias):
    """ Takes alias and redirects user to target found in database. """
    app.logger.debug("Alias: %s", alias)

    # Reverse regex match
    query = {
        '$where':
            # case insensitive and exact match
            '"{}".match(new RegExp("^" + this.pattern + "$", "i"))'.
            format(alias)
    }

    app.logger.debug("Search: %s", query)
    result = list(mongo.db.aliases_db.find(query))
    app.logger.debug("Result: %s", result)
    target = best_target_match(alias, result)
    if target is not None:
        return redirect(target)
    abort(404)
    return redirect('localhost')  # Consistent return statement
