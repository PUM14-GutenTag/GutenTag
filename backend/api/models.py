"""
This file contains all database models.
"""
import datetime
from api import db


# The association table between user and project.
access_control_table = db.Table("access_control", db.Model.metadata,
                                db.Column('project_id', db.Integer,
                                          db.ForeignKey('project.id')),
                                db.Column('user_id', db.Integer,
                                          db.ForeignKey('users.id'))
                                )


class Test(db.Model):
    """
    This is a testing table not intended for the final product.
    """
    __tablename__ = "test"

    id = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        return f"<Test {self.id}>"


class User(db.Model):
    """
    User contains information about the users, has information about which
    projects each users are relatd to.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.Text, nullable=False)
    last_name = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    access_level = db.Column(db.Integer, nullable=False,
                             default=0)  # 0=user, 1=admin

    projects = db.relationship(
        "Project", secondary=access_control_table, back_populates="users")

    def __repr__(self):
        return (
            f"<User(first_name={self.first_name}, last_name={self.last_name}, "
            f"email={self.email}, access_level={self.access_level})>"
        )


class Project(db.Model):
    """
    Project contain information about what users are related to this project
    and what type of project it is .
    """
    __tablename__ = "project"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    project_type = db.Column(db.Integer, nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.now())

    users = db.relationship(
        "User", secondary=access_control_table, back_populates="projects")

    def __repr__(self):
        return f"<Projectname={self.name}, Associated users={self.users}>"


class ProjectData(db.Model):
    """
    Project_data contains information about what project it is related to and
    what data it is.
    """
    __tablename__ = "project_data"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    data = db.Column(db.Text)
    prelabel = db.Column(db.Text)
    project_type = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.now())


class Label(db.Model):
    """
    Label contains the label for a certain piece of data.
    """
    __tablename__ = "labels"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    data_id = db.Column(db.Integer, db.ForeignKey('project_data.id'))
    label = db.Column(db.Text, nullable=False)
    updated = db.Column(db.DateTime, default=datetime.datetime.now())
    created = db.Column(db.DateTime, default=datetime.datetime.now())
