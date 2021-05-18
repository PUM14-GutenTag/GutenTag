
"""
This test file contains all the tests related to
models.py.
"""
import os
import pathlib
from pytest import raises
from sqlalchemy.exc import IntegrityError
from api.database_handler import reset_db, try_add, try_delete
from api.models import (User,
                        Project,
                        ProjectData,
                        ProjectTextData,
                        ProjectImageData,
                        Label,
                        ProjectType,
                        DocumentClassificationLabel,
                        SequenceLabel,
                        SequenceToSequenceLabel,
                        ImageClassificationLabel)


PATH = os.path.dirname(__file__)
OUT_PATH = PATH + "/out/"

path = pathlib.Path(OUT_PATH)
path.mkdir(exist_ok=True)


def test_create_user():
    reset_db()

    # Test correctly creating an admin user.
    user = try_add(User("Oscar", "Lonnqvist", "oscar@gmail.com", "password",
                        True))
    assert user is not None

    # Test correctly creating an non-admin user.
    user = try_add(User("first", "last", "user@gmail.com", "password", False))
    assert user is not None

    # Test duplicate email.
    with raises(IntegrityError):
        user = try_add(User("Oscar", "Lonnqvist", "oscar@gmail.com",
                            "password", True))
        assert user is None

    # Test incorrect first name type.
    with raises(TypeError):
        user = try_add(User(["Oscar"], "Lonnqvist",
                            "name@gmail.com", "password", True))
        assert user is None


def test_change_password():
    reset_db()

    # Create user
    user = try_add(User("Oscar", "Lonnqvist", "admin@gmail.com", "password",
                        False))

    # Test changing password
    user.change_password("bassword")

    assert user.check_password("password") is False
    assert user.check_password("bassword") is True


def test_create_project():
    reset_db()

    # Test correctly creating a project.
    project = try_add(
        Project("Project", ProjectType.DOCUMENT_CLASSIFICATION, 5))
    assert project is not None

    # Test duplicate project name.
    with raises(IntegrityError):
        project = try_add(
            Project("Project", ProjectType.IMAGE_CLASSIFICATION, 5))
        assert project is None

    # Test incorrect project name.
    with raises(TypeError):
        project = try_add(
            Project({"Project"}, ProjectType.IMAGE_CLASSIFICATION, 5))
        assert project is None


def test_get_all_projects():
    reset_db()
    try_add(User("first", "last", "user@gmail.com", "password", True))
    try_add(Project("Project", ProjectType.DOCUMENT_CLASSIFICATION, 5))
    try_add(Project("Project2", ProjectType.DOCUMENT_CLASSIFICATION, 5))

    all_projects = Project.query.all()
    assert all_projects is not None


def test_authorize_user():
    reset_db()

    project = try_add(Project("A project", ProjectType.SEQUENCE_LABELING, 5))

    # Test authorizing existing user.
    user = try_add(User("firstname", "lastname", "mail@gmail.com", "password",
                        False))
    user.authorize(project.id)
    assert user in project.users

    # Test authorizing admin user.
    with raises(ValueError):
        admin_user = try_add(
            User("admin", "lastname", "admin@gmail.com", "password", True))
        admin_user.authorize(project.id)
        assert admin_user not in project.users

    # Test authorizing for none-existant project
    with raises(ValueError):
        user.authorize(550)
        for proj in user.projects:
            assert proj.id != 550


def test_deauthorize_user():
    reset_db()

    user = try_add(User("first", "last", "user@gmail.com", "password"))
    project = try_add(
        Project("Project", ProjectType.DOCUMENT_CLASSIFICATION, 5))
    user.authorize(project.id)

    # Test deauthorizing existing user.
    user.deauthorize(project.id)
    assert user not in project.users

    # Test deauthorizing from non existing project.
    with raises(ValueError):
        user.deauthorize(490)
        for proj in user.projects:
            assert proj.id != 490

    # Test deauthorizing user from a project it isn't authorized to.
    user = try_add(User("firstname", "lastname", "user57@gmail.com",
                        "password"))
    project = try_add(Project("Projecttest",
                              ProjectType.DOCUMENT_CLASSIFICATION, 5))
    with raises(ValueError):
        user.deauthorize(project.id)


def test_document_classification_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest",
                        "usertest@gmail.com", "password"))
    project = try_add(Project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION, 5))
    label_str = "Positive"
    color = "#3A6FE8"
    data = try_add(ProjectTextData(project.id, "This is so exciting!"))

    # Test label valid data.
    label = try_add(DocumentClassificationLabel(
        data.id, user.id, label_str, color))
    assert label is not None
    assert label in data.labels

    # Test label existing data as a non-existing user.
    with raises(IntegrityError):
        label = try_add(DocumentClassificationLabel(
            data.id, 100, label_str, color))
        assert label is None


def test_sequence_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest",
                        "usertest@gmail.com", "password"))
    project = try_add(Project(
        "Project", ProjectType.SEQUENCE_LABELING, 5))
    data = try_add(ProjectTextData(
        project.id, "Alex is going to Los Angeles in California"))
    color = "#3A6FE8"

    # Test label valid data.
    for lab in [(0, 3, "PER", color), (16, 27, "LOC", color),
                (31, 41, "LOC", color)]:
        label = try_add(SequenceLabel(
            data.id, user.id, lab[2], lab[0], lab[1], lab[3]))
        assert label is not None
        assert label in data.labels


def test_sequence_to_sequence_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest",
                        "usertest@gmail.com", "password"))
    project = try_add(Project(
        "Project", ProjectType.SEQUENCE_TO_SEQUENCE, 5))
    data = try_add(
        ProjectTextData(project.id,
                        "John saw the man on the mountain with a telescope."))
    color = "#3A6FE8"

    # Test label valid data.
    for lab in ["John såg mannen på berget med hjälp av ett teleskop.",
                "John såg mannen med ett teleskop på berget."]:
        label = try_add(SequenceToSequenceLabel(data.id, user.id, lab, color))
        assert label is not None
        assert label in data.labels


def test_image_classification_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest",
                        "usertest@gmail.com", "password"))
    project = try_add(Project(
        "Project", ProjectType.IMAGE_CLASSIFICATION))
    color = "#3A6FE8"

    image_file = os.path.join(PATH, "res/images/ILSVRC2012_val_00000001.JPEG")
    with open(image_file, "rb") as file:
        data = try_add(ProjectImageData(
            project.id, file.name, file.read()))

    # Test label valid data.
    coord1 = (10, 40)
    coord2 = (50, 100)
    label = try_add(ImageClassificationLabel(
        data.id, user.id, "snake", coord1, coord2, color))
    assert label is not None
    assert label in data.labels


def test_delete_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest",
                        "usertest@gmail.com", "password"))
    project = try_add(Project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION, 5))
    in_data = "Test"
    label_str = "Positive"
    color = "#3A6FE8"
    data = try_add(ProjectTextData(project.id, in_data))
    label = try_add(DocumentClassificationLabel(
        data.id, user.id, label_str, color))
    assert label is not None
    assert label in data.labels

    # Test deleting existing label.
    try_delete(label)
    assert not data.labels


def test_delete_project():
    reset_db()

    project = try_add(
        Project("Project", ProjectType.DOCUMENT_CLASSIFICATION, 5))
    project_id = project.id
    data = try_add(ProjectTextData(project.id, "text"))
    data_id = data.id
    user = try_add(User("name", "surname", "email@email.com", "password"))
    label_str = "Negative"
    color = "#3A6FE8"
    label = try_add(DocumentClassificationLabel(
        data.id, user.id, label_str, color))
    label_id = label.id
    assert ProjectData.query.get(data.id) is not None
    assert Label.query.get(label.id) is not None

    # Test deleting existing project.
    try_delete(project)
    get_project = Project.query.get(project_id)
    assert get_project is None

    # Test that project data has been deleted by cascade.
    assert ProjectData.query.get(data_id) is None

    # Test that labels have been deleted by cascade
    assert Label.query.get(label_id) is None
