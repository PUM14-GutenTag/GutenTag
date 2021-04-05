import os
import pathlib
import json
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


def is_same_shape(d1, d2):
    """
    Returns true if the two dictionaries have the same shape. Meaning same
    structure and keys, values may differ.
    """
    if isinstance(d1, dict):
        if isinstance(d2, dict):
            # then we have shapes to check
            return (d1.keys() == d2.keys() and
                    # so the keys are all the same
                    all(is_same_shape(d1[k], d2[k]) for k in d1.keys()))
            # thus all values will be tested in the same way.
        else:
            return False  # d1 is a dict, but d2 isn't
    else:
        return not isinstance(d2, dict)  # if d2 is a dict, False, else True.


def validate_common(project, out_content, in_content):
    """
    Validate assertions common to all project types
    """
    assert out_content["project_id"] == project.id
    assert out_content["project_name"] == project.name
    assert out_content["project_type"] == project.project_type
    assert is_same_shape(out_content["data"], in_content)


def test_document_classification_import_export():
    reset_db()

    project = try_add(Project(
        "Document project", ProjectType.DOCUMENT_CLASSIFICATION))

    # Read and import from the input file into the database.
    text_file = os.path.join(
        PATH, "res/text/input_document_classification.json")
    with open(text_file) as file:
        in_content = file.read()
        import_document_classification_data(project.id, in_content)

    # Export and write from the database to the output file.
    out_file = os.path.join(OUT_PATH, "output_document_classification.json")
    with open(out_file, "w") as file:
        out_content = export_document_classification_data(project.id)
        file.write(out_content)

    validate_common(project, json.loads(out_content), json.loads(in_content))


def test_sequence_import_export():
    reset_db()

    project = try_add(Project(
        "Sequence project", ProjectType.SEQUENCE_LABELING))

    # Read and import from the input file into the database.
    text_file = os.path.join(PATH, "res/text/input_sequence.json")
    with open(text_file) as file:
        in_content = file.read()
        import_sequence_labeling_data(project.id, in_content)

    # Export and write from the database to the output file.
    out_file = os.path.join(OUT_PATH, "output_sequence.json")
    with open(out_file, "w") as file:
        out_content = export_sequence_labeling_data(project.id)
        file.write(out_content)

    validate_common(project, json.loads(out_content), json.loads(in_content))


def test_sequence_to_sequence_import_export():
    reset_db()

    project = try_add(Project(
        "Sequence to sequence project", ProjectType.SEQUENCE_TO_SEQUENCE))

    # Read and import from the input file into the database.
    text_file = os.path.join(PATH, "res/text/input_sequence_to_sequence.json")
    with open(text_file) as file:
        in_content = file.read()
        import_sequence_to_sequence_data(project.id, in_content)

    # Export and write from the database to the output file.
    out_file = os.path.join(OUT_PATH, "output_sequence_to_sequence.json")
    with open(out_file, "w") as file:
        out_content = export_sequence_to_sequence_data(project.id)
        file.write(out_content)

    validate_common(project, json.loads(out_content), json.loads(in_content))


def test_image_classification_import_export():
    reset_db()

    project = try_add(Project(
        "Image project", ProjectType.IMAGE_CLASSIFICATION))

    # Read and import from the input files into the database.
    text_file = os.path.join(
        PATH, "res/text/input_image_classification.json")
    with open(text_file) as file:
        in_content = file.read()
        data = json.loads(in_content)
    images = {}
    for obj in data:
        image_file = os.path.join(PATH, "res/images/", obj["file_name"])
        with open(image_file, "rb") as file:
            images[obj["file_name"]] = file.read()
    import_image_classification_data(project.id, in_content, images)

    # Export and write from the database to the output file.
    out_file = os.path.join(OUT_PATH, "output_image_classification.json")
    with open(out_file, "w") as file:
        out_content = export_image_classification_data(project.id)
        file.write(out_content)

    validate_common(project, json.loads(out_content), json.loads(in_content))

    # Write output images files to the 'out/' directory.
    for project_data in project.data:
        out_image = os.path.join(OUT_PATH, "output_" + project_data.file_name)
        with open(out_image, "wb") as file:
            file.write(project_data.image_data)

        # Check that input image matches output image.
        in_image = os.path.join(PATH, "res/images/", project_data.file_name)
        with open(in_image, "rb") as in_file, \
                open(out_image, "rb") as out_file:
            assert in_file.read() == out_file.read()


"""
TODO Below should be some high performance stress tests.
"""

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
