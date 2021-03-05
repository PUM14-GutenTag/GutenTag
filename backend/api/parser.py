from api import db
from api.models import User, Project, Project_data, Label
import json


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


def export_document_classification_data(project_id, filters):
    """
    Return array:
    [
        {
            "text": "Excellent customer service.",
            "labels": ["positive"]
        },
    ]
    """
    result = []
    for data in Project_data.query.filter_by(project_id=project_id):
        labels = Label.query.filter_by(data_id=data.id)
        # FIXME there is no column in Project_data for the document text!
        result.append({
            "text": data.text,
            "labels": [lab.label for lab in labels]
        })
    return json.dumps(result)


def export_image_classification_data(project_id, filters):
    pass


def export_sequence_labeling_data(project_id, filters):
    pass


def export_sequence_to_sequence_data(project_id, filters):
    pass
