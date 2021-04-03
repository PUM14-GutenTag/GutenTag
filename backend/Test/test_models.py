
"""
This test file contains all the tests related to
models.py and database_handler.py that will be executed every time
someone makes a pull request or pushes to the main branch.
"""
import os
import pathlib
from pytest import raises
from sqlalchemy.exc import IntegrityError
from api.database_handler import reset_db
from api.models import (User, Project, ProjectData, Label, ProjectType,
                        DocumentClassificationLabel, SequenceLabel,
                        SequenceToSequenceLabel, ImageClassificationLabel)
from api.parser import (export_document_classification_data,
                        export_image_classification_data,
                        export_sequence_labeling_data,
                        export_sequence_to_sequence_data)


PATH = os.path.dirname(__file__)
OUT_PATH = PATH + "/out/"

path = pathlib.Path(OUT_PATH)
path.mkdir(exist_ok=True)


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


def test_document_classification_label():
    reset_db()

    user = User.create("firsttest", "lasttest", "usertest@gmail.com")
    project = Project.create(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    label_str = "Positive"
    data = project.add_text_data("This is so exciting!")

    # Test label valid data.
    label = DocumentClassificationLabel.create(data.id, user.id, label_str)
    assert label is not None
    assert label in data.labels

    # Test label existing data as a non-existing user.
    with raises(IntegrityError):
        label = DocumentClassificationLabel.create(data.id, 100, label_str)
        assert label is None

    out_file = os.path.join(OUT_PATH, "document_classification_label.json")
    with open(out_file, "w") as file:
        file.write(export_document_classification_data(project.id))


def test_sequence_label():
    reset_db()

    user = User.create("firsttest", "lasttest", "usertest@gmail.com")
    project = Project.create(
        "Project", ProjectType.SEQUENCE_LABELING)
    data = project.add_text_data("Alex is going to Los Angeles in California")

    # Test label valid data.
    for lab in [(0, 3, "PER"), (16, 27, "LOC"), (31, 41, "LOC")]:
        label = SequenceLabel.create(data.id, user.id, lab[2], lab[0], lab[1])
        assert label is not None
        assert label in data.labels

    out_file = os.path.join(OUT_PATH, "sequence_label.json")
    with open(out_file, "w") as file:
        file.write(export_sequence_labeling_data(project.id))


def test_sequence_to_sequence_label():
    reset_db()

    user = User.create("firsttest", "lasttest", "usertest@gmail.com")
    project = Project.create(
        "Project", ProjectType.SEQUENCE_TO_SEQUENCE)
    data = project.add_text_data(
        "John saw the man on the mountain with a telescope.")
    from_type = "english"

    # Test label valid data.
    for lab in ["John såg mannen på berget med hjälp av ett teleskop.",
                "John såg mannen med ett teleskop på berget."]:
        label = SequenceToSequenceLabel.create(data.id, user.id, lab,
                                               from_type, "swedish")
        assert label is not None
        assert label in data.labels

    out_file = os.path.join(OUT_PATH, "sequence_to_sequence_label.json")
    with open(out_file, "w") as file:
        file.write(export_sequence_to_sequence_data(project.id))


def test_image_classification_label():
    reset_db()

    user = User.create("firsttest", "lasttest", "usertest@gmail.com")
    project = Project.create(
        "Project", ProjectType.IMAGE_CLASSIFICATION)

    image_file = os.path.join(PATH, "res/images/ILSVRC2012_val_00000001.JPEG")
    with open(image_file, "rb") as file:
        data = project.add_image_data(file.name, file.read())

    # Test label valid data.
    coord1 = (10, 40)
    coord2 = (50, 100)
    label = ImageClassificationLabel.create(
        data.id, user.id, "snake", coord1, coord2)
    assert label is not None
    assert label in data.labels

    out_file = os.path.join(OUT_PATH, "image_classification_label.json")
    with open(out_file, "w") as file:
        file.write(export_image_classification_data(project.id))


def test_delete_label():
    reset_db()

    user = User.create("firsttest", "lasttest", "usertest@gmail.com")
    project = Project.create(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)
    in_data = "Test"
    label_str = "Positive"
    data = project.add_text_data(in_data)
    label = DocumentClassificationLabel.create(data.id, user.id, label_str)
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
    label = DocumentClassificationLabel.create(data.id, user.id, label_str)
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


def test_add_text_data():
    reset_db()

    project = Project.create(
        "Project", ProjectType.DOCUMENT_CLASSIFICATION)

    text_file = os.path.join(PATH, "res/text/original_rt_snippets.txt")
    # Add all lines in the text file as project_data columns.
    with open(text_file) as file:
        project.add_text_bulk(file.readlines())
    assert len(project.data) == 10605

    out_file = os.path.join(OUT_PATH, "add_text_data.json")
    with open(out_file, "w") as file:
        file.write(export_document_classification_data(project.id))


def test_add_image_data():
    reset_db()

    project = Project.create(
        "Project", ProjectType.IMAGE_CLASSIFICATION)

    # Test adding all images in the directory to a project.
    image_dir = os.path.join(PATH, "res/images")
    with os.scandir(image_dir) as dir:
        for entry in dir:
            if (entry.is_file()):
                image_path = os.path.join(image_dir, entry.name)
                with open(image_path, "rb") as file:
                    project.add_image_data(entry.name, file.read())
    assert len(project.data) == 10
