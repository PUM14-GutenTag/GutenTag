import json
from flask import jsonify, send_file, make_response
from flask_restful import Resource, reqparse, inputs, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from enum import IntEnum
from werkzeug.utils import secure_filename
from api import rest, IS_DEV_MODE
from api.models import (
    AccessLevel,
    DefaultLabel,
    Project,
    ProjectData,
    ProjectType,
    Label,
    DocumentClassificationLabel,
    SequenceLabel,
    SequenceToSequenceLabel,
    ImageClassificationLabel,
    User,
    Achievement,
    Statistic,
    Login
)
from api.database_handler import (
    reset_db,
    try_add_response,
    try_delete_response,
    add_flush,
    commit
)
from api.parser import (
    import_text_data,
    import_image_data,
    export_data
)
from api.gamification import (add_stats_to_new_user,
                              LabelingStatistic,
                              ProjectStatistic,
                              LoginStatistic,
                              WorkdayLoginStatistic,
                              WeekendLoginStatistic,
                              ImportStatistic,
                              ExportStatistic)


"""
This file contains the routes to the database.
"""

IMAGE_EXTENSIONS = {"png", "jpg", "jpeg"}
TEXT_EXTENSIONS = {"json"}


def allowed_extension(filename, allowed):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in allowed


class GetDataType(IntEnum):
    """
    Enum for the different types of getting data.
    """
    GET_LIST = 0
    GET_NEXT_VALUE = 1
    GET_EARLIER_VALUE = -1


class Ping(Resource):
    def get(self):
        return "ping"


class CreateUser(Resource):
    """
    Endpoint for creating a user.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("first_name", type=str, required=True)
        self.reqparse.add_argument("last_name", type=str, required=True)
        self.reqparse.add_argument("email", type=str, required=True)
        self.reqparse.add_argument("password", type=str, required=True)
        self.reqparse.add_argument("admin", type=inputs.boolean,
                                   required=False, default=False)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())

        if user.access_level >= AccessLevel.ADMIN:
            new_user = User(args.first_name, args.last_name, args.email,
                            args.password, args.admin)
            add_flush(new_user)
            add_stats_to_new_user(new_user.id)
            commit()
            return make_response(jsonify("User added."), 200)

        return make_response(jsonify({"id": None, "message":
                                      "You are not authorized to  \
                                      create other users."}), 401)


class LoginUser(Resource):
    """
    Endpoint for logging in an user.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("email", type=str, required=True)
        self.reqparse.add_argument("password", type=str, required=True)

    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(args.email)
        if user is None:
            msg = "Incorrect login credentials"
            access_token, refresh_token = None, None
            status = 404
        else:
            response = user.login(args.password)
            if response is None:
                msg = "Incorrect login credentials"
                access_token, refresh_token = None, None
                status = 401
            else:
                add_flush(Login(user_id=user.id))
                LoginStatistic.update(user.id)
                WorkdayLoginStatistic.update(user.id)
                WeekendLoginStatistic.update(user.id)
                commit()
                msg = f"Logged in as {user.first_name} {user.last_name}"
                access_token, refresh_token = response
                status = 200
        return make_response(jsonify({
            "message": msg,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }), status)


class ChangePassword(Resource):
    """
    Endpoint for changing user password.
    If email is present in request body,
    change password of that user if the
    sender is an admin. Otherwise, changes
    the password of the authorized user.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("old_password", type=str, required=False,
                                   default=None)
        self.reqparse.add_argument("new_password", type=str, required=True)
        self.reqparse.add_argument(
            "email", type=str, required=False, default=None)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())

        if not args.email:
            if not args.old_password:
                msg = "Missing parameter: 'old_password'"
                status = 406
            elif user.check_password(args.old_password):
                user.change_password(args.new_password)
                msg = "Password changed succesfully"
                status = 200
            else:
                msg = "Failed to change password: old password is invalid"
                status = 401
        else:
            if user.access_level >= AccessLevel.ADMIN:
                other_user = User.get_by_email(args.email)
                if other_user:
                    other_user.change_password(args.new_password)
                    msg = f"Password of {args.email} was changed succesfully"
                    status = 200
            else:
                msg = "User is unauthorized to change other users passwords."
                status = 401

        return make_response(jsonify({
            "message": msg
        }), status)


class RefreshToken(Resource):
    """
    Endpoint for refreshing JWT-tokens.
    """

    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        access_token = create_access_token(
            identity=current_user)

        return jsonify({"access_token": access_token})


class Authorize(Resource):
    """
    Endpoint for authorizing an user to a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument("email", type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        admin_user = User.get_by_email(get_jwt_identity())
        user = User.get_by_email(args.email)

        if admin_user.access_level >= AccessLevel.ADMIN:
            try:
                user.authorize(args.project_id)
                msg = f"{user} added to project {args.project_id}"
                status = 200
            except Exception as e:
                msg = f"Could not authorize user: {e}"
                status = 404
        else:
            msg = "User is not authorized to authorize other users"

        return make_response(jsonify({"message": msg}), status)


class Deauthorize(Resource):
    """
    Endpoint for deauthorizing an user from a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("email", type=str, required=True)
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        admin_user = User.get_by_email(get_jwt_identity())
        user = User.get_by_email(args.email)

        if admin_user.access_level >= AccessLevel.ADMIN:
            try:
                user.deauthorize(args.project_id)
                msg = f"{user} removed from project {args.project_id}"
                status = 200
            except Exception as e:
                msg = f"Could not deauthorize user: {e}"
                status = 404
        else:
            msg = "User is not authorized to deauthorize other users"
            status = 404

        return make_response(jsonify({"message": msg}), status)


class NewDefaultLabel(Resource):
    """
    Endpoint for adding a new default label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("label_name", type=str, required=True)
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())

        if user.access_level >= AccessLevel.ADMIN:
            try:
                project = Project.query.filter_by(id=args.project_id).first()
                return make_response(jsonify(try_add_response(
                    DefaultLabel(project, args.label_name)
                )), 200)
            except Exception as e:
                msg = f"Could not create default label: {e}"
                status = 404
        else:
            msg = "User is not authorized to create default labels."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class NewProject(Resource):
    """
    Endpoint for creating a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_name", type=str, required=True)
        self.reqparse.add_argument("project_type", type=int, required=True)
        self.reqparse.add_argument(
            "labels_per_datapoint", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())

        if user.access_level >= AccessLevel.ADMIN:
            try:
                ProjectStatistic.update(user.id)
                return make_response(jsonify(try_add_response(
                    Project(args.project_name, args.project_type,
                            args.labels_per_datapoint)
                )), 200)
            except Exception as e:
                msg = f"Could not create project: {e}"
                status = 404
        else:
            msg = "User is not authorized to create projects."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class RemoveDefaultLabel(Resource):
    """
    Endpoint for removing a default label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument("label_name", type=str, required=True)

    @jwt_required()
    def delete(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)

        if user.access_level >= AccessLevel.ADMIN:
            try:
                labels = project.default_labels
                for label in labels:
                    if label.name == args.label_name:
                        return make_response(jsonify(try_delete_response(
                            label)), 200)

                msg = f"Label {args.label_name} does not exist"
                status = 404
            except Exception as e:
                msg = f"Could not remove default label: {e}"
                status = 404
        else:
            msg = "User is not authorized to remove default labels."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class RemoveProject(Resource):
    """
    Endpoint for removing a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def delete(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())

        if user.access_level >= AccessLevel.ADMIN:
            try:
                return make_response(jsonify(try_delete_response(
                    Project.query.get(args.project_id)
                )), 200)
            except Exception as e:
                msg = f"Could not remove project: {e}"
                status = 404
        else:
            msg = "User is not authorized to remove projects."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class ChangeLabelsPerDatapoint(Resource):
    """
    Endpoint for changing labels per datapoint before
    a project is finished.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument(
            "labels_per_datapoint", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)
        status = 401
        msg = "You are not authorized to change this parameter"

        if user.access_level >= AccessLevel.ADMIN:
            project.set_labels_per_datapoint(args.labels_per_datapoint)
            status = 200
            msg = "Labels per datapoint changed"

        project.check_finished()

        return make_response(jsonify({"message": msg}), status)


class RemoveUser(Resource):
    """
    Endpoint for removing a user.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("email", type=str, required=True)

    @jwt_required()
    def delete(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        deletion_candidate = User.get_by_email(args.email)

        if user.access_level >= AccessLevel.ADMIN:
            try:
                return jsonify(try_delete_response(deletion_candidate))
            except Exception as e:
                msg = f"Could not remove user: {e}"
        else:
            msg = "User is not authorized to delete other users"

        return jsonify({"message": msg})


class AddNewTextData(Resource):
    """
    Endpoint to add one or more text data points.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())

        if "json_file" not in request.files:
            msg = "No JSON file uploaded."
            status = 406
        elif user.access_level < AccessLevel.ADMIN:
            msg = "User is not authorized to add data."
            status = 401
        else:
            json_file = request.files["json_file"]
            if not allowed_extension(json_file.filename, TEXT_EXTENSIONS):
                return make_response(
                    jsonify({"message":
                             ("Invalid file extension for "
                              f"{json_file.filename}. \
                              Must be in "f"{TEXT_EXTENSIONS}")}), 406)

            try:
                import_text_data(args.project_id, json.load(json_file))
                ImportStatistic.update(user.id)
                commit()
                msg = "Data added."
                status = 200
            except Exception as e:
                msg = f"Could not add data: {e}"
                status = 404

        return make_response(jsonify({"message": msg}), status)


class AddNewImageData(Resource):
    """
    Endpoint to add one or more image data points.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)

        if not project:
            return make_response(jsonify({"message": "Invalid project id"}),
                                 404)

        if user.access_level < AccessLevel.ADMIN:
            msg = "User is not authorized to add data."
        elif "images" not in request.files:
            msg = "No images uploaded."
        elif "json_file" not in request.files:
            msg = "No JSON file uploaded."
        else:
            msg = None
            json_file = request.files.get("json_file")
            if not allowed_extension(json_file.filename, TEXT_EXTENSIONS):
                msg = (f"Invalid file extension for {json_file.filename}. "
                       f"Must be in {TEXT_EXTENSIONS}.")
                status = 406

            image_files = request.files.getlist("images")
            for file in image_files:
                if not allowed_extension(file.filename, IMAGE_EXTENSIONS):
                    msg = (f"Invalid file extension for {file.filename}. "
                           f"Must be in {IMAGE_EXTENSIONS}.")
                    status = 406
            if msg is not None:
                return make_response(jsonify({"message": msg}), status)

            image_dict = {secure_filename(
                file.filename): file.read() for file in image_files}
            try:
                import_image_data(args.project_id, json.load(json_file),
                                  image_dict)
                ImportStatistic.update(user.id)
                commit()
                msg = "Data added."
                status = 200
            except Exception as e:
                msg = f"Could not add data: {e}"
                status = 404

        return make_response(jsonify({"message": msg}), status)


class GetDefaultLabels(Resource):
    """
    Endpoint to retrieve default labels.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)

        if not project:
            return make_response(jsonify({"message": "Invalid project id"}),
                                 404)

        if project in user.projects or user.access_level >= AccessLevel.ADMIN:
            status = 200
            try:
                labels = []
                label_info = {}

                labels = project.default_labels
                for label in labels:
                    label_info[label.id] = {
                        "name": label.name,
                    }

                return make_response(jsonify(label_info), status)
            except Exception as e:
                msg = f"Could not get data: {e}"
                status = 404
        else:
            msg = "User is not authorized to get data."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class GetNewData(Resource):
    """
    Endpoint to retrieve data to be labeled.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument("type", type=int, required=True)
        self.reqparse.add_argument("index", type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)

        if not project:
            return make_response(jsonify({"message": "Invalid project id"}),
                                 404)

        if project in user.projects or user.access_level >= AccessLevel.ADMIN:
            status = 200
            try:
                if args.type == GetDataType.GET_EARLIER_VALUE:
                    return make_response(jsonify(project.get_earlier_data(
                        args.index)), status)
                elif args.type == GetDataType.GET_LIST:
                    return make_response(jsonify(project.get_data(
                        user.id)), status)
                elif args.type == GetDataType.GET_NEXT_VALUE:
                    return make_response(jsonify(project.get_next_data(
                        args.index)), status)
                else:
                    msg = "Wrong type of input."
                    status = 404

            except Exception as e:
                msg = f"Could not get data: {e}"
                status = 404
        else:
            msg = "User is not authorized to get data."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class GetAmountOfData(Resource):
    """
    Endpoint to retrieve amount of data in a project and amount
    of data labeled by a user in the same project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        user_id = user.id
        project = Project.query.get(args.project_id)
        amountOfData = len(project.data)
        user_labels = 0
        for data in project.data:
            for label in data.labels:
                if (user_id == label.user_id):
                    user_labels += 1
                    break
        return make_response(jsonify({"dataAmount": amountOfData,
                                      "labeledByUser": user_labels}), 200)


class GetLabel(Resource):
    """
    Endpoint to retrieve labels either
    by userid and labelid, or all labels
    by a user.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument("data_id", type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)

        labels = Label.query.filter_by(
            data_id=args.data_id, user_id=user.id).all()

        res = {}

        if labels and project:
            for label in labels:
                res.update(label.format_json())
            status = 200
            msg = "Labels retrieved"
        elif project:
            status = 200
            msg = f"No labels by {user.first_name} " + (
                f"{user.last_name} found in project {project.name}")
        else:
            status = 401
            msg = f"No project with id {args.project_id} found"

        return make_response(jsonify({"message": msg, "labels": res}), status)


class CreateDocumentClassificationLabel(Resource):
    """
    Endpoint for creating a document classification label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("data_id", type=int, required=True)
        self.reqparse.add_argument("label", type=str, required=True)
        self.reqparse.add_argument("color", type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        data = ProjectData.query.get(args.data_id)

        if not data:
            return make_response(jsonify({"message": "Invalid datapoint"}),
                                 404)

        if user.is_authorized(data.project.id):
            try:
                # Only update statistic once per data
                if not data.has_labeled(user.id):
                    LabelingStatistic.update(user.id)
                response = make_response(jsonify(try_add_response(
                    DocumentClassificationLabel(
                        args.data_id, user.id, args.label, args.color)
                )), 200)

                data.check_finished()
                return response
            except Exception as e:
                msg = f"Could not create label: {e}"
                status = 404
        else:
            msg = "User is not authorized to create label."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class CreateSequenceLabel(Resource):
    """
    Endpoint for creating a sequence label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("data_id", type=int, required=True)
        self.reqparse.add_argument("label", type=str, required=True)
        self.reqparse.add_argument("begin", type=int, required=True)
        self.reqparse.add_argument("color", type=str, required=True)
        self.reqparse.add_argument("end", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        data = ProjectData.query.get(args.data_id)

        if not data:
            return make_response(jsonify({"message": "Invalid datapoint"}),
                                 404)

        if user.is_authorized(data.project.id):
            try:
                # Only update statistic once per data
                if not data.has_labeled(user.id):
                    LabelingStatistic.update(user.id)
                response = make_response(jsonify(try_add_response(
                    SequenceLabel(args.data_id, user.id, args.label,
                                  args.begin, args.end, args.color))), 200)
                data.check_finished()
                return response
            except Exception as e:
                msg = f"Could not create label: {e}"
                status = 404
        else:
            msg = "User is not authorized to create label."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class CreateSequenceToSequenceLabel(Resource):
    """
    Endpoint for creating a sequence to sequence label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("data_id", type=int, required=True)
        self.reqparse.add_argument("label", type=str, required=True)
        self.reqparse.add_argument("color", type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        data = ProjectData.query.get(args.data_id)

        if not data:
            return make_response(jsonify({"message": "Invalid datapoint"}),
                                 404)

        if user.is_authorized(data.project.id):
            try:
                # Only update statistic once per data
                if not data.has_labeled(user.id):
                    LabelingStatistic.update(user.id)
                response = make_response(jsonify(try_add_response(
                    SequenceToSequenceLabel(
                        args.data_id, user.id, args.label, args.color)
                )), 200)

                data.check_finished()
                return response
            except Exception as e:
                msg = f"Could not create label: {e}"
                status = 404
        else:
            msg = "User is not authorized to create label."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class CreateImageClassificationLabel(Resource):
    """
    Endpoint for creating a image classification label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("data_id", type=int, required=True)
        self.reqparse.add_argument("label", type=str, required=True)
        self.reqparse.add_argument("x1", type=int, required=True)
        self.reqparse.add_argument("y1", type=int, required=True)
        self.reqparse.add_argument("x2", type=int, required=True)
        self.reqparse.add_argument("y2", type=int, required=True)
        self.reqparse.add_argument("color", type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        data = ProjectData.query.get(args.data_id)

        if not data:
            return make_response(jsonify({"message": "Invalid datapoint"}),
                                 404)

        if user.is_authorized(data.project.id):
            try:
                # Only update statistic once per data
                if not data.has_labeled(user.id):
                    LabelingStatistic.update(user.id)
                response = make_response(jsonify(try_add_response(
                    ImageClassificationLabel(
                        args.data_id, user.id, args.label,
                        (args.x1, args.y1), (args.x2, args.y2), args.color)
                )), 200)

                data.check_finished()
                return response
            except Exception as e:
                msg = f"Could not create label: {e}"
                status = 404
        else:
            msg = "User is not authorized to create label."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class DeleteLabel(Resource):
    """
    Endpoint for deleting a label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("label_id", type=int, required=True)

    @jwt_required()
    def delete(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        label = Label.query.get(args.label_id)

        if not label:
            return make_response(jsonify({"message": "Failed to remove label \
                                                Invalid label id"}), 404)

        if (label.user_id == user.id
                or (user.access_level >= AccessLevel.ADMIN)):
            try:
                response = make_response(
                    jsonify(try_delete_response(label)), 200)
                data = ProjectData.query.get(label.data_id)
                data.check_finished()
                return response
            except Exception as e:
                msg = f"Could not remove label: {e}"
                status = 404
        else:
            msg = "User is not authorized to remove this label."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class FetchUserInfo(Resource):
    """
    Fetch the logged in user's information.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()

    @jwt_required()
    def get(self):
        email = get_jwt_identity()
        current_user = User.get_by_email(email)
        name = f"{current_user.first_name} {current_user.last_name}"

        return make_response(jsonify({
            "name": name,
            "email": email,
            "access_level": current_user.access_level
        }))


class FetchUsers(Resource):
    """
    Fetch all users email.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()

    @jwt_required()
    def get(self):
        user = User.get_by_email(get_jwt_identity())

        if user.access_level >= AccessLevel.ADMIN:
            users = []
            user_info = {}

            users = User.query.all()
            for user in users:
                user_info[user.id] = {
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email,
                    "admin": user.access_level
                }

            return jsonify({"msg": "Retrieved user information",
                            "users": user_info})

        else:
            msg = "User is not authorized to fetch users."
            return jsonify({"msg": msg})


class FetchProjectUsers(Resource):
    """
    Fetch all users that is authorizeed to the project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        current_user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)
        users = []
        users_email = []
        msg = "Fetching users failed."
        status = 400

        if current_user.access_level >= AccessLevel.ADMIN:
            users = project.users

            for user in users:
                users_email.append(user.email)

            msg = "Users received."
            status = 200

        return make_response(jsonify({"msg": msg, "users": users_email}),
                             status)


class FetchUserProjects(Resource):
    """
    Fetch all projects that a user is authorized to
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()

    @jwt_required()
    def get(self):
        current_user = User.get_by_email(get_jwt_identity())
        user_projects = {}
        projects = []
        msg = "No projects found"
        status = 404

        if current_user.access_level >= AccessLevel.ADMIN:
            projects = Project.query.all()
        else:
            projects = current_user.projects

        if projects:
            for project in projects:
                user_projects[project.id] = {
                    "id": project.id,
                    "name": project.name,
                    "type": project.project_type,
                    "created": project.created,
                    "labels_per_datapoint": project.labels_per_datapoint,
                    "finished": project.finished,
                    "progress": project.get_progress()
                }
            msg = "Retrieved user projects"
            status = 200
        else:
            user_projects = []
            msg = "No projects found"
            status = 200
        return make_response(jsonify({"msg": msg,
                                      "projects": user_projects}), status)


class GetProjectProgress(Resource):
    """
    Endpoint for retrieving progress in a project
    as a percentage.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        project = Project.query.get(args.project_id)

        if not project:
            return make_response(
                jsonify({"message": "Invalid project id"}), 404)

        return make_response(
            jsonify({
                "message": "Progress retrieved",
                "progress": project.get_progress()
            }), 200)


class GetExportData(Resource):
    """
    Endpoint for exporting data from project according to filters.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument("filter", type=str,
                                   required=False,
                                   action="append")

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)

        if not project:
            return make_response(jsonify({"message": "Invalid project id"}),
                                 404)

        if user.access_level >= AccessLevel.ADMIN:
            try:
                data = export_data(project.id)
                ExportStatistic.update(user.id)
                commit()
                if (project.project_type == ProjectType.IMAGE_CLASSIFICATION):
                    return make_response(send_file(
                        data,
                        attachment_filename=f"{project.name}.zip",
                        as_attachment=True
                    ), 200)
                else:
                    return make_response(data, 200)
            except Exception as e:
                msg = f"Could not export data: {e}"
                status = 404
        else:
            msg = "User is not authorized to export data."
            status = 401

        return make_response(jsonify({"message": msg}), status)


class GetImageData(Resource):
    """
    Endpoint for getting the image file from a data point.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("data_id", type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        data = ProjectData.query.get(args.data_id)
        if not data or (
                data.project.project_type != ProjectType.IMAGE_CLASSIFICATION):
            msg = "Data is not an image."
            status = 406
        else:
            try:
                return make_response(send_file(
                    data.get_image_file(),
                    attachment_filename=data.file_name,
                    as_attachment=True), 200)
            except Exception as e:
                msg = f"Could not get image: {e}"
                status = 404
        return make_response(jsonify({"message": msg}), status)


class GetUnnotifiedAchievements(Resource):
    """
    Endpoint that returns a list of achievements which have not been displayed
    for the user.
    """
    @jwt_required()
    def get(self):
        user = User.get_by_email(get_jwt_identity())
        achieve_list = Achievement.get_unnotified(user.id)
        return jsonify(achieve_list)


class GetAchievements(Resource):
    """
    Endpoint that returns a list of all the user's achievements whether they've
    been earned or not.
    """
    @jwt_required()
    def get(self):
        user = User.get_by_email(get_jwt_identity())
        achieve_list = Achievement.query.filter_by(user_id=user.id)
        return jsonify([achieve.format_json() for achieve in achieve_list])


class GetStatistics(Resource):
    """
    Endpoint that returns a list of all the user's achievements whether they've
    been earned or not.
    """
    @jwt_required()
    def get(self):
        user = User.get_by_email(get_jwt_identity())
        stat_list = Statistic.query.filter_by(user_id=user.id)
        return jsonify([stat.format_json() for stat in stat_list])


class Reset(Resource):
    """
    Reset defines an endpoint used to reset the database for use during
    development.
    """

    def get(self):
        reset_db()
        admin = User("Admin", "Admin", "admin@admin.com", "password", True)
        add_flush(admin)
        add_stats_to_new_user(admin.id)
        commit()


rest.add_resource(Ping, "/ping")
rest.add_resource(CreateUser, "/create-user")
rest.add_resource(LoginUser, "/login")
rest.add_resource(ChangePassword, "/change-password")
rest.add_resource(RefreshToken, "/refresh-token")
rest.add_resource(Authorize, "/authorize-user")
rest.add_resource(Deauthorize, "/deauthorize-user")
rest.add_resource(NewDefaultLabel, "/create-default-label")
rest.add_resource(NewProject, "/create-project")
rest.add_resource(RemoveDefaultLabel, "/delete-default-label")
rest.add_resource(RemoveProject, "/delete-project")
rest.add_resource(ChangeLabelsPerDatapoint, "/labels-per-data")
rest.add_resource(RemoveUser, "/delete-user")
rest.add_resource(AddNewTextData, "/add-text-data")
rest.add_resource(AddNewImageData, "/add-image-data")
rest.add_resource(GetDefaultLabels, "/get-default-labels")
rest.add_resource(GetNewData, "/get-data")
rest.add_resource(GetAmountOfData, "/get-data-amount")
rest.add_resource(GetLabel, "/get-label")
rest.add_resource(CreateDocumentClassificationLabel, "/label-document")
rest.add_resource(CreateSequenceLabel, "/label-sequence")
rest.add_resource(CreateSequenceToSequenceLabel, "/label-sequence-to-sequence")
rest.add_resource(CreateImageClassificationLabel, "/label-image")
rest.add_resource(DeleteLabel, "/remove-label")
rest.add_resource(FetchUserInfo, '/get-user-info')
rest.add_resource(FetchUsers, '/get-users')
rest.add_resource(GetProjectProgress, '/get-project-progress')
rest.add_resource(FetchProjectUsers, '/get-project-users')
rest.add_resource(FetchUserProjects, '/get-user-projects')
rest.add_resource(GetExportData, "/get-export-data")
rest.add_resource(GetImageData, "/get-image-data")
rest.add_resource(GetUnnotifiedAchievements, "/get-unnotified-achievements")
rest.add_resource(GetAchievements, "/get-achievements")
rest.add_resource(GetStatistics, "/get-statistics")

if IS_DEV_MODE:
    rest.add_resource(Reset, "/reset")
