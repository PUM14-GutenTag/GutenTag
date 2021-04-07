from api import rest
from flask import jsonify
from api.models import AccessLevel, ProjectData, Label
from flask_restful import Resource, reqparse, inputs
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from api.database_handler import (
    create_user,
    login_user,
    create_project,
    get_data,
    add_data,
    delete_project,
    authorize_user,
    deauthorize_user,
    label_data,
    remove_label,
    reset_db,
    get_user_by,
    is_authorized,
)


class Register(Resource):
    """
    Endpoint for registering an user.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('first_name', type=str, required=True)
        self.reqparse.add_argument('last_name', type=str, required=True)
        self.reqparse.add_argument('email', type=str, required=True)
        self.reqparse.add_argument('password', type=str, required=True)
        self.reqparse.add_argument('admin', type=inputs.boolean,
                                   required=False, default=False)

    def post(self):
        args = self.reqparse.parse_args()

        return jsonify(create_user(args.first_name, args.last_name,
                                   args.email, args.password, args.admin))


class Login(Resource):
    """
    Endpoint for logging in an user.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('email', type=str, required=True)
        self.reqparse.add_argument('password', type=str, required=True)

    def post(self):
        args = self.reqparse.parse_args()
        return login_user(args.email, args.password)


class RefreshToken(Resource):
    """
    Endpoint for refreshing JWT-tokens.
    """
    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)

        return {'access_token': access_token}


class Authorize(Resource):
    """
    Endpoint for authorizing an user to a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument('email', type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        current_user = get_user_by("email", get_jwt_identity())

        if current_user.access_level >= AccessLevel.ADMIN:
            return authorize_user(args.project_id, current_user.id)

        return {"message": "User is not authorized to authorize other users"}


class Deauthorize(Resource):
    """
    Endpoint for deauthorizing an user from a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('email', type=str, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        current_user = get_user_by("email", get_jwt_identity())

        if current_user.access_level >= AccessLevel.ADMIN:
            return deauthorize_user(args.project_id, current_user.id)

        return {"message": "User is not authorized to authorize other users"}


class NewProject(Resource):
    """
    Endpoint for creating a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('project_name', type=str, required=True)
        self.reqparse.add_argument('project_type', type=int, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        current_user = get_user_by("email", get_jwt_identity())

        if current_user.access_level >= AccessLevel.ADMIN:
            return create_project(args.project_name, args.project_type)

        return jsonify({"message": "User unauthorized to create a project."})


class RemoveProject(Resource):
    """
    Endpoint for removing a project.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('project_id', type=int, required=True)

    @jwt_required()
    def delete(self):
        args = self.reqparse.parse_args()
        current_user = get_user_by("email", get_jwt_identity())

        if current_user.access_level >= AccessLevel.ADMIN:
            return delete_project(args.project_id)

        return jsonify({"message": "User unauthorized to delete a project."})


class AddNewData(Resource):
    """
    Endpoint to add a single data point.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument('project_type', type=int, required=True)
        self.reqparse.add_argument('data', type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        current_user = get_user_by("email", get_jwt_identity())

        if current_user.access_level >= AccessLevel.ADMIN:
            return add_data(args.project_id, args.data, args.project_type)

        return jsonify({"message": "User unauthorized to add data"})


class GetNewData(Resource):
    """
    Endpoint to retrieve data to be labeled.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument('amount', type=int, required=True)

    @jwt_required()
    def get(self):
        args = self.reqparse.parse_args()
        current_user = get_user_by("email", get_jwt_identity())

        if is_authorized(args.project_id, current_user):
            return get_data(args.project_id, args.amount, current_user.id)

        return jsonify({"message": "User not authorized"})


class CreateLabel(Resource):
    """
    Endpoint for creating a label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('data_id', type=int, required=True)
        self.reqparse.add_argument('label', type=str, required=True)

    @jwt_required()
    def post(self):
        args = self.reqparse.parse_args()
        current_user = get_user_by("email", get_jwt_identity())

        project_data = ProjectData.query.get(args.data_id)
        project_id = project_data.project_id

        if is_authorized(project_id, current_user):
            return label_data(args.data_id, current_user.id, args.label)

        return jsonify({"message": "User not authorized"})


class DeleteLabel(Resource):
    """
    Endpoint for deleting a label.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('label_id', type=int, required=True)

    @jwt_required()
    def delete(self):
        args = self.reqparse.parse_args()
        current_user = get_user_by("email", get_jwt_identity())
        label = Label.query.get(args.label_id)

        if label.user_id == current_user.id or \
                (current_user.access_level >= AccessLevel.ADMIN):
            return remove_label(label)

        return jsonify({"message": "User unauthorized to remove this label"})


class GetExportData(Resource):
    """
    Endpoint for exporting data from project according to filters.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument(
            'filter', type=str, required=False, action='append')

    @jwt_required()
    def get(self):
        return jsonify({"message": "Get export data not implemented in API"})


class Reset(Resource):
    """
    Reset defines an endpoint used to reset the database for use during
    development.
    """

    def get(self):
        reset_db()


rest.add_resource(Register, '/register')
rest.add_resource(Login, '/login')
rest.add_resource(RefreshToken, '/refresh-token')
rest.add_resource(Authorize, '/authorize-user')
rest.add_resource(Deauthorize, '/deauthorize-user')
rest.add_resource(NewProject, '/create-project')
rest.add_resource(RemoveProject, '/delete-project')
rest.add_resource(AddNewData, '/add-data')
rest.add_resource(GetNewData, '/get-data')
rest.add_resource(CreateLabel, '/label-data')
rest.add_resource(DeleteLabel, '/remove-label')
rest.add_resource(GetExportData, '/get-export-data')
rest.add_resource(Reset, '/reset')
