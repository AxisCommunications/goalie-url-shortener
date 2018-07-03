"""
Run configuration for the GO service.
"""
from eve import Eve

from api import JWTAuth, PatternValidator

app = Eve(template_folder='/root',  # pylint: disable=invalid-name
          auth=JWTAuth(),
          validator=PatternValidator,
          settings='settings.py')

app.add_url_rule('/api/login',
                 endpoint='login',
                 view_func=app.auth.login,
                 methods=['POST', 'OPTIONS'])

app.add_url_rule('/api/refresh',
                 endpoint='refresh',
                 view_func=app.auth.refresh,
                 methods=['POST', 'OPTIONS'])

app.auth.initiate(app)
