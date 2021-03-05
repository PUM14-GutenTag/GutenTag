from api import app, rest, db
from flask import jsonify
from flask_restful import Resource, reqparse


class register(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('username', type=str, required=True)
        self.reqparse.add_argument('email', type=str, required=True)
        self.reqparse.add_argument('password', type=str, required=True)

    def post(self):
        args = self.reqparse.parse_args()
        print(args)
        # return jsonify(db_handler.create_user(args.firstname, args.lastname,
        #  args.email))
        return jsonify({"message": "Register not implemented in API"})


class login(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('username', type=str, required=True)
        self.reqparse.add_argument('password', type=str, required=True)

    def get(self):
        #args = self.reqparse.parse_args()
        # return jsonify(db_handler.authorize_user(args.username, args.password))
        return jsonify({"message": "Login not implemented in API"})


class authorize(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)

    def post(self):
        #args = self.reqparse.parse_args()
        # return jsonify(db_handler.authorize_user(args.project_id, args.user_id))
        return jsonify({"message": "Authorize not implemented in API"})


class deauthorize(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)

    def post(self):
        #args = self.reqparse.parse_args()
        # return jsonify(db_handler.deauthorize_user(args.project_id, user_id))
        return jsonify({"message": "Deauthorize not implemented in API"})
        # return db_handler.authorize_user(args.project_id)


class create_project(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_name', type=str, required=True)
        self.reqparse.add_argument('project_type', type=str, required=True)

    def post(self):
        #args = self.reqparse.parse_args()
        # return jsonify(db_handler.create_project(args.user_id, args.project_name,
        # args.project_type))
        return jsonify({"message": "Create project not implemented in API"})


class delete_project(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)

    def delete(self):
        #args = self.reqparse.parse_args()
        # return jsonify(db_handler.create_project(args.user_id, args.project_id))
        return jsonify({"message": "Delete project not implemented in API"})


class get_data(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument('amount', type=int, required=True)

    def get(self):
        #args = self.reqparse.parse_args()
        return jsonify({"message": "Get data not implemented in API"})


"""
class label_text(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument('label', type=str, required=True)

    def post(self):
        return jsonify({"message": "Label text not implemented in API"})


class label_image(Resource):
    # This might not be neccesary - potential overlap with label_text.
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument('label', type=str, required=True)

    def post(self):
        return jsonify({"message": "Label image not implemented in API"})
"""


class label_data(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('data_id', type=int, required=True)
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('label', type=str, required=True)

    def post(self):
        #args = self.reqparse.parse_args()
        # return jsonify(db_handler.label_data(args.data_id, args.user_id,
        # args.label))
        return jsonify({"message": "Label data not implemented in API"})


class remove_label(Resource):
    # This might not be neccesary - potential overlap with label_text.
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('label_id', type=int, required=True)
        #self.reqparse.add_argument('user_id', type=int, required=True)
        #self.reqparse.add_argument('project_id', type=int, required=True)
        #self.reqparse.add_argument('data_id', type=str, required=True)

    def delete(self):
        #args = self.reqparse.parse_args()
        # return jsonify(db_handler.remove_label(args.label_id))
        return jsonify({"message": "Remove label not implemented in API"})


class get_export_data(Resource):
    # This might not be neccesary - potential overlap with label_text.
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('user_id', type=int, required=True)
        self.reqparse.add_argument('project_id', type=int, required=True)
        self.reqparse.add_argument(
            'filter', type=str, required=False, action='append')

    def get(self):
        #args = self.reqparse.parse_args()
        return jsonify({"message": "Get export data not implemented in API"})


rest.add_resource(register, '/register')
rest.add_resource(login, '/login')
rest.add_resource(authorize, '/authorize-user')
rest.add_resource(deauthorize, '/deauthorize-user')
rest.add_resource(create_project, '/create-project')
rest.add_resource(delete_project, '/delete-project')
rest.add_resource(get_data, '/get-data')
rest.add_resource(label_text, '/label-text')
rest.add_resource(label_image, '/label-image')
rest.add_resource(remove_label, '/remove-label')
rest.add_resource(get_export_data, '/get-export-data')
