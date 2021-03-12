
"""
This test file contains all the tests related to
models.py and database_handler that will be executed every time
someone makes a pull request or pushes to the main branch.
"""
from pytest import raises
from sqlalchemy.exc import IntegrityError
from api.database_handler import reset_db
from api.models import (User, Project, ProjectData, Label, ProjectType)


"""
Add unit tests here
Name it test_*function name*.py or pytest won't find it.
"""


def test_create_user():
    reset_db()

    # Test correctly creating an admin user.
    user = User.create("Oscar", "Lonnqvist", "oscar@gmail.com", True)
    assert user is not None

    # Test correctly creating an non-admin user.
    user = User.create("first", "last", "user@gmail.com", False)
    assert user is not None

    # Test duplicate email.
    with raises(IntegrityError):
        user = User.create("Oscar", "Lonnqvist", "oscar@gmail.com", True)
        assert user is None

    # Test incorrect first name type.
    with raises(TypeError):
        user = User.create(["Oscar"], "Lonnqvist", "name@gmail.com", True)
        assert user is None


def test_create_project():
    reset_db()

    # Test correctly creating a project.
    project = Project.create("Project", ProjectType.DOCUMENT_CLASSIFICATION)
    assert project is not None

    # Test duplicate project name.
    with raises(IntegrityError):
        project = Project.create("Project", ProjectType.IMAGE_CLASSIFICATION)
        assert project is None

    # Test incorrect project name.
    with raises(TypeError):
        project = Project.create({"Project"}, ProjectType.IMAGE_CLASSIFICATION)
        assert project is None


def test_add_data():
    reset_db()

    User.create("first", "last", "user@gmail.com", True)
    project = Project.create(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    in_data = "Test"

    # Test correctly adding data to a project.
    project_data = project.add_text_data(in_data)
    assert project_data is not None
    assert project_data.text_data == in_data

    # Test adding image data to text project type.
    with raises(ValueError):
        project_data = project.add_image_data(in_data)
        assert not ProjectType.has_value(project_data)


def test_authorize_user():
    reset_db()

    project = Project.create("A project", ProjectType.SEQUENCE_LABELING)

    # Test authorizing existing user.
    user = User.create("firstname", "lastname", "mail@gmail.com", False)
    project.authorize_user(user.id)
    assert user in project.users

    # Test authorizing admin user.
    with raises(ValueError):
        admin_user = User.create("admin", "lastname", "admin@gmail.com", True)
        project.authorize_user(admin_user.id)
        assert admin_user not in project.users

    # Test authorizing non-existent user.
    with raises(ValueError):
        project.authorize_user(550)
        for u in project.users:
            assert u.id != 550


def test_deauthorize_user():
    reset_db()

    user = User.create("first", "last", "user@gmail.com")
    project = Project.create(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    project.authorize_user(user.id)

    # Test deauthorizing existing user.
    project.deauthorize_user(user.id)
    assert user not in project.users

    # Test deauthorizing non existing user.
    with raises(ValueError):
        project.deauthorize_user(490)
        for u in project.users:
            assert u.id != 490

    # Test deauthorizing user from a project it isn't authorized to.
    user = User.create("firstname", "lastname", "user57@gmail.com")
    project = Project.create("Projecttest",
                             ProjectType.DOCUMENT_CLASSIFICATION)
    with raises(ValueError):
        project.deauthorize_user(user.id)


def test_label_data():
    reset_db()

    user = User.create("firsttest", "lasttest", "usertest@gmail.com")
    project = Project.create(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    in_data = "Test"
    label_str = "Positive"
    data = project.add_text_data(in_data)

    # Test label valid data.
    label = data.label_data(user.id, label_str)
    assert label is not None

    # Test label existing data as a non-existing user.
    with raises(IntegrityError):
        label = data.label_data(100, label_str)
        assert label is None


def test_delete_label():
    reset_db()

    user = User.create("firsttest", "lasttest", "usertest@gmail.com")
    project = Project.create(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    in_data = "Test"
    label_str = "Positive"
    data = project.add_text_data(in_data)
    label = data.label_data(user.id, label_str)
    assert label is not None
    assert label in data.labels

    # Test deleting existing label.
    label.delete()
    assert not data.labels


def test_delete_project():
    reset_db()

    project = Project.create("Project", ProjectType.DOCUMENT_CLASSIFICATION)
    project_id = project.id
    data = project.add_text_data("text")
    data_id = data.id
    user = User.create("name", "surname", "email@email.com")
    label_str = "Negative"
    label = data.label_data(user.id, label_str)
    label_id = label.id
    assert ProjectData.query.get(data.id) is not None
    assert Label.query.get(label.id) is not None

    # Test deleting existing project.
    project.delete()
    get_project = Project.query.get(project_id)
    assert get_project is None

    # Test that project data has been deleted by cascade.
    assert ProjectData.query.get(data_id) is None

    # Test that labels have been deleted by cascade
    assert Label.query.get(label_id) is None
