"""
Go Service

Accepts a string which it compares against a database. The most
significant pattern that matches with the string gives a target
which the service then redirects to.
"""
import logging
import re
from functools import partial

from flask import Flask, abort, redirect
from pymongo import MongoClient
from werkzeug.routing import BaseConverter


class AliasConverter(BaseConverter):
    """
    Class for converting an incoming request to a target.
    """
    NOT_FOUND = 404
    FORBIDDEN = 403

    def __init__(self, application, url_map, *items):
        super(AliasConverter, self).__init__(url_map)
        self.regex = items[0]
        self.app = application

    def get_match_strength(self, match, pattern):
        """
        Calculate the difference between the match and the pattern.

        This will give an index of how much they differ.
        """
        return len(pattern) - len(match)

    def get_closest_match(self, found_aliases):
        """
        Find the closest alias using the similarity score.
        """
        closest = None
        self.app.logger.debug(found_aliases)

        for alias in found_aliases:
            if not closest:
                closest = [alias] + found_aliases[alias]

            matched_alias = found_aliases[alias]

            if (self.get_match_strength(alias, matched_alias[0]) <
                    self.get_match_strength(closest[0], closest[1])):
                closest = [alias] + matched_alias

        self.app.logger.debug(closest)
        return closest[3]

    def redirect_alias(self, alias):
        """
        Getting a alias, check which pattern that gives the highest similarity
        score and redirect to the target.
        """
        dbclient = MongoClient(self.app.config['MONGO_HOST'], self.app.config['MONGO_PORT'])
        aliases = dbclient.aliases_db[self.app.config['MONGO_DBNAME']]

        alias_groups = alias.split('/')
        alias = alias_groups[0]

        found_aliases_n = {}
        for doc in aliases.find({}):
            if doc['pattern'] and alias:

                matched_alias = re.findall(doc['pattern'], alias)
                if matched_alias:
                    target = aliases.find_one({'pattern': doc['pattern']})['target']
                    found_aliases_n[matched_alias[0]] = [alias] + [doc['pattern']] + [target]
        if len(found_aliases_n) == 0:
            abort(self.NOT_FOUND)

        target = self.get_closest_match(found_aliases_n)

        match_group = "\{\{[\d]+\}\}" #pylint: disable=anomalous-backslash-in-string
        found_groups = re.findall(match_group, target)

        if (len(found_groups) < len(alias_groups) - 1):
            abort(self.FORBIDDEN)
        else:
            for i in range(len(alias_groups)-1):
                if (alias_groups[i]):
                    target = target.replace(found_groups[i], alias_groups[i+1])

            leftovers = re.search(match_group, target)
            if (leftovers):
                target = target[:leftovers.start()-1]

        return target

    def to_python(self, value):
        """
        Return the python object to the redirect.
        """
        target = self.redirect_alias(value)
        app.logger.debug("To python {}".format(target))

        return target

    def to_url(self, value):
        """
        Return the url to the redirect.
        """
        app.logger.debug("To url {}".format(value))
        return value

"""
Initialize the application.
"""
app = Flask(__name__)
app.config.from_pyfile('settings.py', silent=True)

"""
Add logging capabilities.
"""
handler = logging.FileHandler('/app/logs/go-service.log', mode='w')
handler.setLevel(app.config['LOGGING_LEVEL'])
app.logger.addHandler(handler)

"""
Add a alias converter.
"""
app.url_map.converters['alias'] = partial(AliasConverter, app)
app.logger.debug("Service started")

@app.route('/<alias(".*"):target>')
def catch_redirect(target):
    return redirect(target)
