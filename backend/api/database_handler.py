"""
This file contains all functions for the database handler.
"""
from api.models import User, Project, ProjectData, Label
from api import db, SQLAlchemy, ProjectType


def check_type(val, t):
    return isinstance(val, t)


def try_add(object):
    try:
        db.session.add(object)
        db.session.commit()
        msg = f"{type(object).__name__} '{object}' created."
        print("try")
    except Exception as e:
        db.session.rollback()
        msg = f"Could not create {type(object).__name__}: {e}"
        print("except")
    finally:
        print(msg)
        return {
            "id": object.id,
            "message": msg
        }


def try_delete(object):
    try:
        db.session.delete(object)
        db.session.commit()
        msg = f"{type(object).__name__} '{object}' deleted."
    except Exception as e:
        db.session.rollback()
        msg = f"Could not delete {type(object).__name__}: {e}"
    finally:
        print(msg)
        return {
            "id": object.id,
            "message": msg
        }


def create_user(first_name, last_name, email, isAdmin=False):
    """
    Function creates a user in the database and returns a message.
    """
    for arg, t in [(first_name, str), (last_name, str), (email, str),
                   (isAdmin, bool)]:
        if not check_type(arg, t):
            return {
                "id": None,
                "message": ("Could not create user:"
                            f"arg '{arg}' is not a '{t}'.")
            }

    user = User(first_name=first_name, last_name=last_name, email=email,
                access_level=int(isAdmin))
    return try_add(user)


def create_project(project_name, project_type):
    """
    Function creates a project in the database and returns a message.
    """
    for arg, t in [(project_name, str), (project_type, int)]:
        if not check_type(arg, t):
            return f"Could not create project: arg '{arg}' is not a '{type}'"
    project = Project(name=project_name, project_type=project_type)
    return try_add(project)


def add_data(project_id, data, project_type):
    """
    Function adds data to an existing project and returns a message.
    """
    for arg, t in [(project_id, int), (data, str), (project_type, int)]:
        if not check_type(arg, t):
            return f"Could not add data: arg '{arg}' is not a '{t}'."
    project_data = ProjectData(project_id=project_id,
                               data=data,
                               project_type=project_type)
    return try_add(project_data)


def delete_project(project_id):
    """
    Function deletes an existing project from
    the database and returns a message.
    """
    for arg, t in [(project_id, int)]:
        if not check_type(arg, t):
            return f"Could not delete project: arg '{arg}' is not a '{t}.'"
    project = Project.query.get(project_id)
    return try_delete(project)


def authorize_user(project_id, user_id):
    """
    Function adds an existing user to an existing project
    and returns a message.
    """
    for arg, t in [(project_id, int), (user_id, int)]:
        if not check_type(arg, t):
            return f"Could not authorize user: arg '{arg}' is not a '{t}'."
    try:
        project = Project.query.get(project_id)
        user = User.query.get(user_id)

        user.projects.append(project)
        db.session.commit()
        return f"{user} added to {project}."
    except Exception as e:
        db.session.rollback
        return f"Could not authorize user: {e}"


def deauthorize_user(project_id, user_id):
    """
    Function removes an existing user from an existing project
    and returns a message.
    """
    for arg, t in [(project_id, int), (user_id, int)]:
        if not check_type(arg, t):
            return f"Could not deauthorize user: arg '{arg}' is not a '{t}'."
    try:
        project = Project.query.get(project_id)
        user = User.query.get(user_id)

        user.projects.remove(project)
        db.session.commit()
        return f"{user} remove from {project}."
    except Exception as e:
        db.session.rollback
        return f"Could not deauthorize user: {e}"


def label_data(project_id, data_id, user_id, label):
    """
    Function adds a label to a data object and returns a message.
    """
    for arg, t in [(project_id, int), (data_id, int), (user_id, int),
                   (label, str)]:
        if not check_type(arg, t):
            return f"Could not create label_data: arg '{arg}' is not a '{t}'."
    label_data = Label(project_id=project_id,
                       data_id=data_id,
                       user_id=user_id,
                       label=label)
    return try_add(label_data)


def remove_label(label_id):
    """
    Function removes an existing label from the databse
    and returns a message.
    """
    for arg, t in [(label_id, int)]:
        if not check_type(arg, t):
            return f"Could not create label: arg '{arg}' is not a '{t}'."
    label = Project.query.get(label_id)
    return try_delete(label)


def reset_db():
    """
    WARNING: use carefully!
    Remove all tables from the database (including all data) and recreate it
    according to models.py.
    """
    db.drop_all()
    db.create_all()
    db.session.commit()
