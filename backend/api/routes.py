from api import app, rest, db
from flask import jsonify
from api.models import Test, User
from flask_restful import Resource, reqparse
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)

from api.database_handler import (
    create_user,
    login_user,
    create_project,
    add_data,
    delete_project,
    authorize_user,
    deauthorize_user,
    label_data,
    remove_label,
    reset_db,
    get_user_by
)


class register(Resource):
    """
    Endpoint for registering an user
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('first_name', type=str, required=True)
        self.reqparse.add_argument('last_name', type=str, required=True)
        self.reqparse.add_argument('email', type=str, required=True)
        self.reqparse.add_argument('password', type=str, required=True)

    def post(self):
        args = self.reqparse.parse_args()

        return jsonify(create_user(args.first_name, args.last_name,
                                   args.email, args.password))


class login(Resource):
    """
    Endpoint for logging in an user
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('email', type=str, required=True)
        self.reqparse.add_argument('password', type=str, required=True)

    def get(self):
        args = self.reqparse.parse_args()
        return login_user(args.email, args.password)


class refresh_token(Resource):
    """
    Endpoint for refreshing JWT-tokens
    """
    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)

        return {'access_token': access_token}


class authorize(Resource):
    """
    Endpoint for authorizing an user to a project
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)

    def post(self):
        # args = self.reqparse.parse_args()
        # return jsonify(db_handler.authorize_user(args.project_id,
        #  args.user_id))
        return jsonify({"message": "Authorize not implemented in API"})


class deauthorize(Resource):
    """
    Endpoint for deauthorizing an user from a project
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)

    def post(self):
        # args = self.reqparse.parse_args()
        # return jsonify(db_handler.deauthorize_user(args.project_id, user_id))
        return jsonify({"message": "Deauthorize not implemented in API"})
        # return db_handler.authorize_user(args.project_id)


class new_project(Resource):
    """
    Endpoint for creating a project
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_name', type=str, required=True)
        self.reqparse.add_argument('project_type', type=str, required=True)

    def post(self):
        # args = self.reqparse.parse_args()
        # return jsonify(db_handler.create_project(args.user_id, args.project_name,
        # args.project_type))
        return jsonify({"message": "Create project not implemented in API"})


class remove_project(Resource):
    """
    Endpoint for removing a project
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)

    def delete(self):
        # args = self.reqparse.parse_args()
        # return jsonify(db_handler.create_project(args.user_id, args.project_id))
        return jsonify({"message": "Delete project not implemented in API"})


class get_data(Resource):
    """
    Endpoint to retrieve data to be labeled
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument('amount', type=int, required=True)

    def get(self):
        # args = self.reqparse.parse_args()
        return jsonify({"message": "Get data not implemented in API"})


class create_label(Resource):
    """
    Endpoint for creating a label
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('data_id', type=int, required=True)
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('label', type=str, required=True)

    def post(self):
        # args = self.reqparse.parse_args()
        # return jsonify(db_handler.label_data(args.data_id, args.user_id,
        # args.label))
        return jsonify({"message": "Label data not implemented in API"})


class delete_label(Resource):
    """
    Endpoint for deleting a label
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('label_id', type=int, required=True)
        # self.reqparse.add_argument('user_id', type=int, required=True)
        # self.reqparse.add_argument('project_id', type=int, required=True)
        # self.reqparse.add_argument('data_id', type=str, required=True)

    def delete(self):
        # args = self.reqparse.parse_args()
        # return jsonify(db_handler.remove_label(args.label_id))
        return jsonify({"message": "Remove label not implemented in API"})


class get_export_data(Resource):
    """
    Endpoint for exporting data from project according to filters
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument(
            'filter', type=str, required=False, action='append')

    def get(self):
        # args = self.reqparse.parse_args()
        return jsonify({"message": "Get export data not implemented in API"})


class Reset(Resource):
    """
    Reset defines an endpoint used to reset the database for use during
    development.
    """

    def get(self):
        reset_db()


rest.add_resource(register, '/register')
rest.add_resource(login, '/login')
rest.add_resource(refresh_token, '/refresh-token')
rest.add_resource(authorize, '/authorize-user')
rest.add_resource(deauthorize, '/deauthorize-user')
rest.add_resource(new_project, '/create-project')
rest.add_resource(remove_project, '/delete-project')
rest.add_resource(get_data, '/get-data')
rest.add_resource(create_label, '/label-data')
rest.add_resource(delete_label, '/remove-label')
rest.add_resource(get_export_data, '/get-export-data')
rest.add_resource(Reset, '/reset')
