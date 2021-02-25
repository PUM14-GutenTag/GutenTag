"""
This file contains the routes to the database.
"""


from api import app, rest, db
from api.models import Test, User, Project
from flask_restful import Resource


class TestModels(Resource):
    """
    This is a test class used to test the functionality of the database models.
    """
    def get(self):
        t = Test()
        db.session.add(t)

        user = User("Oscars",
                    "Lonnqvist",
                    "oscar@mail.com" + str(len(Test.query.all()))
                    )
        db.session.add(user)

        project = Project(name=str(len(Test.query.all())),
                          project_type="Phrase")
        db.session.add(project)

        user.projects.append(project)

        db.session.commit()
        return {"result": repr(Project.query.all())}


class Reset(Resource):
    """
    Reset defines an endpoint used to reset the database for use during
    development.
    """
    def get(self):
        db.drop_all()
        db.create_all()
        db.session.commit()


rest.add_resource(TestModels, '/')
rest.add_resource(Reset, '/reset')
