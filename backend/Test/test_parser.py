import os
import pathlib
from pytest import raises
from sqlalchemy.exc import IntegrityError
from api.database_handler import reset_db, try_add
from api.models import Project, ProjectType
from api.parser import (import_document_classification_data,
                        import_image_classification_data,
                        import_sequence_labeling_data,
                        import_sequence_to_sequence_data,
                        export_document_classification_data,
                        export_image_classification_data,
                        export_sequence_labeling_data,
                        export_sequence_to_sequence_data)


PATH = os.path.dirname(__file__)
OUT_PATH = PATH + "/out/"

path = pathlib.Path(OUT_PATH)
path.mkdir(exist_ok=True)


def test_document_classification_import_export():
    reset_db()

    project = try_add(Project(
        "Document project", ProjectType.DOCUMENT_CLASSIFICATION))

    text_file = os.path.join(
        PATH, "res/text/input_document_classification.json")
    with open(text_file) as file:
        import_document_classification_data(project.id, file.read())

    out_file = os.path.join(OUT_PATH, "output_document_classification.json")
    with open(out_file, "w") as file:
        file.write(export_document_classification_data(project.id))


def test_sequence_label():
    reset_db()

    project = try_add(Project(
        "Sequence project", ProjectType.SEQUENCE_LABELING))

    text_file = os.path.join(PATH, "res/text/input_sequence.json")
    with open(text_file) as file:
        import_sequence_labeling_data(project.id, file.read())

    out_file = os.path.join(OUT_PATH, "output_sequence.json")
    with open(out_file, "w") as file:
        file.write(export_sequence_labeling_data(project.id))


def test_sequence_to_sequence_label():
    reset_db()

    project = try_add(Project(
        "Sequence to sequence project", ProjectType.SEQUENCE_TO_SEQUENCE))

    text_file = os.path.join(PATH, "res/text/input_sequence_to_sequence.json")
    with open(text_file) as file:
        import_sequence_to_sequence_data(project.id, file.read())

    out_file = os.path.join(OUT_PATH, "output_sequence_to_sequence.json")
    with open(out_file, "w") as file:
        file.write(export_sequence_to_sequence_data(project.id))


def test_image_classification_label():
    pass


# def test_add_text_data():
#     reset_db()

#     project = try_add(Project(
#         "Project", ProjectType.DOCUMENT_CLASSIFICATION))

#     text_file = os.path.join(PATH, "res/text/original_rt_snippets.txt")
#     # Add all lines in the text file as project_data columns.
#     with open(text_file) as file:
#         project.add_text_bulk(file.readlines())
#     assert len(project.data) == 10605

#     out_file = os.path.join(OUT_PATH, "add_text_data.json")
#     with open(out_file, "w") as file:
#         file.write(export_document_classification_data(project.id))


# def test_add_image_data():
#     reset_db()

#     project = try_add(Project(
#         "Project", ProjectType.IMAGE_CLASSIFICATION))

#     # Test adding all images in the directory to a project.
#     image_dir = os.path.join(PATH, "res/images")
#     with os.scandir(image_dir) as dir:
#         for entry in dir:
#             if (entry.is_file()):
#                 image_path = os.path.join(image_dir, entry.name)
#                 with open(image_path, "rb") as file:
#                     project.add_image_data(entry.name, file.read())
#     assert len(project.data) == 10
