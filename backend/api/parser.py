import json
from api.database_handler import try_add, try_add_list
from api.models import (Project,
                        ProjectData,
                        ProjectTextData,
                        ProjectImageData,
                        ProjectType,
                        DocumentClassificationLabel,
                        ImageClassificationLabel,
                        SequenceLabel,
                        SequenceToSequenceLabel)


def get_project(id, type):
    project = Project.query.get(id)
    if project.project_type != type:
        raise ValueError(
            f"Project of type {project.project_type} does not match {type}")
    return project


def import_document_classification_data(project_id, json_data):
    """
    Import the given json_data to a document classification project.

    json_data shape, where labels may be omitted:
    [
        {
            "text": "Excellent customer service.",
            "labels": ["positive", "negative"]
        },
        ...
    ]
    """
    data = json.loads(json_data)
    project = get_project(project_id, ProjectType.DOCUMENT_CLASSIFICATION)

    for obj in data:
        text = obj.get("text")
        if text is None:
            raise ValueError(f"'{obj}' is missing 'text' entry")
        project_data = ProjectTextData(project.id, text)
        try_add(project_data)
        labels = obj.get("labels")
        if isinstance(labels, list) and labels:
            prelabels = [
                DocumentClassificationLabel(
                    project_data.id, None, lab, is_prelabel=True)
                for lab in set(labels)
            ]
            try_add_list(prelabels)


def import_sequence_labeling_data(project_id, json_data):
    """
    Import the given json_data to a sequence labeling project.

    json_data shape, where labels may be omitted:
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
    """
    data = json.loads(json_data)
    project = get_project(project_id, ProjectType.SEQUENCE_LABELING)

    for obj in data:
        text = obj.get("text")
        if text is None:
            raise ValueError(f"'{obj}' is missing 'text' entry")
        project_data = ProjectTextData(project.id, text)
        try_add(project_data)
        labels = obj.get("labels")
        if isinstance(labels, list) and labels:
            prelabels = [
                SequenceLabel(project_data.id, None, lab, begin, end,
                              is_prelabel=True)
                for begin, end, lab in labels
            ]
            try_add_list(prelabels)


def import_sequence_to_sequence_data(project_id, json_data):
    """
    Import the given json_data to a sequence to sequence project.
    json_data shape, where labels may be omitted:
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
    data = json.loads(json_data)
    project = get_project(project_id, ProjectType.SEQUENCE_TO_SEQUENCE)

    for obj in data:
        text = obj.get("text")
        if text is None:
            raise ValueError(f"'{obj}' is missing 'text' entry")
        project_data = ProjectTextData(project.id, text)
        try_add(project_data)
        labels = obj.get("labels")
        if isinstance(labels, list) and labels:
            prelabels = [SequenceToSequenceLabel(project_data.id, None, lab,
                                                 is_prelabel=True)
                         for lab in labels]
            try_add_list(prelabels)


def import_image_classification_data(project_id, json_data, images):
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
    data = json.loads(json_data)
    project = get_project(project_id, ProjectType.IMAGE_CLASSIFICATION)

    for obj in data:
        file_name = obj.get("file_name")
        if file_name is None:
            raise ValueError(f"'{obj}' is missing 'text' entry")
        project_data = ProjectImageData(project.id, file_name,
                                        images[file_name])
        try_add(project_data)
        labels = obj.get("labels")
        if isinstance(labels, list) and labels:
            prelabels = [
                ImageClassificationLabel(project_data.id, None, lab, tuple(p1),
                                         tuple(p2), is_prelabel=True)
                for p1, p2, lab in labels
            ]
            try_add_list(prelabels)


def get_standard_dict(project):
    return {
        "project_id": project.id,
        "project_name": project.name,
        "project_type": project.project_type,
        "data": []
    }


def export_document_classification_data(project_id, filters=None):
    """
    Export all data from the document classification project with the given id.
    Returns a json object with the following shape:
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
    """
    if filters is not None:
        raise NotImplementedError("Filters are not yet supported.")

    project = Project.query.get(project_id)
    if project.project_type != ProjectType.DOCUMENT_CLASSIFICATION:
        raise ValueError("Project is not of type DOCUMENT_CLASSIFICATION")

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id):
        result["data"].append({
            "text": data.text_data,
            "labels": [lab.label for lab in data.labels]
        })

    return json.dumps(result, ensure_ascii=False)


def export_sequence_labeling_data(project_id, filters=None):
    """
    Export all data from the sequence labeling project with the given id.
    Returns a json object with the following shape:
    {
        project_id: 0,
        project_name: "name",
        project_type: 1,
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
    """
    if filters is not None:
        raise NotImplementedError("Filters are not yet supported.")

    project = Project.query.get(project_id)
    if project.project_type != ProjectType.SEQUENCE_LABELING:
        raise ValueError("Project is not of type SEQUENCE_LABELING")

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id):
        result["data"].append({
            "text": data.text_data,
            "labels": [[lab.begin, lab.end, lab.label] for lab in data.labels]
        })

    return json.dumps(result, ensure_ascii=False)


def export_sequence_to_sequence_data(project_id, filters=None):
    """
    Export all data from the sequence to sequence project with the given id.
    Returns a json object with the following shape:
    {
        project_id: 0,
        project_name: "name",
        project_type: 1,
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
    if project.project_type != ProjectType.SEQUENCE_TO_SEQUENCE:
        raise ValueError("Project is not of type SEQUENCE_TO_SEQUENCE")

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id):
        result["data"].append({
            "text": data.text_data,
            "labels": [lab.label for lab in data.labels]
        })

    return json.dumps(result, ensure_ascii=False)


def export_image_classification_data(project_id, filters=None):
    """
    Export all data from the image classification project with the given id.

    Returns a json object with the following shape, where labels are named
    rectangles: [[x1, y1], [x2, y2], "label"]:
    {
        project_id: 0,
        project_name: "project name",
        project_type: 1,
        data: [
            {
                "file_name": "image.jpg",
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

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id).all():
        labels = [[[lab.x1, lab.y1], [lab.x2, lab.y2], lab.label]
                  for lab in data.labels]
        result["data"].append({
            "file_name": data.file_name,
            "labels": labels
        })

    return json.dumps(result, ensure_ascii=False)
