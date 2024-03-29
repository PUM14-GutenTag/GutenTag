from collections import defaultdict
from io import BytesIO
import zipfile
import time
import json
import random
from api.database_handler import (db,
                                  commit)
from api.models import (Project,
                        ProjectData,
                        ProjectTextData,
                        ProjectImageData,
                        ProjectType,
                        Label,
                        DocumentClassificationLabel,
                        ImageClassificationLabel,
                        SequenceLabel,
                        SequenceToSequenceLabel)


def generate_random_color():
    return 'hsl({hue}, {saturation}%, {lightness}%)'.format(
        hue=360 * random.random(), saturation=75 + 25 * random.random(),
        lightness=50 + 15 * random.random())


def import_text_data(project_id, json_data):
    """
    Import the given json_data to a project of the given id and type.

    json_data shape depends on the type. Labels may be omitted:

    Document classification:
    [
        {
            "text": "Excellent customer service.",
            "labels": ["positive", "negative"]
        },
        ...
    ]

    Sequence labeling:
    [
        {
            "text": "Alex is going to Los Angeles in California",
            "labels": [
                [0, 3, "PER"],
                [16, 27, "LOC"],
                [31, 41, "LOC"]
                ]
        },
        ...
    ]

    Sequence to sequence labeling:
    [
        {
            "text": "John saw the man on the mountain with a telescope.",
            "labels": [
                "John såg mannen på berget med hjälp av ett teleskop.",
                "John såg mannen med ett teleskop på berget."
            ]
        },
    ]
    """
    project = Project.query.get(project_id)
    if project.project_type == ProjectType.IMAGE_CLASSIFICATION:
        raise ValueError("Incorrect project type.")

    num_items = len(json_data)
    print(f"Adding {num_items} items to '{project.name}'...")
    data_list = []
    for obj in json_data:
        text = obj.get("text")
        if text is None:
            raise ValueError(f"'{obj}' is missing 'text' entry")
        project_data = ProjectTextData(project.id, text)
        data_list.append(project_data)

    db.session.add_all(data_list)
    db.session.flush()

    print(f"Adding labels to '{project.name}'...")
    label_list = []
    for i, obj in enumerate(json_data):
        data = data_list[i]
        labels = obj.get("labels")
        if isinstance(labels, list) and labels:
            if project.project_type == ProjectType.DOCUMENT_CLASSIFICATION:
                label_list += [
                    DocumentClassificationLabel(
                        data.id, None, lab, generate_random_color(),
                        is_prelabel=True)
                    for lab in labels
                ]
            elif project.project_type == ProjectType.SEQUENCE_LABELING:
                label_list += [
                    SequenceLabel(data.id, None, lab, begin, end,
                                  generate_random_color(), is_prelabel=True)
                    for begin, end, lab in labels
                ]
            elif project.project_type == ProjectType.SEQUENCE_TO_SEQUENCE:
                label_list += [
                    SequenceToSequenceLabel(data.id, None, lab,
                                            generate_random_color(),
                                            is_prelabel=True)
                    for lab in labels
                ]
            else:
                raise ValueError(
                    f"Invalid project type: {project.project_type}.")

    db.session.add_all(label_list)
    commit()
    print(f"Finished adding {num_items} items to '{project.name}'...")


def import_image_data(project_id, json_data, images):
    """
    Import the given json_data to a image classification project.
    images is a dictionary with file names as keys and image data as values.
    Labels are named rectangles: [[x1, y1], [x2, y2], "label"].

    json_data shape, where labels may be omitted:
    [
        {
            "labels": [
                [[442, 420], [530, 540], "car"],
                [[700, 520], [800, 640], "bus"]
            ]
        },
        ...
    ]
    """
    # Validate that json_data matches images.
    if (len(images) != len(json_data)):
        raise ValueError(f"Number of data objects ({len(json_data)}) must "
                         f"match number of images ({len(images)}).")
    image_names = {obj["file_name"] for obj in json_data}
    image_file_names = set(images.keys())
    image_names_difference = image_names.difference(image_file_names)
    image_file_names_difference = image_file_names.difference(image_names)
    if (image_names_difference):
        raise ValueError("Data objects contains unmatched image file names. "
                         + str(image_names_difference))
    elif (image_file_names_difference):
        raise ValueError("Uploaded images contain unmached data objects "
                         + str(image_file_names_difference))

    # Validate that uploaded images are not present in database.
    # Could probably be done with custom database constraints.
    existing_file_names = set([data.file_name for data in ProjectImageData
                               .query.filter_by(project_id=project_id).all()])
    existing_intersection = existing_file_names.intersection(image_file_names)
    if (existing_intersection):
        raise ValueError("Uploaded data contains filenames that are already "
                         "present in the database. "
                         + str(existing_intersection))

    project = Project.query.get(project_id)
    if project.project_type != ProjectType.IMAGE_CLASSIFICATION:
        raise ValueError("Incorrect project type.")

    num_items = len(json_data)
    print(f"Adding {num_items} items to '{project.name}'...")

    data_list = []
    for obj in json_data:
        file_name = obj.get("file_name")
        if file_name is None:
            raise ValueError(f"'{obj}' is missing 'file_name' entry")
        data_list.append(ProjectImageData(project.id, file_name,
                                          images[file_name]))

    db.session.add_all(data_list)
    db.session.flush()

    print(f"Adding labels to '{project.name}'...")
    label_list = []
    for i, obj in enumerate(json_data):
        data = data_list[i]
        labels = obj.get("labels")
        if isinstance(labels, list) and labels:
            if project.project_type == ProjectType.DOCUMENT_CLASSIFICATION:
                label_list += [
                    ImageClassificationLabel(data.id, None, lab,
                                             tuple(p1), tuple(
                                                 p2), generate_random_color(),
                                             is_prelabel=True)
                    for p1, p2, lab in labels
                ]

    db.session.add_all(label_list)
    commit()
    print(f"Finished adding {num_items} items to '{project.name}'...")


def get_standard_dict(project):
    """
    Returns a dictionary which acts as a base for all exports.
    """
    return {
        "project_id": project.id,
        "project_name": project.name,
        "project_type": project.project_type,
        "data": []
    }


def write_zip_entry(file_name, date_time, data, file):
    """
    Write an individual file to a zip archive.
    """
    data_zip = zipfile.ZipInfo(file_name)
    data_zip.date_time = date_time
    data_zip.compress_type = zipfile.ZIP_DEFLATED
    file.writestr(data_zip, data)


def get_image_zip(project_id, project_name, json_data, filters=None):
    """
    Create a zip file in memory containing the project's images and a
    descriptive JSON file.
    """
    all_data = ProjectImageData.query.filter_by(project_id=project_id).all()
    date_time = time.localtime(time.time())[:6]
    memory_file = BytesIO()
    with zipfile.ZipFile(memory_file, "w") as zf:
        for data in all_data:
            write_zip_entry(data.file_name, date_time, data.image_data, zf)
        write_zip_entry(f"{project_name}.json", date_time, json_data, zf)
    memory_file.seek(0)
    return memory_file


def export_data(project_id, filters=None):
    """
    Export all data from a project with the given id.
    The returned JSON object's shape depends on the project type.
    Image projects return a zip containing all images and the JSON file.

    Document classification:
    {
        project_id: 0,
        project_name: "name",
        project_type: 1,
        data: [
            {
                "text": "Excellent customer service.",
                "labels": ["positive"]
            },
            ...
        ]
    }

    Sequence labeling:
    {
        project_id: 0,
        project_name: "name",
        project_type: 2,
        data: [
            {
                "text": "Alex is going to Los Angeles in California",
                "labels": [
                    [0, 3, PER],
                    [16, 27, LOC],
                    [31, 41, LOC]
                ]
            },
            ...
        ]
    }

    Sequence to sequence labeling:
    {
        project_id: 0,
        project_name: "name",
        project_type: 3,
        data: [
            {
                "text": "John saw the man on the mountain with a telescope.",
                "labels": [
                    "John såg mannen på berget med hjälp av ett teleskop.",
                    "John såg mannen med ett teleskop på berget."
                ]
            },
            ...
        ]
    }

    Image classification
    {
        project_id: 0,
        project_name: "project name",
        project_type: 4,
        data: [
            {
                "file_name": "image.jpg",
                "id": 101,
                "labels": [
                    [[442, 420], [530, 540], "car"],
                    [[700, 520], [800, 640], "bus"]
                ]
            },
            ...
        ]
    }
    """
    if filters is not None:
        raise NotImplementedError("Filters are not yet supported.")

    project = Project.query.get(project_id)
    text = get_standard_dict(project)

    data_list = ProjectData.query.filter_by(project_id=project_id).all()

    num_items = len(data_list)
    print(f"Fetching {num_items} items from '{project.name}'...")

    labelClass = {
        ProjectType.DOCUMENT_CLASSIFICATION: DocumentClassificationLabel,
        ProjectType.SEQUENCE_LABELING: SequenceLabel,
        ProjectType.SEQUENCE_TO_SEQUENCE: SequenceToSequenceLabel,
        ProjectType.IMAGE_CLASSIFICATION: ImageClassificationLabel
    }
    label_list = db.session.query(labelClass[project.project_type]).filter(
        Label.data.has(project_id=project_id)
    ).all()

    label_dict = defaultdict(list)
    for lab in label_list:
        if project.project_type == ProjectType.DOCUMENT_CLASSIFICATION:
            label = lab.label
        elif project.project_type == ProjectType.SEQUENCE_LABELING:
            label = [lab.begin, lab.end, lab.label]
        elif project.project_type == ProjectType.SEQUENCE_TO_SEQUENCE:
            label = lab.label
        elif project.project_type == ProjectType.IMAGE_CLASSIFICATION:
            label = [[lab.x1, lab.y1], [lab.x2, lab.y2], lab.label]
        else:
            raise ValueError(f"Invalid project type: {project.project_type}")
        label_dict[lab.data_id].append(label)

    for data in data_list:
        entry = {
            "id": data.id,
            "labels": label_dict[data.id]
        }
        if project.project_type == ProjectType.IMAGE_CLASSIFICATION:
            entry["file_name"] = data.file_name
        else:
            entry["text"] = data.text_data

        text["data"].append(entry)

    if project.project_type == ProjectType.IMAGE_CLASSIFICATION:
        print(f"Zipping files from '{project.name}'...")
        zip_file = get_image_zip(project.id, project.name,
                                 json.dumps(text, ensure_ascii=False))
        result = zip_file
    else:
        result = text

    print(f"Finished fetching {num_items} items from '{project.name}'...")
    return result
