"""
Go Service

Routes incoming alias by locating matching pattern and target in the database
if the pattern is a capture group it uses standard regex substitution to
construct the modified target from the incoming alias.
"""
import re
from logging import StreamHandler

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

# Add logging capabilities.
app.logger.addHandler(StreamHandler())


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

    unsorted = list(mongo.db.aliases_db.find(query))

    # Sort list by longest pattern first
    result = sorted(unsorted, key=lambda k: len(k['pattern']), reverse=True)

    app.logger.debug("Result: %s", result)

    for item in result:
        match = re.match(item['pattern']+"$", alias, re.I)
        if match:
            # Only substitute matching part of alias
            app.logger.debug("Item: %s", item)
            target = re.sub(
                "^" + item['pattern'] + "$", # make sure entire pattern
                item['target'],
                match.group(0), # only matching part not entire alias
                flags=re.I # case insensitive
            )
            app.logger.debug("Target: %s", target)
            return redirect(target)

    abort(404)
    return redirect('localhost')  # Consistent return statement
