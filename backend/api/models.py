"""
This file contains all database models.
"""
import datetime
from enum import IntEnum
from api import db


class ProjectType(IntEnum):
    """
    Enum for the project types.
    """
    DOCUMENT_CLASSIFICATION = 1
    IMAGE_CLASSIFICATION = 2
    SEQUENCE_TO_SEQUENCE = 3
    SEQUENCE_LABELING = 4

    @classmethod
    def has_value(cls, value):
        """
        Returns true if value is one of the project types.
        """
        return value in cls._value2member_map_


class AccessLevel(IntEnum):
    """
    Available access levels for users. Future-proofed so that intermediate
    levels can be put between USER and ADMIN.
    """
    USER = 0
    ADMIN = 5


# The association table between user and project.
access_control = db.Table("access_control", db.Model.metadata,
                          db.Column('project_id',
                                    db.Integer,
                                    db.ForeignKey('project.id')),
                          db.Column('user_id',
                                    db.Integer,
                                    db.ForeignKey('user.id'))
                          )


class Test(db.Model):
    """
    This is a testing table not intended for the final product.
    """
    __tablename__ = "test"

    id = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        return f"<Test {self.id}>"


class User(db.Model):
    """
    User contains information about the users, has information about which
    projects each users are relatd to.
    """
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.Text, nullable=False)
    last_name = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    access_level = db.Column(db.Integer, nullable=False,
                             default=0)

    projects = db.relationship(
        "Project", secondary=access_control, back_populates="users")

    def __repr__(self):
        return (
            f"<User(first_name={self.first_name}, last_name={self.last_name}, "
            f"email={self.email}, access_level={self.access_level})>"
        )


class Project(db.Model):
    """
    Project contain information about what users are related to this project
    and what type of project it is .
    """
    __tablename__ = "project"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    project_type = db.Column(db.Integer, nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.now())

    users = db.relationship(
        "User", secondary=access_control, back_populates="projects")

    def __repr__(self):
        return f"<Projectname={self.name}, Associated users={self.users}>"


class ProjectData(db.Model):
    """
    ProjectData base that contains information about what project it is related
    to and what data it is.
    """
    __tablename__ = "project_data"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    prelabel = db.Column(db.Text)
    project_type = db.Column(db.Integer, nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.now())
    polymorphic_type = db.Column(db.Text)

    __mapper_args__ = {
        "polymorphic_identity": "base",
        "polymorphic_on": project_type
    }


class ProjectTextData(ProjectData):
    """
    ProjectData child for text data.
    """
    __tablename__ = "project_text_data"

    id = db.Column(db.Integer, db.ForeignKey("project_data.id"),
                   primary_key=True)
    text_data = db.Column(db.Text)

    __mapper_args__ = {
        "polymorphic_identity": "text",
    }


class ProjectImageData(ProjectData):
    """
    ProjectData child for image data. The image is stored stored inside the
    database as a LargeBinary along with its metadata.
    """
    __tablename__ = "project_image_data"

    id = db.Column(db.Integer, db.ForeignKey("project_data.id"),
                   primary_key=True)
    file_name = db.Column(db.Text)
    file_type = db.Column(db.Text)
    image_data = db.Column(db.LargeBinary)

    __mapper_args__ = {
        "polymorphic_identity": "image",
    }


class Label(db.Model):
    """
    Label contains the label for a certain piece of data. The base class is
    suitable for document classification labels.
    """
    __tablename__ = "label"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    data_id = db.Column(db.Integer, db.ForeignKey('project_data.id'))
    label = db.Column(db.Text, nullable=False)
    updated = db.Column(db.DateTime, default=datetime.datetime.now())
    created = db.Column(db.DateTime, default=datetime.datetime.now())
    project_type = db.Column(db.Integer)

    __mapper_args__ = {
        "polymorphic_identity": ProjectType.DOCUMENT_CLASSIFICATION,
        "polymorphic_on": project_type
    }


class SequenceLabel(Label):
    """
    Label child for sequence labeling projects.
    """
    __tablename__ = "sequence_label"

    id = db.Column(db.Integer, db.ForeignKey("label.id"), primary_key=True)
    begin = db.Column(db.Integer)
    end = db.Column(db.Integer)

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.SEQUENCE_LABELING,
    }


class SequenceToSequenceLabel(Label):
    """
    Label child for sequence to sequence projects.
    """
    __tablename__ = "sequence_to_sequence_label"

    id = db.Column(db.Integer, db.ForeignKey("label.id"), primary_key=True)
    from_type = db.Column(db.Text)
    to_type = db.Column(db.Text)

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.SEQUENCE_TO_SEQUENCE,
    }


class ImageClassificationLabel(Label):
    """
    Label child for image classification projects. (x1, y1) and (x2, y2) are
    image coordinates that specify a rectangle on the image.
    """
    __tablename__ = "image_classification_label"

    id = db.Column(db.Integer, db.ForeignKey("label.id"), primary_key=True)
    x1 = db.Column(db.Integer)
    y1 = db.Column(db.Integer)
    x2 = db.Column(db.Integer)
    y2 = db.Column(db.Integer)

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.IMAGE_CLASSIFICATION,
    }
