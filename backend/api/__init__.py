# flake8: noqa
from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config.from_object("api.config.Config")
db = SQLAlchemy(app)

import api.routes
