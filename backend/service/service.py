"""
Go Service

Routes incoming alias by locating matching pattern and target in the database
if the pattern is a capture group it uses standard regex substitution to
construct the modified target from the incoming alias.
"""
import re
from logging import Formatter, StreamHandler
from logging.handlers import RotatingFileHandler

from flask import Flask, abort, redirect
from flask_pymongo import PyMongo

# Initialize the application.
app = Flask(__name__)  # pylint: disable=invalid-name
#app.config.from_pyfile('settings.py', silent=True)
app.config.update(
    DEBUG=False, # Toggle useful debugging prints
    MONGO_HOST='db',
    MONGO_PORT=27028,
    MONGO_DBNAME='aliases_db'
)
# app.debug = True  # For debugging purposes
mongo = PyMongo(app)

# Add logging capabilities.
# HANDLER = RotatingFileHandler(
#    '/app/logs/go-service.log', maxBytes=10*1024*1024, backupCount=20)
# HANDLER.setLevel(app.config['LOGGING_LEVEL'])
#HANDLER.setFormatter(Formatter('[%(asctime)s] %(levelname)s: %(message)s'))
app.logger.addHandler(StreamHandler())


@app.route('/<path:alias>')
def go_routing(alias):
    """ Takes alias and redirects user to target found in database. """
    app.logger.debug("Alias: %s", alias)

    search = re.findall(r'\b[\w\.\_\-]+\b', alias)[0]

    query = {'$text': {
        '$search': r'"{}"'.format(search)
    }}
    app.logger.debug("Search: %s", query)

    result = mongo.db.aliases_db.find_one_or_404(query)
    app.logger.debug("Search result %s", result)

    if len(re.findall(r'\((.*?)\)', result['pattern'])) <= 1:
        # no capture group -> no insertion into target needed
        app.logger.debug("URL target: %s", result['target'])
        return redirect(result['target'])

    elif re.match(result['pattern'], alias):
        # capture group successful -> insert into target
        app.logger.debug(
            "Capture group target: %s", result['target'])
        target = re.sub(result['pattern'], result['target'], alias)
        app.logger.debug("Constructed URL target: %s", target)
        return redirect(target)

    abort(404)
    return redirect('localhost')  # Consistent return statement
