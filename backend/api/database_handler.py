"""
This file contains all functions for the database handler.
"""
from api.models import (
    User,
    Project,
    Label,
    ProjectData,
    AccessLevel,
)
from api import db
from flask_jwt_extended import create_access_token, create_refresh_token
import random

import sys


def try_add(object):
    """
    Try to add the column 'object' to its table in the database. Returns its ID
    and a status message.
    """
    try:
        db.session.add(object)
        db.session.commit()
        msg = f"{type(object).__name__} '{object}' created."
    except Exception as e:
        db.session.rollback()
        msg = f"Could not create {type(object).__name__}: {e}"
        print(e, sys.stdout)
    finally:
        return {
            "id": object.id,
            "message": msg
        }


def try_delete(object):
    """
    Try to delete the column 'object' to its table in the database.
    Returns its ID and a status message.
    """
    try:
        db.session.delete(object)
        db.session.commit()
        msg = f"{type(object).__name__} '{object}' deleted."
        id = object.id
    except Exception as e:
        db.session.rollback()
        msg = f"Could not delete {type(object).__name__}: {e}"
        id = None
    finally:
        return {
            "id": id,
            "message": msg
        }


def validate_input(input):
    """
    Takes a list of tuples containing a variable and a type.
    Tests every variable against the type to make sure all input
    variables are the expected types.
    """

    try:
        for arg, t in input:
            if not isinstance(arg, t):
                return False
        return True
    except Exception:
        return False


def create_user(first_name, last_name, email, password, isAdmin=False):
    """
    Function creates a user in the database.
    Returns user id and a status message.
    """
    if validate_input([(first_name, str), (last_name, str), (email, str),
                       (password, str), (isAdmin, bool)]):

        access = AccessLevel.ADMIN if isAdmin else AccessLevel.USER
        user = User(first_name=first_name, last_name=last_name,
                    email=email, password=password, access_level=access)
        return try_add(user)

    return {
        "id": None,
        "message": "Invalid input in create_user"
    }


def login_user(email, password):
    """
    Tries to login an user. If successful, returns
    an access token and a refresh token.
    """
    if validate_input([(email, str), (password, str)]):
        user = get_user_by("email", email)

        if user:
            if(user.check_password(password)):
                access_token = create_access_token(
                    identity=user.email)
                refresh_token = create_refresh_token(identity=user.email)

                return {
                    "message": "Logged in as {}".format(
                        user.first_name + ' ' + user.last_name),
                    "access_token": access_token,
                    "refresh_token": refresh_token
                }
            else:
                msg = "Incorrect login credentials"
        else:
            msg = "Incorrect login credentials"

    msg = "Invalid input in login user"
    return {
        "access_token": None,
        "refresh_token": None,
        "message": msg
    }


def get_user_by(column, identifier):
    """
    Function retrieves user from database matching column
    and identifier. Returns None if no user is found
    """

    columns = ["id", "email", "first_name", "last_name"]

    if column in columns and isinstance(identifier, str):
        return db.session.query(User).filter(
            getattr(User, column).ilike(identifier)).first()

    return None


def create_project(project_name, project_type):
    """
    Function creates a project in the database
    Returns project id and a status message.
    """
    if validate_input([(project_name, str), (project_type, int)]):
        project = Project(name=project_name, project_type=project_type)
        return try_add(project)

    return {"message": "Invalid input",
            "id": None}


def add_data(project_id, data, project_type):
    """
    Function adds data to an existing project.
    Returns data id and a status message.
    """

    if validate_input([(project_id, int), (data, str), (project_type, int)]):
        project_data = ProjectData(project_id=project_id,
                                   data=data,
                                   project_type=project_type)
        return try_add(project_data)

    return {"message": "Invalid input",
            "id": None}


def get_data(project_id, amount, user_id):
    """
    Function for retrieving datapoints that
    are previously unlabeled by the user
    """

    if validate_input([(project_id, int), (amount, int), (user_id, int)]):

        user_labels = db.session.query(Label).filter(
            Label.user_id == user_id
        ).all()

        project_data = db.session.query(ProjectData).filter(
            ProjectData.project_id == project_id
        ).all()

        labeled_ids = []
        unlabeled_data = {}

        for label in user_labels:
            labeled_ids.append(label.data_id)

        for data in project_data:
            if data.id not in labeled_ids:
                unlabeled_data[data.id] = data.data

        if len(unlabeled_data) > amount:
            random_numbers = random.sample(range(len(unlabeled_data)), amount)
            keys = list(unlabeled_data.keys())
            random_data = {}
            for n in random_numbers:
                random_data[keys[n]] = unlabeled_data[keys[n]]

            return random_data

        return unlabeled_data

    return {}


def delete_project(project_id):
    """
    Function deletes an existing project from the database.
    Returns project id and a status message.
    """

    if validate_input([(project_id, int)]):
        project = Project.query.get(project_id)
        return try_delete(project)

    return {"message": "Invalid input",
            "id": None}


def authorize_user(project_id, user_id):
    """
    Function adds an existing user to an existing project and returns a
    message.
    """
    if validate_input([(project_id, int), (user_id, int)]):
        try:
            project = Project.query.get(project_id)
            user = User.query.get(user_id)

            if user in project.users or user.access_level == AccessLevel.ADMIN:
                return f"{user} is already authorized for {project}."

            user.projects.append(project)
            db.session.commit()
            return f"{user} added to {project}."
        except Exception as e:
            db.session.rollback
            return f"Could not authorize user {user}: {e}"

    return {"message": "Invalid input"}


def deauthorize_user(project_id, user_id):
    """
    Function removes an existing user from an existing project and returns a
    message.
    """

    if validate_input([(project_id, int), (user_id, int)]):
        try:
            project = Project.query.get(project_id)
            user = User.query.get(user_id)

            if user not in project.users:
                if user.access_level == AccessLevel.ADMIN:
                    return (f"Could not deauthorize user. {user} is an admin.")

                return (f"Could not deauthorize user. {user} is not authorized"
                        f"for {project}.")

            user.projects.remove(project)
            db.session.commit()
            return f"{user} remove from {project}."
        except Exception as e:
            db.session.rollback
            return f"Could not deauthorize user {user}: {e}"

    return {"message": "Invalid input"}


def is_authorized(project_id, user):
    """
    Function to check if a user is authorized to a project
    """
    if validate_input([(project_id, int), (user, User)]):
        if user.access_level == AccessLevel.ADMIN:
            return True

        for project in user.projects:
            if project.id == project_id:
                return True

    return False


def label_data(data_id, user_id, label):
    """
    Function adds a label to a data object.
    Returns label id and a status message.
    """

    if validate_input([(data_id, int), (user_id, int),
                       (label, str)]):
        label_data = Label(data_id=data_id,
                           user_id=user_id,
                           label=label)
        return try_add(label_data)

    return {"message": "Invalid input", "id": None}


def remove_label(label):
    """
    Function removes an existing label from the databse.
    Returns user id and a status message.
    """

    if validate_input([(label, Label)]):
        return try_delete(label)

    return {"message": "Invalid input", "id": None}


def reset_db():
    """
    WARNING: use carefully!
    Remove all tables from the database(including all data) and recreate it
    according to models.py.
    """
    db.session.close()
    db.drop_all()
    db.create_all()
    db.session.commit()
