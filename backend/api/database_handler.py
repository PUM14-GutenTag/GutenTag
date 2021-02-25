'''
This file contains all functions for the database handler.
'''
from models import User, Project, Project_data, Label
from api import db


def create_user(first_name, last_name, email):
    '''
    Function creates a user in the database and returns a message.
    '''
    user = User(first_name, last_name, email)
    db.session.add(user)
    db.session.commit()
    return "User created."


def create_project(project_name, project_type):
    '''
    Function creates a project in the database and returns a message.
    '''
    project = Project(name=project_name, project_type=project_type)
    db.session.add(project)
    db.session.commit()
    return "Project created."


def add_data(project_id, data, project_type):
    '''
    Function adds data to an existing project and returns a message.
    '''
    project_data = Project_data(project_id=project_id,
                                data=data,
                                project_type=project_type)
    db.session.add(project_data)
    db.session.commit()
    return "Data added."


def delete_project(project_id):
    '''
    Function deletes an existing project from
    the database and returns a message.
    '''
    project = Project.query.get(project_id)
    db.session.delete(project)
    db.session.commit()
    return "Project deleted."


def authorize_user(project_id, user_id):
    '''
    Function adds an existing user to an existing project
    and returns a message.
    '''
    project = Project.query.get(project_id)
    user = User.query.get(user_id)

    user.projects.append(project)
    db.session.commit()
    return "User addaed to project."


def deauthorize_user(project_id, user_id):
    '''
    Function removes an existing user from an existing project
    and returns a message.
    '''
    project = Project.query.get(project_id)
    user = User.query.get(user_id)

    user.projects.remove(project)
    db.session.commit()
    return "User removed from project."


def label_data(project_id, data_id, user_id, label):
    '''
    Function adds a label to a data object and returns a message.
    '''
    label_data = Label(project_id=project_id,
                       data_id=data_id,
                       user_id=user_id,
                       label=label)
    db.session.add(label_data)
    db.session.commit()
    return "Label added."


def remove_label(label_id):
    '''
    Function removes an existing label from the databse
    and returns a message.
    '''
    label = Project.query.get(label_id)
    db.session.delete(label)
    db.session.commit()
    return "Label removed."
