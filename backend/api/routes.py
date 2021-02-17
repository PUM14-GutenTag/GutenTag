from api import app, db
from api.models import Test


@app.route("/", methods=["GET"])
def hello_world():
    t = Test()
    db.session.add(t)
    db.session.commit()
    return str(len(Test.query.all()))
