
"""
This test file contains all the tests related to
models.py.
"""
import os
import pathlib
from pytest import raises
from sqlalchemy.exc import IntegrityError
from api.database_handler import reset_db, try_add, try_delete
from api.models import (User, Project, ProjectData, ProjectTextData, ProjectImageData, Label, ProjectType,
                        DocumentClassificationLabel, SequenceLabel,
                        SequenceToSequenceLabel, ImageClassificationLabel)


PATH = os.path.dirname(__file__)
OUT_PATH = PATH + "/out/"

path = pathlib.Path(OUT_PATH)
path.mkdir(exist_ok=True)


def test_create_user():
    reset_db()

    # Test correctly creating an admin user.
    user = try_add(User("Oscar", "Lonnqvist", "oscar@gmail.com", True))
    assert user is not None

    # Test correctly creating an non-admin user.
    user = try_add(User("first", "last", "user@gmail.com", False))
    assert user is not None

    # Test duplicate email.
    with raises(IntegrityError):
        user = try_add(User("Oscar", "Lonnqvist", "oscar@gmail.com", True))
        assert user is None

    # Test incorrect first name type.
    with raises(TypeError):
        user = try_add(User(["Oscar"], "Lonnqvist", "name@gmail.com", True))
        assert user is None


def test_create_project():
    reset_db()

    # Test correctly creating a project.
    project = try_add(Project("Project", ProjectType.DOCUMENT_CLASSIFICATION))
    assert project is not None

    # Test duplicate project name.
    with raises(IntegrityError):
        project = try_add(Project("Project", ProjectType.IMAGE_CLASSIFICATION))
        assert project is None

    # Test incorrect project name.
    with raises(TypeError):
        project = try_add(Project({"Project"}, ProjectType.IMAGE_CLASSIFICATION))
        assert project is None


def test_authorize_user():
    reset_db()

    project = try_add(Project("A project", ProjectType.SEQUENCE_LABELING))

    # Test authorizing existing user.
    user = try_add(User("firstname", "lastname", "mail@gmail.com", False))
    project.authorize_user(user.id)
    assert user in project.users

    # Test authorizing admin user.
    with raises(ValueError):
        admin_user = try_add(User("admin", "lastname", "admin@gmail.com", True))
        project.authorize_user(admin_user.id)
        assert admin_user not in project.users

    # Test authorizing non-existent user.
    with raises(ValueError):
        project.authorize_user(550)
        for u in project.users:
            assert u.id != 550


def test_deauthorize_user():
    reset_db()

    user = try_add(User("first", "last", "user@gmail.com"))
    project = try_add(Project("Project", ProjectType.DOCUMENT_CLASSIFICATION))
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
    user = try_add(User("firstname", "lastname", "user57@gmail.com"))
    project = try_add(Project("Projecttest",
                             ProjectType.DOCUMENT_CLASSIFICATION))
    with raises(ValueError):
        project.deauthorize_user(user.id)


def test_document_classification_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest", "usertest@gmail.com"))
    project = try_add(Project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION))
    label_str = "Positive"
    data = try_add(ProjectTextData(project.id, "This is so exciting!"))

    # Test label valid data.
    label = try_add(DocumentClassificationLabel(data.id, user.id, label_str))
    assert label is not None
    assert label in data.labels

    # Test label existing data as a non-existing user.
    with raises(IntegrityError):
        label = try_add(DocumentClassificationLabel(data.id, 100, label_str))
        assert label is None


def test_sequence_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest", "usertest@gmail.com"))
    project = try_add(Project(
        "Project", ProjectType.SEQUENCE_LABELING))
    data = try_add(ProjectTextData(project.id, "Alex is going to Los Angeles in California"))

    # Test label valid data.
    for lab in [(0, 3, "PER"), (16, 27, "LOC"), (31, 41, "LOC")]:
        label = try_add(SequenceLabel(data.id, user.id, lab[2], lab[0], lab[1]))
        assert label is not None
        assert label in data.labels


def test_sequence_to_sequence_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest", "usertest@gmail.com"))
    project = try_add(Project(
        "Project", ProjectType.SEQUENCE_TO_SEQUENCE))
    data = try_add(ProjectTextData(project.id,
        "John saw the man on the mountain with a telescope."))

    # Test label valid data.
    for lab in ["John såg mannen på berget med hjälp av ett teleskop.",
                "John såg mannen med ett teleskop på berget."]:
        label = try_add(SequenceToSequenceLabel(data.id, user.id, lab))
        assert label is not None
        assert label in data.labels


def test_image_classification_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest", "usertest@gmail.com"))
    project = try_add(Project(
        "Project", ProjectType.IMAGE_CLASSIFICATION))

    image_file = os.path.join(PATH, "res/images/ILSVRC2012_val_00000001.JPEG")
    with open(image_file, "rb") as file:
        data = try_add(ProjectImageData(project.id, file.name, file.read()))

    # Test label valid data.
    coord1 = (10, 40)
    coord2 = (50, 100)
    label = try_add(ImageClassificationLabel(
        data.id, user.id, "snake", coord1, coord2))
    assert label is not None
    assert label in data.labels


def test_delete_label():
    reset_db()

    user = try_add(User("firsttest", "lasttest", "usertest@gmail.com"))
    project = try_add(Project(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION))
    in_data = "Test"
    label_str = "Positive"
    data = try_add(ProjectTextData(project.id, in_data))
    label = try_add(DocumentClassificationLabel(data.id, user.id, label_str))
    assert label is not None
    assert label in data.labels

    # Test deleting existing label.
    try_delete(label)
    assert not data.labels


def test_delete_project():
    reset_db()

    project = try_add(Project("Project", ProjectType.DOCUMENT_CLASSIFICATION))
    project_id = project.id
    data = try_add(ProjectTextData(project.id, "text"))
    data_id = data.id
    user = try_add(User("name", "surname", "email@email.com"))
    label_str = "Negative"
    label = try_add(DocumentClassificationLabel(data.id, user.id, label_str))
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
