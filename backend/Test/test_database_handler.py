
"""
This test file contains all the tests related to
database_handler.py that will be executed every time
someone makes a pull request or pushes to the main branch.
"""
from api.database_handler import (create_user, reset_db, create_project,
                                  add_data, delete_project, authorize_user,
                                  deauthorize_user, label_data)
from api.models import (User, Project, ProjectData, Label, ProjectType)


"""
Add unit tests here
Name it test_*function name*.py or pytest won't find it.
"""


def test_create_user():
    reset_db()

    # Test correctly creating an admin user.
    ret = create_user("Oscar", "Lonnqvist",
                      "oscar@gmail.com", "password", True)
    assert User.query.get(ret["id"]) is not None

    # Test correctly creating an non-admin user.
    ret = create_user("first", "last", "user@gmail.com", "password", False)
    assert User.query.get(ret["id"]) is not None

    # Test duplicate email.
    ret = create_user("Oscar", "Lonnqvist",
                      "oscar@gmail.com", "password", True)
    assert User.query.get(ret["id"]) is None

    # Test incorrect first name type.
    ret = create_user(["Oscar"], "Lonnqvist",
                      "name@gmail.com", "password", True)
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

    create_user("first", "last", "user@gmail.com", "password", True)
    project_ret = create_project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
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
    user_ret = create_user("firstname", "lastname",
                           "mail@gmail.com", "password", False)
    authorize_user(project_ret["id"], user_ret["id"])

    project = Project.query.get(project_ret["id"])
    user = User.query.get(user_ret["id"])
    assert user in project.users

    # Test authorizing admin user.
    user_ret = create_user("admin", "lastname", "admin@gmail.com", True)
    authorize_user(project_ret["id"], user_ret["id"])

    project = Project.query.get(project_ret["id"])
    user = User.query.get(user_ret["id"])
    assert user not in project.users

    # Test authorizing non-existent user.
    authorize_user(project_ret["id"], 550)
    user = User.query.get(550)
    assert user not in project.users

    # Test authorizing user for non-existent project
    user_ret = create_user("nameer", "lastname",
                           "mailer@gmail.com", "password", False)
    user = User.query.get(user_ret["id"])
    assert len(user.projects) == 0
    authorize_user(1000, user.id)
    assert len(user.projects) == 0


def test_deauthorize_user():
    reset_db()

    user_ret = create_user("first", "last", "user@gmail.com", "password")
    project_ret = create_project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    user_id = user_ret["id"]
    project_id = project_ret["id"]
    project = Project.query.get(project_id)
    user = User.query.get(user_id)
    authorize_user(project_id, user_id)

    # Test deauthorizing existing user.
    deauthorize_user(project_id, user_id)
    assert user not in project.users

    # Test deauthorizing non existing user.
    deauthorize_user(project_id, 490)
    assert user not in project.users

    # Test deauthorizing user from a project he isn't authorized to
    user_ret = create_user("firstname", "lastname",
                           "user57@gmail.com", "password")
    project_ret = create_project(
        "Projecttest", ProjectType.DOCUMENT_CLASSIFICATION)
    project = Project.query.get(project_ret["id"])
    user = User.query.get(user_ret["id"])
    deauthorize_user(project_ret["id"], user_ret["id"])
    assert user not in project.users


def test_label_data():
    reset_db()

    user_ret = create_user("firsttest", "lasttest",
                           "usertest@gmail.com", "password")
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
