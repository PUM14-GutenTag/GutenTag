
""" This test file contains all the tests that will be
executed everytime someone makes a pull request or
pushes to the main branch.
"""
from api.database_handler import (create_user, reset_db, create_project, add_data,
                                  delete_project, authorize_user, deauthorize_user, label_data)
from api import db, ProjectType
from api.models import User, Project, ProjectData, Label, access_control


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

    # Test duplicate email.
    ret = create_user("Oscar", "Lonnqvist", "oscar@gmail.com", True)
    assert User.query.get(ret["id"]) is None

    # Test incorrect first name type.
    ret = create_user(["Oscar"], "Lonnqvist", "name@gmail.com", True)
    assert User.query.get(ret["id"]) is None


def test_create_project():
    reset_db()

    # Test correctly creating a project.
    ret = create_project("Project", ProjectType.DOCUMENT_CLASSIFICATION)
    assert Project.query.get(ret["id"]) is not None

    # Test duplicate project name.
    ret = create_project("Project", ProjectType.IMAGE_CLASSIFICATION)
    assert Project.query.get(ret["id"]) is None

    # Test incorrect project name.
    ret = create_project({"Project"}, ProjectType.IMAGE_CLASSIFICATION)
    assert Project.query.get(ret["id"]) is None


def test_add_data():
    reset_db()

    user_ret = create_user("first", "last", "user@gmail.com", True)
    project_ret = create_project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    user_id = user_ret["id"]
    project_id = project_ret["id"]
    in_data = "Test"

    # Test correctly adding data to a project.
    ret = add_data(project_id, in_data, ProjectType.DOCUMENT_CLASSIFICATION)
    project_data = ProjectData.query.get(ret["id"])
    assert project_data is not None
    assert project_data.data == in_data

    # Test adding data to a project that doesn't exist.
    ret = add_data(350, in_data, ProjectType.DOCUMENT_CLASSIFICATION)
    project_data = ProjectData.query.get(ret["id"])
    assert project_data is None

    # Test incorrect project type.
    ret = add_data(project_id, in_data, 5)
    project_data = ProjectData.query.get(ret["id"])
    assert not ProjectType.has_value(project_data)


def test_delete_project():
    reset_db()

    # Test deleting existing project.
    create_ret = create_project("Project", ProjectType.IMAGE_CLASSIFICATION)
    delete_ret = delete_project(create_ret["id"])
    get_id = Project.query.get(delete_ret["id"])
    assert create_ret["id"] == delete_ret["id"]
    assert get_id is None

    # Test deleting non-existing project.
    delete_ret = delete_project(1033)
    assert delete_ret["id"] is None


def test_authorize_user():
    reset_db()

    project_ret = create_project("A project", ProjectType.SEQUENCE_LABELING)

    # Test authorizing existing user.
    user_ret = create_user("firstname", "lastname", "mail@gmail.com", False)
    authorize_user(project_ret["id"], user_ret["id"])

    x = db.session.query(User.id, Project.id, access_control).filter(
        access_control.c.user_id == User.id).filter(access_control.c.project_id == Project.id).all()

    # x = User.query.join(access_control).join(Project).filter(
    # (access_control.c.user_id == User.id) & (access_control.c.project_id == Project.id)).all()

    # x = db.session.query(User).filter(User.id == user_ret["id"]).filter(
    #     User.projects.any(id=project_ret["id"])
    # ).all()
    # y = db.session.query(Project).filter(Project.id == project_ret["id"]).filter(
    #     Project.users.any(id=user_ret["id"])
    # ).all()
    # .query.filter_by(projects=project_ret["id"])
    # x = access_control_table.query.get((user_ret["id"], project_ret["id"]))
    print(x)


def test_deauthorize_user():
    reset_db()

    user_ret = create_user("first", "last", "user@gmail.com", True)
    project_ret = create_project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    user_id = user_ret["id"]
    project_id = project_ret["id"]
    authorize_user(project_id, user_id)

    # Test deauthorizing existing user.
    deauthorize_user(project_id, user_id)


def test_label_data():
    reset_db()

    user_ret = create_user("first", "last", "user@gmail.com", True)
    project_ret = create_project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    user_id = user_ret["id"]
    project_id = project_ret["id"]
    in_data = "Test"
    label = "Positive"
    data_ret = add_data(project_id, in_data,
                        ProjectType.DOCUMENT_CLASSIFICATION)
    data_id = data_ret["id"]

    # Test label valid data.
    ret = label_data(data_id, user_id, label)
    assert Label.query.get(ret["id"]) is not None

    # Test label non-existing data.
    ret = label_data(50, user_id, label)
    assert Label.query.get(ret["id"]) is None

    # Test label existing data as a non-existing user.
    ret = label_data(data_id, 100, label)
    assert Label.query.get(ret["id"]) is None
