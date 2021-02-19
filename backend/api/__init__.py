# flake8: noqa
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


app = Flask(__name__)
app.config.from_object("api.config.Config")
CORS(app)
db = SQLAlchemy(app)


# This should NOT be at the top of the file. Build will fail. See https://flask.palletsprojects.com/en/1.1.x/patterns/packages/
import api.routes  # noqa
