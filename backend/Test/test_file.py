
""" This test file contains all the tests that will be
executed everytime someone makes a pull request or
pushes to the main branch.
"""
from api.database_handler import (create_user, reset_db, create_project, add_data,
                                  delete_project, authorize_user, deauthorize_user, label_data)
from api import db, ProjectType
from api.models import User, Project, ProjectData


def function(x):
    y = 6
    return x + y


""" Example test: function(1) == 7 is correct so this
 test_function will pass.
"""


def test_function():
    assert function(1) == 7, "Test failed"


""" Add unit tests here
Name it test_*function name*.py or pytest won't find it.
"""


def test_create_user():
    reset_db()
    # Test correctly creating an admin user.
    ret = create_user("Oscar", "Lonnqvist", "oscar@gmail.com", True)
    assert User.query.get(ret["id"]) is not None

    # Test correctly creating an non-admin user.
    ret = create_user("first", "last", "user@gmail.com", False)
    assert User.query.get(ret["id"]) is not None

    # Test duplicate email
    # ret = create_user("Oscar", "Lonnqvist", "oscar@gmail.com", True)
    # assert User.query.get(ret["id"]) is None

    # Test incorrect first name type
    ret = create_user(["Oscar"], "Lonnqvist", "name@gmail.com", True)
    assert User.query.get(ret["id"]) is not None


def test_create_project():
    reset_db()
    # Test correctly creating a project.
    ret = create_project("Project", ProjectType.DOCUMENT_CLASSIFICATION)
    assert Project.query.get(ret["id"]) is not None

    # Test duplicate project name
    ret = create_project("Project", ProjectType.IMAGE_CLASSIFICATION)
    assert Project.query.get(ret["id"]) is None

    # Test incorrect project name
    ret = create_project({"Project"}, ProjectType.IMAGE_CLASSIFICATION)
    assert Project.query.get(ret["id"]) is None


def test_add_data():
    reset_db()
    # Test correctly adding data to a project.
    create_user("first", "last", "user@gmail.com", True)
    create_project("Project", ProjectType.DOCUMENT_CLASSIFICATION)
    in_data = "Test"
    ret = add_data(1, in_data, ProjectType.DOCUMENT_CLASSIFICATION)
    project_data = ProjectData.query.get(ret["id"])
    assert project_data is not None
    assert project_data.data is in_data

    # Test adding data to a project that doesn't exist.
    ret = add_data(2, in_data, ProjectType.DOCUMENT_CLASSIFICATION)
    project_data = ProjectData.query.get(ret["id"])
    assert project_data is None

    # Test incorrect project type
    ret = add_data(1, in_data, 5)
    project_data = ProjectData.query.get(ret["id"])
    assert not ProjectType.has_value(project_data)


def test_delete_project():
    reset_db()
    pass


def test_authorize_user():
    reset_db()
    pass


def test_deauthorize_user():
    reset_db()
    pass


def test_label_data():
    reset_db()
    pass
