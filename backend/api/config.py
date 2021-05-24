import os


class Config(object):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgres://")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "use_batch_mode": True
    }
