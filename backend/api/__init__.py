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

app = Flask(__name__)
app.config.from_object("api.config.Config")
app.config['CORS_HEADERS'] = 'Authorization, Content-Type'
app.config['JWT_SECRET_KEY'] = 't1NP63m4wnAc4KzBAKukd7ZpKOAI4nss'

CORS(app)
rest = Api(app)
db = SQLAlchemy(app)
enable_batch_inserting(SignallingSession)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

IS_DEV_MODE = os.environ.get("FLASK_ENV", "development") == "development"

# This should NOT be at the top of the file. Build will fail. See
# https://flask.palletsprojects.com/en/1.1.x/patterns/packages/
import api.routes  # noqa
