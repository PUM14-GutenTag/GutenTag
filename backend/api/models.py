import datetime
from api import db


class Test(db.Model):
    __tablename__ = "test"

    id = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        return f"<Test {self.id}>"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)

    def __init__(self, email):
        self.email = email

class Project(db.Model):
    __tablename__ = "projects"

    # I have no clue how this works. It's only guessing.
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    project_type = db.Column(db.String(128), unique=True, nullable=False)
    updated = db.Column(db.DateTime)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow)
