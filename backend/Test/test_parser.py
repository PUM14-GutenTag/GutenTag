import os
import pathlib
import json
from api.database_handler import reset_db, try_add
from api.models import Project, ProjectType
from api.parser import (
    import_text_data,
    import_image_data,
    export_data
)


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
            return (d1.keys() == d2.keys()
                    # so the keys are all the same
                    and all(is_same_shape(d1[k], d2[k]) for k in d1.keys()))
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
        "Document project", ProjectType.DOCUMENT_CLASSIFICATION, 5))

    # Read and import from the input file into the database.
    text_file = os.path.join(
        PATH, "res/text/input_document_classification.json")
    with open(text_file) as file:
        in_content = json.load(file)
        import_text_data(project.id, in_content)

    # Export and write from the database to the output file.
    out_file = os.path.join(OUT_PATH, "output_document_classification.json")
    with open(out_file, "w") as file:
        out_content = export_data(project.id)
        json.dump(out_content, file)

    validate_common(project, out_content, in_content)


def test_sequence_import_export():
    reset_db()

    project = try_add(Project(
        "Sequence project", ProjectType.SEQUENCE_LABELING, 5))

    # Read and import from the input file into the database.
    text_file = os.path.join(PATH, "res/text/input_sequence.json")
    with open(text_file) as file:
        in_content = json.load(file)
        import_text_data(project.id, in_content)

    # Export and write from the database to the output file.
    out_file = os.path.join(OUT_PATH, "output_sequence.json")
    with open(out_file, "w") as file:
        out_content = export_data(project.id)
        json.dump(out_content, file)

    validate_common(project, out_content, in_content)


def test_sequence_to_sequence_import_export():
    reset_db()

    project = try_add(Project(
        "Sequence to sequence project", ProjectType.SEQUENCE_TO_SEQUENCE, 5))

    # Read and import from the input file into the database.
    text_file = os.path.join(PATH, "res/text/input_sequence_to_sequence.json")
    with open(text_file) as file:
        in_content = json.load(file)
        import_text_data(project.id, in_content)

    # Export and write from the database to the output file.
    out_file = os.path.join(OUT_PATH, "output_sequence_to_sequence.json")
    with open(out_file, "w") as file:
        out_content = export_data(project.id)
        json.dump(out_content, file)

    validate_common(project, out_content, in_content)


def test_image_classification_import_export():
    reset_db()

    project = try_add(Project(
        "Image project", ProjectType.IMAGE_CLASSIFICATION, 5))

    # Read and import from the input files into the database.
    text_file = os.path.join(
        PATH, "res/text/input_image_classification.json")
    with open(text_file) as file:
        in_content = json.load(file)
    images = {}
    for obj in in_content:
        image_file = os.path.join(PATH, "res/images/", obj["file_name"])
        with open(image_file, "rb") as file:
            images[obj["file_name"]] = file.read()
    import_image_data(project.id, in_content, images)

    # Export and write from the database to the output file.
    out_file = os.path.join(OUT_PATH, "output_image_classification.zip")
    with open(out_file, "wb") as file:
        out_contents = export_data(project.id)
        file.write(out_contents.getbuffer())
