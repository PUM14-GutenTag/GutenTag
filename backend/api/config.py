import os


class Config(object):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgres://")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "use_batch_mode": True
    }
