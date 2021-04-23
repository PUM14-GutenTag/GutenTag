import argparse
from pathlib import Path
import json

"""
This is a quickly thrown together script to large, representative, input files
for integration tests. 

Run it with python, with an optional argument for project type if you only want
a single type. Otherwise, all 4 will be created.

The script requires that you have copied the large dataset files from the
'datasets' folder in the OneDrive into ./images/ and ./text/ respectively.
"""

DOCUMENT_CLASSIFICATION_LABELS = [["positive"], ["negative"]]
SEQUENCE_LABELS = [[0, 3, "PER"], [16, 27, "LOC"], [31, 41, "LOC"]]
IMAGE_CLASSIFICATION_LABELS = [
    [[75, 125], [100, 150], "person"],
    [[100, 150], [160, 200], "person"],
    [[50, 100], [90, 120], "snake"]
]


def rolling_item(list, i):
    return list[i % len(list)]


def cut_list(list, ratio):
    return list[:int(len(list) * ratio)]


def create_text_arg_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--type", type=int, help="Project type")
    return parser


def write_json(path, data):
    print("Writing json...")
    with open(path, "w", encoding="utf-8") as output_file:
        json.dump(data, output_file, ensure_ascii=False)


def document_classification_dataset(input_path, output_path):
    print("Indexing input...")
    data_list = []
    with open(input_path, "r", encoding="utf-8") as input_file:
        lines = cut_list(input_file.read().splitlines(), 0.01)
    for i, line in enumerate(lines):
        data_list.append({
            "text": line,
            "labels": rolling_item(DOCUMENT_CLASSIFICATION_LABELS, i)
        })
    write_json(output_path, data_list)


def sequence_labeling_dataset(input_path, output_path):
    print("Indexing input...")
    data_list = []
    with open(input_path, "r", encoding="utf-8") as input_file:
        lines = cut_list(input_file.read().splitlines(), 0.5)
    for i, line in enumerate(lines):
        data_list.append({
            "text": line,
            "labels": rolling_item(SEQUENCE_LABELS, i)
        })

    write_json(output_path, data_list)


def sequence_to_sequence_dataset(data_path, label_path, output_path):
    print("Indexing input...")
    data_list = []
    with open(data_path, "r", encoding="utf-8") as data_file:
        data_lines = cut_list(data_file.read().splitlines(), 0.25)
    with open(label_path, "r", encoding="utf-8") as label_file:
        label_lines = cut_list(label_file.read().splitlines(), 0.25)

    for i, line in enumerate(data_lines):
        data_list.append({
            "text": line,
            "labels": label_lines[i] if len(label_lines) > i else []
        })
    write_json(output_path, data_list)


def image_classification_dataset(image_dir, file_output_path):
    print("Indexing input...")
    image_names = [p.name for p in Path(image_dir).iterdir() if p.is_file()]
    data_list = [{
        "file_name": name,
        "label": rolling_item(IMAGE_CLASSIFICATION_LABELS, i)
    } for i, name in enumerate(image_names)]

    write_json(file_output_path, data_list)


if __name__ == "__main__":
    parser = create_text_arg_parser()
    args = parser.parse_args()
    if (args.type == 1):
        document_classification_dataset(
            "extra/text/medium-english.txt",
            "extra/text/large_document_classification.json"
        )
    elif (args.type == 2):
        sequence_labeling_dataset(
            "extra/text/medium-english.txt",
            "extra/text/large_sequence_labeling.json"
        )
    elif (args.type == 3):
        sequence_to_sequence_dataset(
            "extra/text/medium-english.txt",
            "extra/text/medium-german.txt",
            "extra/text/large_sequence_to_sequence.json"
        )
    elif (args.type == 4):
        image_classification_dataset(
            "extra/images/",
            "extra/text/large_image_classification.json"
        )
    else:
        document_classification_dataset(
            "extra/text/medium-english.txt",
            "extra/text/large_document_classification.json"
        )
        sequence_labeling_dataset(
            "extra/text/medium-english.txt",
            "extra/text/large_sequence_labeling.json"
        )
        sequence_to_sequence_dataset(
            "extra/text/medium-english.txt",
            "extra/text/medium-german.txt",
            "extra/text/large_sequence_to_sequence.json"
        )
        image_classification_dataset(
            "extra/images/",
            "extra/text/large_image_classification.json"
        )

    print("Done.")
