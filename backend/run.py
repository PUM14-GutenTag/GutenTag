from flask.cli import FlaskGroup
from api import app, db
from api.gamification import add_stats_to_new_user
from api.models import User

cli = FlaskGroup(app)


@cli.command("create_db")
def create_db():
    """
    Create database tables.
    """
    db.create_all()
    db.session.flush()
    if (len(User.query.all()) == 0):
        admin = User("Admin", "Admin", "admin@admin.com", "password", True)
        db.session.add(admin)
        db.session.flush()
        add_stats_to_new_user(admin.id)
    db.session.commit()


if __name__ == '__main__':
    cli()
