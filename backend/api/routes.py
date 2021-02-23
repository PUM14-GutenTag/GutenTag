from api import app, rest, db
from api.models import Test, User
from flask_restful import Resource


class HelloWorld(Resource):
    def get(self):
        t = Test()
        db.session.add(t)
        db.session.commit()

        return {"result": len(Test.query.all())}


rest.add_resource(HelloWorld, '/')
