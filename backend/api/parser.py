from io import BytesIO
import zipfile
import time
import json
from api.database_handler import (add_flush,
                                  add_list_flush,
                                  try_add_list,
                                  db,
                                  commit)
from api.models import (Project,
                        ProjectData,
                        ProjectTextData,
                        ProjectImageData,
                        ProjectType,
                        ProjectTransaction,
                        TransactionStatus,
                        DocumentClassificationLabel,
                        ImageClassificationLabel,
                        SequenceLabel,
                        SequenceToSequenceLabel)


def import_text_data(project_id, json_data, transaction):
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

    print("Setting status")
    transaction.set_status(
        TransactionStatus.CREATING_DATA_OBJECTS, run_commit=False)
    print("Creating objects")
    data_list = []
    label_list = []

    length = len(json_data)
    t = time.perf_counter()
    t_last = t
    chunk_size = 1000
    i = 0
    for obj in json_data:
        if not (i % chunk_size):
            t_now = time.perf_counter()
            print(f"{i}/{length} -- time/{chunk_size}: "
                  f"{t_now - t_last}")
            t_last = t_now
        text = obj.get("text")
        if text is None:
            raise ValueError(f"'{obj}' is missing 'text' entry")
        project_data = ProjectTextData(project.id, text)
        data_list.append(project_data)

        i += 1
    print(f"Time elapsed, create objects: {time.perf_counter() - t}")
    transaction.set_status(TransactionStatus.ADDING_DATA_OBJECTS)
    try_add_list(data_list)
    print(f"Time elapsed, add data: {time.perf_counter() - t}")

    transaction.set_status(TransactionStatus.CREATING_LABEL_OBJECTS)
    for i in range(length):
        obj = json_data[i]
        data = data_list[i]
        if not (i % chunk_size):
            t_now = time.perf_counter()
            print(f"{i}/{length} -- time/{chunk_size}: "
                  f"{t_now - t_last}")
            t_last = t_now
        labels = obj.get("labels")
        if isinstance(labels, list) and labels:
            if project.project_type == ProjectType.DOCUMENT_CLASSIFICATION:
                prelabels = [
                    DocumentClassificationLabel(
                        data.id, None, lab, is_prelabel=True)
                    for lab in set(labels)
                ]
            elif project.project_type == ProjectType.SEQUENCE_LABELING:
                prelabels = [
                    SequenceLabel(data.id, None, lab, begin, end,
                                  is_prelabel=True)
                    for begin, end, lab in labels
                ]
            elif project.project_type == ProjectType.SEQUENCE_TO_SEQUENCE:
                prelabels = [
                    SequenceToSequenceLabel(data.id, None, lab,
                                            is_prelabel=True)
                    for lab in labels]
            else:
                raise ValueError(
                    f"Invalid project type: {project.project_type}.")

        label_list += prelabels

    transaction.set_status(TransactionStatus.ADDING_LABEL_OBJECTS)
    try_add_list(label_list)
    print(f"Time elapsed, add labels: {time.perf_counter() - t}")
    transaction.set_status(TransactionStatus.FINISHED)
    print(f"Total time: {time.perf_counter() - t}")


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
        raise ValueError(f"Number of data objects ({len(json_data)} must "
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

    for obj in json_data:
        file_name = obj.get("file_name")
        if file_name is None:
            raise ValueError(f"'{obj}' is missing 'file_name' entry")
        project_data = ProjectImageData(project.id, file_name,
                                        images[file_name])
        add_flush(project_data)
        labels = obj.get("labels")
        if isinstance(labels, list) and labels:
            prelabels = [
                ImageClassificationLabel(project_data.id, None, lab, tuple(p1),
                                         tuple(p2), is_prelabel=True)
                for p1, p2, lab in labels
            ]
            add_list_flush(prelabels)
    commit()


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


def export_text_data(project_id, filters=None):
    """
    Export all data from a text-based project with the given id.
    The returned JSON object's shape depends on the project type.

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
    """
    if filters is not None:
        raise NotImplementedError("Filters are not yet supported.")

    project = Project.query.get(project_id)
    if project.project_type == ProjectType.IMAGE_CLASSIFICATION:
        raise ValueError("Incorrect project type")

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id):
        if project.project_type == ProjectType.DOCUMENT_CLASSIFICATION:
            entry = {
                "text": data.text_data,
                "labels": [lab.label for lab in data.labels]
            }
        elif project.project_type == ProjectType.SEQUENCE_LABELING:
            entry = {
                "text": data.text_data,
                "labels": [
                    [lab.begin, lab.end, lab.label] for lab in data.labels
                ]
            }
        elif project.project_type == ProjectType.SEQUENCE_TO_SEQUENCE:
            entry = {
                "text": data.text_data,
                "labels": [lab.label for lab in data.labels]
            }
        else:
            raise ValueError(f"Invalid project type: {project.project_type}")
        result["data"].append(entry)

    return result


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


def export_image_data(project_id, filters=None, with_images=True):
    """
    Export all data from the image classification project with the given id.

    Returns a json object with the following shape, where labels are named
    rectangles: [[x1, y1], [x2, y2], "label"]:
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
    if project.project_type != ProjectType.IMAGE_CLASSIFICATION:
        raise ValueError("Project is not of type IMAGE_CLASSIFICATION")

    text = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id).all():
        labels = [[[lab.x1, lab.y1], [lab.x2, lab.y2], lab.label]
                  for lab in data.labels]
        text["data"].append({
            "file_name": data.file_name,
            "id": data.id,
            "labels": labels
        })

    if with_images:
        zip_file = get_image_zip(project.id, project.name,
                                 json.dumps(text, ensure_ascii=False))
        return zip_file
    else:
        return text
