"""
Go Service

Routes incoming alias by locating matching pattern and target in the database
if the pattern is a capture group it uses standard regex substitution to
construct the modified target from the incoming alias.
"""
import logging
import re
from logging import Formatter
from logging.handlers import RotatingFileHandler

from flask import Flask, abort, redirect
from flask_pymongo import PyMongo

# Initialize the application.
app = Flask(__name__)
app.config.from_pyfile('settings.py', silent=True)
app.debug = True # For debugging purposes

# Add logging capabilities.
handler = RotatingFileHandler('/app/logs/go-service.log', maxBytes=10*1024*1024, backupCount=20)
handler.setLevel(app.config['LOGGING_LEVEL'])
handler.setFormatter(Formatter('[%(asctime)s] %(levelname)s: %(message)s'))
app.logger.addHandler(handler)

app.logger.debug("Service started")

mongo = PyMongo(app)

@app.route('/<path:alias>')
def go_routing(alias):
    app.logger.debug("Alias: {}".format(alias))

    search = alias.split('/', maxsplit=1)[0]
    app.logger.debug("Search term: {}".format(search))

    query = { # MongoDB query, language=none to reduce unexpected behavior
        '$text': {
            '$search': search,
            '$language': 'none'
        }
    }

    result = mongo.db.aliases_db.find_one_or_404(query)
    app.logger.debug("Search result {}".format(result))

    if not re.match(r'\(.*\)', result['pattern']):
        # no capture group -> no insertion into target needed
        app.logger.debug("URL target: {}".format(result['target']))
        return redirect(result['target'])

    elif re.match(result['pattern'], alias):
        # capture group successful -> insert into target
        app.logger.debug(
            "Capture group target: {}".format(result['target']))
        target = re.sub(result['pattern'], result['target'], alias)
        app.logger.debug("Constructed URL target: {}".format(target))
        return redirect(target)

    abort(404)
