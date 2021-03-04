"""
This file contains all functions for the database handler.
"""
from api.models import User, Project, Label, ProjectType, AccessLevel
from api import db


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


def create_user(first_name, last_name, email, isAdmin=False):
    """
    Function creates a user in the database.
    Returns user id and a status message.
    """
    for arg, t in [(first_name, str), (last_name, str), (email, str),
                   (isAdmin, bool)]:
        if not isinstance(arg, t):
            return {
                "id": None,
                "message": ("Could not create user:"
                            f"arg '{arg}' is not a '{t}'.")
            }

    access = AccessLevel.ADMIN if isAdmin else AccessLevel.USER
    user = User(first_name=first_name, last_name=last_name, email=email,
                access_level=access)
    return try_add(user)


def create_project(project_name, project_type):
    """
    Function creates a project in the database
    Returns project id and a status message.
    """
    for arg, t in [(project_name, str), (project_type, int)]:
        if not isinstance(arg, t):
            return {
                "id": None,
                "message": ("Could not create project:"
                            f"arg '{arg}' is not a '{type}'.")
            }
    project = Project(name=project_name, project_type=project_type)
    return try_add(project)


def add_data(project_id, data, project_type):
    """
    Function adds data to an existing project.
    Returns data id and a status message.
    """
    for arg, t in [(project_id, int), (data, str), (project_type, int)]:
        if not isinstance(arg, t):
            return {
                "id": None,
                "message": ("Could not add data:"
                            f"arg '{arg}' is not a '{type}'.")
            }
    project_data = ProjectData(project_id=project_id,
                               data=data,
                               project_type=project_type)
    return try_add(project_data)


def delete_project(project_id):
    """
    Function deletes an existing project from the database.
    Returns project id and a status message.
    """
    for arg, t in [(project_id, int)]:
        if not isinstance(arg, t):
            return {
                "id": None,
                "message": ("Could not delete project:"
                            f"arg '{arg}' is not a '{type}'.")
            }
    project = Project.query.get(project_id)
    return try_delete(project)


def authorize_user(project_id, user_id):
    """
    Function adds an existing user to an existing project and returns a
    message.
    """
    for arg, t in [(project_id, int), (user_id, int)]:
        if not isinstance(arg, t):
            return(f"Could not authorize : arg '{arg}' is not a '{type}'.")
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


def deauthorize_user(project_id, user_id):
    """
    Function removes an existing user from an existing project and returns a
    message.
    """
    for arg, t in [(project_id, int), (user_id, int)]:
        if not isinstance(arg, t):
            return f"Could not deauthorize user: arg '{arg}' is not a '{t}'."
    try:
        project = Project.query.get(project_id)
        user = User.query.get(user_id)

        if (user not in project.users
                and user.access_level != AccessLevel.ADMIN):
            return (f"Could not deauthorize user. {user} is not authorized "
                    f"for {project}.")

        user.projects.remove(project)
        db.session.commit()
        return f"{user} remove from {project}."
    except Exception as e:
        db.session.rollback
        return f"Could not deauthorize user {user}: {e}"


def label_data(data_id, user_id, label):
    """
    Function adds a label to a data object.
    Returns label id and a status message.
    """
    for arg, t in [(data_id, int), (user_id, int),
                   (label, str)]:
        if not isinstance(arg, t):
            return {
                "id": None,
                "message": ("Could not create label_data:"
                            f"arg '{arg}' is not a '{type}'.")
            }
    label_data = Label(data_id=data_id,
                       user_id=user_id,
                       label=label)
    return try_add(label_data)


def remove_label(label_id):
    """
    Function removes an existing label from the databse.
    Returns user id and a status message.
    """
    for arg, t in [(label_id, int)]:
        if not isinstance(arg, t):
            return {
                "id": None,
                "message": ("Could not remove label:"
                            f"arg '{arg}' is not a '{type}'.")
            }
    label = Project.query.get(label_id)
    return try_delete(label)


def reset_db():
    """
    WARNING: use carefully!
    Remove all tables from the database (including all data) and recreate it
    according to models.py.
    """
    db.session.close()
    db.drop_all()
    db.create_all()
    db.session.commit()
