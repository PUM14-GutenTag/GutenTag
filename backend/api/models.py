import datetime
from api import db


access_control_table = db.Table("access_control", db.Model.metadata,
                                db.Column('project_id', db.Integer,
                                          db.ForeignKey('project.id')),
                                db.Column('user_id', db.Integer,
                                          db.ForeignKey('users.id'))
                                )


class Test(db.Model):
    __tablename__ = "test"

    id = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        return f"<Test {self.id}>"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(128), nullable=False)
    lastname = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)

    projects = db.relationship(
        "Project", secondary=access_control_table, back_populates="users1")

    def __init__(self, firstname, lastname, email):
        self.firstname = firstname
        self.lastname = lastname
        self.email = email

    def __repr__(self):
        return f"<User(firstname={self.firstname}, lastname={self.lastname}, email={self.email})>"


class Project(db.Model):
    __tablename__ = "project"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    project_type = db.Column(db.String(128), nullable=False)
    updated = db.Column(db.DateTime)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    users1 = db.relationship(
        "User", secondary=access_control_table, back_populates="projects")


class Project_data(db.Model):
    __tablename__ = "project_data"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    prelabel = db.Column(db.String(128))
    project_type = db.Column(db.String(128), nullable=False)
    updated = db.Column(db.DateTime)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class Label(db.Model):
    __tablename__ = "labels"

    id = db.Column(db.Integer, primary_key=True)
    # Is this neccessary, cause you can go through the data.
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    data_id = db.Column(db.Integer, db.ForeignKey('project_data.id'))
    label = db.Column(db.String(128), nullable=False)
