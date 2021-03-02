
""" This test file contains all the tests that will be
executed everytime someone makes a pull request or
pushes to the main branch.
"""
from api.database_handler import create_user, reset_db
from api import db
from api.models import User


def function(x):
    y = 6
    return x + y


""" Example test: function(1) == 7 is correct so this
 test_function will pass.
"""


def test_function():
    assert function(1) == 7, "Test failed"


""" Add unit tests here
Name it test_*function name*.py or pytest won't find it.
"""


def test_create_user():
    reset_db()
    # Test correctly creating an admin user.
    ret = create_user("Oscar", "Lonnqvist", "oscar@gmail.com", True)
    assert User.query.get(ret["id"]) is not None

    # Test correctly creating an admin user.
    ret = create_user("first", "last", "user@gmail.com", False)
    assert User.query.get(ret["id"]) is not None

    # Test duplicate email
    ret = create_user("Oscar", "Lonnqvist", "oscar@gmail.com", True)
    assert User.query.get(ret["id"]) is None

    # Test incorrect first name type
    ret = create_user(["Oscar"], "Lonnqvist", "name@gmail.com", True)
    assert User.query.get(ret["id"]) is not None


def test_create_project():
    reset_db()
    ret = create_project("Project")


def test_add_data():
    reset_db()
    pass


def test_delete_project():
    reset_db()
    pass


def test_authorize_user():
    reset_db()
    pass


def test_deauthorize_user():
    reset_db()
    pass


def test_label_data():
    reset_db()
    pass
