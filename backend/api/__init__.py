# flake8: noqa
"""
Initialization file for the api package.
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy, SignallingSession
from sqlalchemy_batch_inserts import enable_batch_inserting
from flask_cors import CORS
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
import secrets
import string

# THIS NEEDS TO BE SET TO A RANDOM STRING
# EXAMPLE JWT: 7JVcd7f8CVdCcqrTyNLNoBWVUt5U00jrJSCkm3tu
# DO NOT USE THIS IN PRODUCTION
JWT_SECRET_KEY = ""


class SecretKeyNotSetException(Exception):
    """ Explanatory exception in case JWT_SECRET_KEY is not set.  """
    pass


app = Flask(__name__)
app.config.from_object("api.config.Config")
app.config['CORS_HEADERS'] = 'Authorization, Content-Type'

CORS(app)
rest = Api(app)
db = SQLAlchemy(app)
enable_batch_inserting(SignallingSession)
bcrypt = Bcrypt(app)
if not app.debug:
    if JWT_SECRET_KEY != "":
        app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
        jwt = JWTManager(app)
    else:
        raise SecretKeyNotSetException(
            "JWT Secret Key is not set in backend/api/__init__.py")
else:
    # FOR DEVELOPMENT ONLY
    # DO NOT USE THIS KEY IN PRODUCTION
    app.config['JWT_SECRET_KEY'] = "7JVcd7f8CVdCcqrTyNLNoBWVUt5U00jrJSCkm3tu"
    jwt = JWTManager(app)

IS_DEV_MODE = os.environ.get("FLASK_ENV", "development") == "development"

# This should NOT be at the top of the file. Build will fail. See
# https://flask.palletsprojects.com/en/1.1.x/patterns/packages/
import api.routes  # noqa
