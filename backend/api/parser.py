import json
from api import db
from api.models import User, Project, ProjectData, Label, ProjectType


def import_document_classification_data(project_id, json_data):
    """
    [
        {
            "text": "Excellent customer service.",
            "labels": [
                "positive",
                "negative"
                ]
        },
    ]
    """
    pass


def import_image_classification_data(project_id, json_data, image_data):
    """
    Labels are named rectangles: [[x1, y1], [x2, y2], "label"].
    [
        {
            "labels": [
                [[442, 420], [530, 540], "car"],
                [[700, 520], [800, 640], "bus"]
            ]
        }
    ]
    """
    pass


def import_sequence_labeling_data(project_id, json_data):
    """
    [
        {
            "text": "Alex is going to Los Angeles in California",
            "labels": [
                [0, 3, PER],
                [16, 27, LOC],
                [31, 41, LOC]
                ]
        },
    ]
    """
    pass


def import_sequence_to_sequence_data(project_id, json_data):
    """
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
    pass


def get_standard_dict(project):
    return {
        "project_id": project.id,
        "project_name": project.name,
        "project_type": project.project_type,
        "data": []
    }


def get_standard_label(label):
    return


def export_document_classification_data(project_id, filters=None):
    """
    Return dict:
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
    project = Project.query.get(project_id)
    if project.project_type != ProjectType.DOCUMENT_CLASSIFICATION:
        raise ValueError("Project is not of type DOCUMENT_CLASSIFICATION")

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id):
        result["data"].append({
            "text": data.text_data,
            "labels": [lab.label for lab in data.labels]
        })

    return json.dumps(result)


def export_image_classification_data(project_id, filters=None):
    """
    Labels are named rectangles: [[x1, y1], [x2, y2], "label"].
    Return dict:
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
    project = Project.query.get(project_id)
    if project.project_type != ProjectType.IMAGE_CLASSIFICATION:
        raise ValueError("Project is not of type IMAGE_CLASSIFICATION")

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id):
        labels = [[[lab.x1, lab.y1], [lab.x2, lab.y2], lab.label]
                  for lab in data.labels]
        result["data"].append({
            "file_name": data.file_name,
            "labels": labels
        })

    return json.dumps(result)


def export_sequence_labeling_data(project_id, filters=None):
    """
    Return array:
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
    project = Project.query.get(project_id)
    if project.project_type != ProjectType.SEQUENCE_LABELING:
        raise ValueError("Project is not of type SEQUENCE_LABELING")

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id):
        result["data"].append({
            "text": data.text_data,
            "labels": [[lab.begin, lab.end, lab.label] for lab in data.labels]
        })

    return json.dumps(result)


def export_sequence_to_sequence_data(project_id, filters=None):
    """
    Return array:
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
    project = Project.query.get(project_id)
    if project.project_type != ProjectType.SEQUENCE_TO_SEQUENCE:
        raise ValueError("Project is not of type SEQUENCE_TO_SEQUENCE")

    result = get_standard_dict(project)
    for data in ProjectData.query.filter_by(project_id=project_id):
        result["data"].append({
            "text": data.text_data,
            "labels": [lab.label for lab in data.labels]
        })

    return json.dumps(result)
