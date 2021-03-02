# flake8: noqa
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_restful import Api
from enum import IntEnum


class ProjectType(IntEnum):
    DOCUMENT_CLASSIFICATION = 1
    IMAGE_CLASSIFICATION = 2
    SEQUENCE_2_SEQUENCE = 3
    SEQUENCE_LABELING = 4

    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_


app = Flask(__name__)
app.config.from_object("api.config.Config")
CORS(app)
rest = Api(app)
db = SQLAlchemy(app)


# This should NOT be at the top of the file. Build will fail. See
# https://flask.palletsprojects.com/en/1.1.x/patterns/packages/
import api.routes  # noqa
