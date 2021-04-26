"""
This file contains general functions for the database handler.
"""
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy.schema import DropConstraint, DropTable, MetaData, Table
from api import db


def try_add(object):
    """
    Try to add the column 'object' to its table in the database and return it.
    """
    try:
        db.session.add(object)
        db.session.commit()
        return object
    except Exception:
        db.session.rollback()
        raise


def try_add_response(object):
    """
    Try to add the column 'object' to its table in the database. Returns its ID
    and a status message.
    """
    try:
        db.session.add(object)
        db.session.commit()
        msg = f"{type(object).__name__} '{object}' created."
    except Exception as e:
        db.session.rollback()
        msg = f"Could not create {type(object).__name__}: {e}"
    finally:
        return {
            "id": object.id,
            "message": msg
        }


def add_flush(object):
    """
    Add the column 'object' to its table in the database without
    ending the current transacion and return it.
    """
    try:
        db.session.add(object)
        db.session.flush()
        return object
    except Exception:
        db.session.rollback()
        raise


def try_add_list(objects):
    """
    Try to add each column in 'objects' to its table in the database and then
    commit. Returns objects.
    """
    try:
        db.session.add_all(objects)
        db.session.commit()
        return objects
    except Exception:
        db.session.rollback()
        raise


def add_list_flush(objects):
    """
    Add each column columnin 'objects' to its table in the database without
    ending the current transacion. Returns objects.
    """
    try:
        db.session.add_all(objects)
        db.session.flush()
        return objects
    except Exception:
        db.session.rollback()
        raise


def try_delete(object):
    """
    Try to delete the column 'object' from its table in the database.
    """
    try:
        db.session.delete(object)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise


def try_delete_response(object):
    """
    Try to delete the column 'object' to its table in the database.
    Returns its ID and a status message.
    """
    try:
        db.session.delete(object)
        db.session.commit()
        msg = f"{type(object).__name__} '{object}' deleted."
        id = object.id
    except Exception as e:
        db.session.rollback()
        msg = f"Could not delete {type(object).__name__}: {e}"
        id = None
    finally:
        return {
            "id": id,
            "message": msg
        }


def commit():
    """
    Commits the latest transaction to the database. Roll back if an error
    occurs.
    """
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise


def check_types(arg_types):
    """
    Check each (arg, type) tuple in the list arg_types to see that every arg is
    an instance of type. Raise a TypeError if any check fails.
    """
    for arg, t in arg_types:
        if not isinstance(arg, t):
            raise TypeError(f"arg '{arg}' is not a '{t}'.")


def reset_db():
    """
    WARNING: Use carefully!
    Remove all tables from the database (including all data) and recreate it
    according to models.py.
    """
    db.session.close()
    drop_all_cascade()
    db.create_all()
    db.session.commit()


def drop_all_cascade():
    """(On a live db) drops all foreign key constraints before dropping all
    tables.
    Workaround for SQLAlchemy not doing DROP ## CASCADE for drop_all()
    (https://github.com/pallets/flask-sqlalchemy/issues/722)
    """
    con = db.engine.connect()
    trans = con.begin()
    inspector = Inspector.from_engine(db.engine)

    # We need to re-create a minimal metadata with only the required things to
    # successfully emit drop constraints and tables commands for postgres
    # (based on the actual schema of the running instance)
    meta = MetaData()
    tables = []
    all_fkeys = []

    for table_name in inspector.get_table_names():
        fkeys = []

        for fkey in inspector.get_foreign_keys(table_name):
            if not fkey["name"]:
                continue

            fkeys.append(db.ForeignKeyConstraint((), (), name=fkey["name"]))

        tables.append(Table(table_name, meta, *fkeys))
        all_fkeys.extend(fkeys)

    for fkey in all_fkeys:
        con.execute(DropConstraint(fkey))

    for table in tables:
        con.execute(DropTable(table))

    trans.commit()
