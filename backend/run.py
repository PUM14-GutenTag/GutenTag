from flask.cli import FlaskGroup
from api import app, db

cli = FlaskGroup(app)


@cli.command("create_db")
def create_db():
    """
    Create database tables.
    """
    db.create_all()
    db.session.commit()


if __name__ == '__main__':
    cli()
