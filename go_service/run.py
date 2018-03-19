"""
Api for a GO service.
"""
import logging
from functools import partial
from os import environ

from eve import Eve
from flask_jwt_extended import JWTManager

from api import API, APITokenAuthenticator, PatternValidator

if environ.get('API_TEST') is not None and environ.get('API_TEST') == 'True':
    from tests.mock_api import APIMockTokenAuthenticator
    token_auth = APIMockTokenAuthenticator()
else:
    token_auth = APITokenAuthenticator()

app = Eve(template_folder='/root', auth=token_auth)
app.validator = partial(PatternValidator, app)
token_auth.jwt_app(app)

handler = logging.FileHandler('/app/logs/go-service-api.log')
handler.setLevel(logging.DEBUG)
app.logger.addHandler(handler)

jwt_manager = JWTManager(app)
api = API(app)

"""
Link the appropriate functions in the API class to their
corresponding functions in the EVE API. Also link the login
function provided by the APIAuthentication class.
"""
app.on_insert += api.insert # pylint: disable=no-member
app.on_pre_DELETE += api.pre_delete # pylint: disable=no-member
app.on_deleted_item += api.deleted_item # pylint: disable=no-member
app.on_inserted += api.inserted_item # pylint: disable=no-member
app.on_pre_PATCH += api.pre_patch # pylint: disable=no-member
app.on_updated += api.updated_item # pylint: disable=no-member

app.add_url_rule('/login', 'login', app.auth.login, methods=['POST', 'OPTIONS'])
app.view_functions['login'] = app.auth.login
app.add_url_rule('/refresh', 'refresh', app.auth.refresh, methods=['POST', 'OPTIONS'])
app.view_functions['refresh'] = app.auth.refresh
