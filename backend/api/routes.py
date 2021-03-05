from api import rest, db
from api.models import Test, User
from api.database_handler import create_user, reset_db
from flask_restful import Resource
"""
This file contains the routes to the database.
"""


class TestModels(Resource):
    """
    This is a test class used to test the functionality of the database models.
    """

    def get(self):
        t = Test()
        db.session.add(t)

        create_user("Oscar",
                    "Lonnqvist",
                    "oscar@mail.com" + str(len(User.query.all())),
                    False
                    )

        db.session.commit()
        return {"result": len(User.query.all())}


class Reset(Resource):
    """
    Reset defines an endpoint used to reset the database for use during
    development.
    """

    def get(self):
        reset_db()


rest.add_resource(TestModels, '/')
rest.add_resource(Reset, '/reset')
