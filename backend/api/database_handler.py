"""
This file contains general functions for the database handler.
"""
from api import db


def try_add(object):
    """
    Try to add the column 'object' to its table in the database. Returns its ID
    and a status message.
    """
    try:
        db.session.add(object)
        db.session.commit()
        return object
    except Exception:
        db.session.rollback()
        raise


def try_delete(object):
    """
    Try to delete the column 'object' from its table in the database.
    Returns its ID and a status message.
    """
    try:
        db.session.delete(object)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise


def check_types(arg_types):
    for arg, t in arg_types:
        if not isinstance(arg, t):
            raise TypeError(f"arg '{arg}' is not a '{t}'.")


def reset_db():
    """
    WARNING: use carefully!
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
    from sqlalchemy.engine.reflection import Inspector
    from sqlalchemy.schema import DropConstraint, DropTable, MetaData, Table

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
