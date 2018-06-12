"""
Api for a GO service.
"""
from functools import partial
from os import environ

from eve import Eve
from flask_jwt_extended import JWTManager

from api import API, APITokenAuthenticator, PatternValidator

token_auth = APITokenAuthenticator()

app = Eve(template_folder='/root', auth=token_auth)
app.validator = partial(PatternValidator, app)
token_auth.jwt_app(app)

jwt_manager = JWTManager(app)
api = API(app)

"""
Link the appropriate functions in the API class to their
corresponding functions in the EVE API. Also link the login
function provided by the APIAuthentication class.
"""
# pylint: disable=no-member
app.on_insert += api.insert
app.on_pre_DELETE += api.pre_delete
app.on_deleted_item += api.deleted_item
app.on_inserted += api.inserted_item
app.on_pre_PATCH += api.pre_patch
app.on_updated += api.updated_item

app.add_url_rule('/api/login', 'login', app.auth.login,
                 methods=['POST', 'OPTIONS'])
app.view_functions['login'] = app.auth.login
app.add_url_rule('/api/refresh', 'refresh', app.auth.refresh,
                 methods=['POST', 'OPTIONS'])
app.view_functions['refresh'] = app.auth.refresh


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
