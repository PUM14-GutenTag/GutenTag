"""
This file contains the routes to the database.
"""


from api import app, rest, db
from api.models import Test, User, Project
from api.database_handler import create_user, reset_db
from flask_restful import Resource


class TestModels(Resource):
    """
    This is a test class used to test the functionality of the database models.
    """

    def get(self):
        t = Test()
        db.session.add(t)

        x = create_user("Oscar",
                        "Lonnqvist",
                        "oscar@mail.com",
                        True
                        )
        print(x)

        # project = Project(name=str(len(Test.query.all())),
        #   project_type="Phrase")
        # db.session.add(project)

        # user.projects.append(project)

        db.session.commit()
        return {"result": repr(User.query.all())}


class Reset(Resource):
    """
    Reset defines an endpoint used to reset the database for use during
    development.
    """

    def get(self):
        reset_db()


rest.add_resource(TestModels, '/')
rest.add_resource(Reset, '/reset')
