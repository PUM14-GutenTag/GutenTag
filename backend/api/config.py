import os


class Config(object):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgres://")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
