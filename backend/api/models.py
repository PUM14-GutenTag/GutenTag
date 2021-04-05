"""
This file contains all database models and associated methods.
"""
import datetime
from enum import IntEnum
from api import db
from api.database_handler import check_types


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
                             default=AccessLevel.USER)

    projects = db.relationship(
        "Project", secondary=access_control, back_populates="users")

    def __init__(self, first_name, last_name, email, isAdmin=False):
        check_types([(first_name, str), (last_name, str), (email, str),
                     (isAdmin, bool)])

        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.access_level = AccessLevel.ADMIN if isAdmin else AccessLevel.USER

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
    created = db.Column(db.DateTime, nullable=False,
                        default=datetime.datetime.now())

    data = db.relationship("ProjectData", back_populates="project",
                           cascade="all, delete", passive_deletes=True)
    users = db.relationship(
        "User", secondary=access_control, back_populates="projects")

    def __init__(self, project_name, project_type):
        check_types([(project_name, str), (project_type, int)])

        self.name = project_name
        self.project_type = project_type

    def authorize_user(self, user_id):
        """
        Function adds an existing user to an existing project.
        """
        check_types([(user_id, int)])
        try:
            user = User.query.get(user_id)
            if user is None:
                raise ValueError("User does not exist.")
            elif user in self.users or user.access_level == AccessLevel.ADMIN:
                raise ValueError(f"{user} is already authorized for {self}.")

            self.users.append(user)
            db.session.commit()
        except Exception:
            db.session.rollback
            raise

    def deauthorize_user(self, user_id):
        """
        Function removes an existing user from an existing project.
        """
        check_types([(user_id, int)])
        try:
            user = User.query.get(user_id)

            if user is None:
                raise ValueError("User does not exist.")
            elif (user not in self.users
                    and user.access_level != AccessLevel.ADMIN):
                raise ValueError(f"{user} is not authorized for {self}.")

            self.users.remove(user)
            db.session.commit()
        except Exception:
            db.session.rollback
            raise


class ProjectData(db.Model):
    """
    ProjectData base that contains information about what project it is related
    to and what data it is.
    """
    __tablename__ = "project_data"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id',
                                                     ondelete="CASCADE"),
                           nullable=False)
    project = db.relationship("Project", back_populates="data")
    labels = db.relationship("Label", back_populates="data",
                             cascade="all, delete", passive_deletes=True)
    type = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime, nullable=False,
                        default=datetime.datetime.now())
    polymorphic_type = db.Column(db.Text)

    __mapper_args__ = {
        "polymorphic_identity": "base",
        "polymorphic_on": type
    }


class ProjectTextData(ProjectData):
    """
    ProjectData child for text data.
    """
    __tablename__ = "project_text_data"

    id = db.Column(db.Integer,
                   db.ForeignKey("project_data.id", ondelete="CASCADE"),
                   primary_key=True)
    text_data = db.Column(db.Text, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "text",
    }

    def __init__(self, project_id, text):
        self.project_id = project_id
        self.text_data = text.strip()


class ProjectImageData(ProjectData):
    """
    ProjectData child for image data. The image is stored stored inside the
    database as a LargeBinary along with its metadata.
    """
    __tablename__ = "project_image_data"

    id = db.Column(db.Integer,
                   db.ForeignKey("project_data.id", ondelete="CASCADE"),
                   primary_key=True)
    file_name = db.Column(db.Text, nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "image",
    }

    def __init__(self, project_id, file_name, image_data):
        self.project_id = project_id
        self.file_name = file_name
        self.image_data = image_data


class Label(db.Model):
    """
    Label contains the label for a certain piece of data. Base class that
    should not be instantiated.
    """
    __tablename__ = "label"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    data_id = db.Column(db.Integer, db.ForeignKey('project_data.id',
                                                  ondelete="CASCADE"))
    data = db.relationship("ProjectData", back_populates="labels")
    label = db.Column(db.Text, nullable=False)
    is_prelabel = db.Column(db.Boolean)
    updated = db.Column(db.DateTime, nullable=False,
                        default=datetime.datetime.now())
    created = db.Column(db.DateTime, nullable=False,
                        default=datetime.datetime.now())
    project_type = db.Column(db.Integer)

    __mapper_args__ = {
        "polymorphic_identity": 0,
        "polymorphic_on": project_type
    }


class DocumentClassificationLabel(Label):
    """
    Label child for document classification projects.
    """
    __tablename__ = "document_classification_label"

    id = db.Column(db.Integer, db.ForeignKey("label.id", ondelete="CASCADE"),
                   primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.DOCUMENT_CLASSIFICATION,
    }

    def __init__(self, data_id, user_id, label_str):
        args = [(data_id, int), (label_str, str)]
        if user_id is not None:
            args.append((user_id, int))
        check_types(args)

        self.data_id = data_id
        self.user_id = user_id
        self.label = label_str


class SequenceLabel(Label):
    """
    Label child for sequence labeling projects.
    """
    __tablename__ = "sequence_label"

    id = db.Column(db.Integer, db.ForeignKey("label.id", ondelete="CASCADE"),
                   primary_key=True)
    begin = db.Column(db.Integer, nullable=False)
    end = db.Column(db.Integer, nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.SEQUENCE_LABELING,
    }

    def __init__(self, data_id, user_id, label_str, begin, end):
        """
        Create a sequence label and add it to a ProjectData.
        """
        args = [(data_id, int), (label_str, str),
                (begin, int), (begin, int)]
        if user_id is not None:
            args.append((user_id, int))
        check_types(args)
        self.data_id = data_id
        self.user_id = user_id
        self.label = label_str
        self.begin = begin
        self.end = end


class SequenceToSequenceLabel(Label):
    """
    Label child for sequence to sequence projects.
    """
    __tablename__ = "sequence_to_sequence_label"

    id = db.Column(db.Integer, db.ForeignKey("label.id", ondelete="CASCADE"),
                   primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.SEQUENCE_TO_SEQUENCE,
    }

    def __init__(self, data_id, user_id, label_str):
        args = [(data_id, int), (label_str, str)]
        if user_id is not None:
            args.append((user_id, int))
        check_types(args)
        self.data_id = data_id
        self.user_id = user_id
        self.label = label_str


class ImageClassificationLabel(Label):
    """
    Label child for image classification projects. (x1, y1) and (x2, y2) are
    image coordinates that specify a rectangle on the image.
    """
    __tablename__ = "image_classification_label"

    id = db.Column(db.Integer, db.ForeignKey("label.id", ondelete="CASCADE"),
                   primary_key=True)
    x1 = db.Column(db.Integer)
    y1 = db.Column(db.Integer)
    x2 = db.Column(db.Integer)
    y2 = db.Column(db.Integer)

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.IMAGE_CLASSIFICATION,
    }

    def __init__(self, data_id, user_id, label_str, coord1, coord2):
        args = [(data_id, int), (label_str, str),
                (coord1, tuple), (coord2, tuple)]
        if user_id is not None:
            args.append((user_id, int))
        check_types(args)
        self.data_id = data_id
        self.user_id = user_id
        self.label = label_str
        self.x1 = coord1[0]
        self.y1 = coord1[1]
        self.x2 = coord2[0]
        self.y2 = coord2[1]
