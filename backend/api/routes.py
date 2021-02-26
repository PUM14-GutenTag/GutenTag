from api import app, rest, db
from api.models import Test, User
from flask_restful import Resource


class TestModels(Resource):
    def get(self):
        t = Test()
        db.session.add(t)
        db.session.commit()

        user = User("Oscars", "Lonnqvist", "oscar@mail.com" + str(len(Test.query.all())))
        db.session.add(user)
        db.session.commit()

        return {"result": repr(User.query.all())}


class Reset(Resource):
    def get(self):
        db.drop_all()
        db.create_all()
        db.session.commit()


rest.add_resource(TestModels, '/')
rest.add_resource(Reset, '/reset')
