from flask import jsonify, send_file
from flask_restful import Resource, reqparse, inputs, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.utils import secure_filename
from api import rest
from api.models import (
    AccessLevel,
    Project,
    ProjectData,
    ProjectType,
    Label,
    DocumentClassificationLabel,
    SequenceLabel,
    SequenceToSequenceLabel,
    ImageClassificationLabel,
    User
)
from api.database_handler import (
    reset_db,
    try_add,
    try_add_response,
    try_delete_response
)
from api.parser import (
    import_document_classification_data,
    import_sequence_labeling_data,
    import_sequence_to_sequence_data,
    import_image_classification_data,
    export_document_classification_data,
    export_sequence_labeling_data,
    export_sequence_to_sequence_data,
    export_image_classification_data
)
"""
This file contains the routes to the database.
"""

IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_image_extension(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in IMAGE_EXTENSIONS


class Register(Resource):
    """
    THIS ENDPOINT IS ONLY FOR DEVELOPMENT PURPOSES AND WILL BE REMOVED
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("first_name", type=str, required=True)
        self.reqparse.add_argument("last_name", type=str, required=True)
        self.reqparse.add_argument("email", type=str, required=True)
        self.reqparse.add_argument("password", type=str, required=True)
        self.reqparse.add_argument("admin", type=inputs.boolean,
                                   required=False, default=False)

    def post(self):
        args = self.reqparse.parse_args()

        user = User(args.first_name, args.last_name, args.email, args.password,
                    args.admin)
        return jsonify(try_add_response(user))


class CreateUser(Resource):
    """
    Endpoint for creating an user.
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
            new_user = User(args.first_name, args.last_name, args.email, args.password, 
                args.admin)
            return jsonify(try_add_response(new_user))

        return jsonify({"id": None, "message": \
             "You are not authorized to create other users."})


class Login(Resource):
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
        else:
            response = user.login(args.password)
            if response is None:
                msg = "Incorrect login credentials"
                access_token, refresh_token = None, None
            else:
                msg = f"Logged in as {user.first_name} {user.last_name}"
                access_token, refresh_token = response

        return jsonify({
            "message": msg,
            "access_token": access_token,
            "refresh_token": refresh_token
        })


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
        self.reqparse.add_argument("email", type=str, required=False, default=None)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        msg = "Failed to change password: old password is invalid"

        if not args.email:
            if not args.old_password:
                msg = "Missing parameter: 'old_password'"
            elif user.check_password(args.old_password):
                user.change_password(args.new_password)
                msg = "Password changed succesfully"
        else:
            if user.access_level >= AccessLevel.ADMIN:
                other_user = User.get_by_email(args.email)
                if other_user:
                    other_user.change_password(args.new_password)
                    msg = f"Password of {args.email} was changed succesfully"
            else:
                msg = "User is unauthorized to change other users passwords."

        return jsonify({
            "message": msg
        })

        
class RefreshToken(Resource):
    """
    Endpoint for refreshing JWT-tokens.
    """
    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)

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
        user = User.get_by_email(get_jwt_identity())

        if user.access_level >= AccessLevel.ADMIN:
            try:
                user.authorize(args.project_id)
                msg = f"{user} added to project {args.project_id}"
            except Exception as e:
                msg = f"Could not authorize user: {e}"
        else:
            msg = "User is not authorized to authorize other users"

        return jsonify({"message": msg})


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
        user = User.get_by_email(get_jwt_identity())

        if user.access_level >= AccessLevel.ADMIN:
            try:
                user.deauthorize(args.project_id)
                msg = f"{user} removed from project {args.project_id}"
            except Exception as e:
                msg = f"Could not deauthorize user: {e}"
        else:
            msg = "User is not authorized to deauthorize other users"

        return jsonify({"message": msg})


class NewProject(Resource):
    """
    Endpoint for creating a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_name", type=str, required=True)
        self.reqparse.add_argument("project_type", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())

        if user.access_level >= AccessLevel.ADMIN:
            try:
                return jsonify(try_add_response(
                    Project(args.project_name, args.project_type)
                ))
            except Exception as e:
                msg = f"Could not create project: {e}"
        else:
            msg = "User is not authorized to create projects."

        return jsonify({"message": msg})


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
                return jsonify(try_delete_response(
                    Project.query.get(args.project_id)
                ))
            except Exception as e:
                msg = f"Could not remove project: {e}"
        else:
            msg = "User is not authorized to remove projects."

        return jsonify({"message": msg})


class AddNewTextData(Resource):
    """
    Endpoint to add one or more text data points.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument("json_data", type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)

        if user.access_level >= AccessLevel.ADMIN:
            import_funcs = {
                1: import_document_classification_data,
                2: import_sequence_labeling_data,
                3: import_sequence_to_sequence_data,
            }
            try:
                import_funcs[project.project_type](
                    args.project_id, args.json_data)
                msg = "Data added."
            except Exception as e:
                msg = f"Could not add data: {e}"
        else:
            msg = "User is not authorized to add data."

        return jsonify({"message": msg})


class AddNewImageData(Resource):
    """
    Endpoint to add one or more image data points.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument("json_data", type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()

        if "images" not in request.files:
            msg = "No images uploaded."
        else:
            image_files = request.files.getlist("images")
            for file in image_files:
                if not allowed_image_extension(file.filename):
                    return jsonify(
                        {"message": ("Invalid file extension. "
                                     f"must be one of {IMAGE_EXTENSIONS}")}
                    )
            image_dict = {secure_filename(
                file.filename): file.read() for file in image_files}
            user = User.get_by_email(get_jwt_identity())
            if user.access_level >= AccessLevel.ADMIN:
                try:
                    import_image_classification_data(
                        args.project_id, args.json_data, image_dict)
                    msg = "Data added."
                except Exception as e:
                    msg = f"Could not add data: {e}"
            else:
                msg = "User is not authorized to add data."

        return jsonify({"message": msg})


class GetNewData(Resource):
    """
    Endpoint to retrieve data to be labeled.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("project_id", type=int, required=True)
        self.reqparse.add_argument("amount", type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        project = Project.query.get(args.project_id)

        if user.access_level >= AccessLevel.ADMIN:
            try:
                return jsonify(project.get_data(user.id, args.amount))
            except Exception as e:
                msg = f"Could not add data: {e}"
        else:
            msg = "User is not authorized to add data."

        return jsonify({"message": msg})


class CreateDocumentClassificationLabel(Resource):
    """
    Endpoint for creating a document classification label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("data_id", type=int, required=True)
        self.reqparse.add_argument("label", type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        data = ProjectData.query.get(args.data_id)

        if user.is_authorized(data.project.id):
            try:
                return jsonify(try_add_response(
                    DocumentClassificationLabel(
                        args.data_id, user.id, args.label)
                ))
            except Exception as e:
                msg = f"Could not create label: {e}"
        else:
            msg = "User is not authorized to create label."

        return jsonify({"message": msg})


class CreateSequenceLabel(Resource):
    """
    Endpoint for creating a sequence label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("data_id", type=int, required=True)
        self.reqparse.add_argument("label", type=str, required=True)
        self.reqparse.add_argument("begin", type=int, required=True)
        self.reqparse.add_argument("end", type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        data = ProjectData.query.get(args.data_id)

        if user.is_authorized(data.project.id):
            try:
                return jsonify(try_add_response(
                    SequenceLabel(args.data_id, user.id, args.label,
                                  args.begin, args.end)))
            except Exception as e:
                msg = f"Could not create label: {e}"
        else:
            msg = "User is not authorized to create label."

        return jsonify({"message": msg})


class CreateSequenceToSequenceLabel(Resource):
    """
    Endpoint for creating a sequence to sequence label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument("data_id", type=int, required=True)
        self.reqparse.add_argument("label", type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        data = ProjectData.query.get(args.data_id)

        if user.is_authorized(data.project.id):
            try:
                return jsonify(try_add_response(
                    SequenceToSequenceLabel(
                        args.data_id, user.id, args.label)
                ))
            except Exception as e:
                msg = f"Could not create label: {e}"
        else:
            msg = "User is not authorized to create label."

        return jsonify({"message": msg})


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

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        user = User.get_by_email(get_jwt_identity())
        data = ProjectData.query.get(args.data_id)

        if user.is_authorized(data.project.id):
            try:
                return jsonify(try_add_response(
                    ImageClassificationLabel(
                        args.data_id, user.id, args.label,
                        (args.x1, args.y1), (args.x2, args.y2))
                ))
            except Exception as e:
                msg = f"Could not create label: {e}"
        else:
            msg = "User is not authorized to create label."

        return jsonify({"message": msg})


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

        if (label.user_id == user.id
                or (user.access_level >= AccessLevel.ADMIN)):
            try:
                return jsonify(try_delete_response(label))
            except Exception as e:
                msg = f"Could not remove label: {e}"
        else:
            msg = "User is not authorized to remove this label."

        return jsonify({"message": msg})


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

        if user.access_level >= AccessLevel.ADMIN:
            export_funcs = {
                1: export_document_classification_data,
                2: export_sequence_labeling_data,
                3: export_sequence_to_sequence_data,
                4: export_image_classification_data
            }
            try:
                return export_funcs[project.project_type](args.project_id)
            except Exception as e:
                msg = f"Could not export data: {e}"
        else:
            msg = "User is not authorized to export data."

        return jsonify({"message": msg})


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
        if (data.project.project_type != ProjectType.IMAGE_CLASSIFICATION):
            msg = "Data is not an image."
        else:
            try:
                return send_file(data.get_image_file(),
                                 attachment_filename=data.file_name,
                                 as_attachment=True)
            except Exception as e:
                msg = f"Could not get image: {e}"
        return jsonify({"message": msg})


class Reset(Resource):
    """
    Reset defines an endpoint used to reset the database for use during
    development.
    """

    def get(self):
        reset_db()
        admin = User("Admin", "Admin", "admin@admin", "password", True)
        try_add(admin)


rest.add_resource(Register, "/register")
rest.add_resource(CreateUser, "/create-user")
rest.add_resource(Login, "/login")
rest.add_resource(ChangePassword, "/change-password")
rest.add_resource(RefreshToken, "/refresh-token")
rest.add_resource(Authorize, "/authorize-user")
rest.add_resource(Deauthorize, "/deauthorize-user")
rest.add_resource(NewProject, "/create-project")
rest.add_resource(RemoveProject, "/delete-project")
rest.add_resource(AddNewTextData, "/add-text-data")
rest.add_resource(AddNewImageData, "/add-image-data")
rest.add_resource(GetNewData, "/get-data")
rest.add_resource(CreateDocumentClassificationLabel, "/label-document")
rest.add_resource(CreateSequenceLabel, "/label-sequence")
rest.add_resource(CreateSequenceToSequenceLabel, "/label-sequence-to-sequence")
rest.add_resource(CreateImageClassificationLabel, "/label-image")
rest.add_resource(DeleteLabel, "/remove-label")
rest.add_resource(GetExportData, "/get-export-data")
rest.add_resource(GetImageData, "/get-image-data")
rest.add_resource(Reset, "/reset")
