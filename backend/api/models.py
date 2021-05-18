"""
This file contains all database models and associated methods.
"""
import datetime
import io
from math import ceil
from enum import IntEnum
from api import db
from api.database_handler import check_types
from sqlalchemy.ext.hybrid import hybrid_property
from . import bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token


LIST_SIDE_LENGTH = 5
LIST_LENGTH = 2 * LIST_SIDE_LENGTH + 1


class ProjectType(IntEnum):
    """
    Enum for the project types.
    """
    DOCUMENT_CLASSIFICATION = 1
    SEQUENCE_LABELING = 2
    SEQUENCE_TO_SEQUENCE = 3
    IMAGE_CLASSIFICATION = 4

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
    _password = db.Column(db.Text, nullable=False)

    projects = db.relationship(
        "Project", secondary=access_control, back_populates="users")
    statistics = db.relationship(
        "Statistic", cascade="all, delete", passive_deletes=True)
    achievements = db.relationship(
        "Achievement", cascade="all, delete", passive_deletes=True)

    def __init__(self, first_name, last_name, email, password, isAdmin=False):
        check_types([(first_name, str), (last_name, str), (email, str),
                     (isAdmin, bool)])

        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.access_level = AccessLevel.ADMIN if isAdmin else AccessLevel.USER
        self.password = password

    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email).first()

    @hybrid_property
    def password(self):
        return self._password

    @password.setter
    def password(self, new_password):
        self._password = bcrypt.generate_password_hash(
            new_password).decode('utf-8')

    def change_password(self, new_password):
        """
        Change password of a user
        """
        try:
            self.password = new_password
            db.session.commit()
        except Exception:
            db.session.rollback
            raise

    def check_password(self, password):
        """
        Compare a password candidate to current password hash
        Return result.
        """
        return bcrypt.check_password_hash(self._password, password)

    def login(self, password):
        """
        Tries to login an user. If successful, returns
        an access token and a refresh token.
        """

        check_types([(password, str)])

        if(self.check_password(password)):
            access_token = create_access_token(identity=self.email)
            refresh_token = create_refresh_token(identity=self.email)
            return (access_token, refresh_token)
        return None

    def is_admin(self):
        """
        Returns True if user is admin, otherwise False.
        """
        return self.access_level >= AccessLevel.ADMIN

    def authorize(self, project_id):
        """
        Function adds an existing user to an existing project.
        """
        check_types([(project_id, int)])
        project = Project.query.get(project_id)
        if self.is_authorized(project_id):
            raise ValueError(f"{self} is already authorized for {project}.")
        try:
            project.users.append(self)
            db.session.commit()
        except Exception:
            db.session.rollback
            raise

    def deauthorize(self, project_id):
        """
        Function removes an existing user from an existing project.
        """
        check_types([(project_id, int)])
        project = Project.query.get(project_id)
        if not self.is_authorized(project_id):
            raise ValueError(f"{self} is not authorized for {project}.")
        try:
            project.users.remove(self)
            db.session.commit()
        except Exception:
            db.session.rollback
            raise

    def is_authorized(self, project_id):
        """
        Check if user is authorized to a project.
        """
        check_types([(project_id, int)])
        project = Project.query.get(project_id)
        if project is None:
            raise ValueError("Project does not exist.")
        return self.access_level == AccessLevel.ADMIN or \
            project in self.projects

    def __repr__(self):
        return (
            f"<User(first_name={self.first_name}, last_name={self.last_name}, "
            f"email={self.email}, access_level={self.access_level}) >"
        )


class DefaultLabel(db.Model):
    """
    DefaultLabels contains multiple lables that are default for a certain
    project.
    """
    __tablename__ = "default_label"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"))
    project = db.relationship("Project", backref="default_labels")
    name = db.Column(db.Text, nullable=False)

    __table_args__ = (db.UniqueConstraint("project_id",
                                          "name",
                                          name="_label_project_uc"),)

    def __init__(self, project, name):
        check_types([(project, Project), (name, str)])
        self.project = project
        self.name = name


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
        if not ProjectType.has_value(project_type):
            raise ValueError(f"Project type '{project_type}' is invalid.")
        self.name = project_name
        self.project_type = project_type

    def get_data(self, user_id):
        """
        Returns a list with length LIST_LENGTH which is always an uneven
        number. The middle value will be the first value in project_data
        that is unlabeled by the user.
        """

        index = 0
        all_labeled = False
        found_labeled = True
        project_data = self.data

        # find earliest none labeled data point
        for data in project_data:
            if not found_labeled:
                break
            found_labeled = False
            for label in data.labels:
                if(user_id == label.user_id):
                    found_labeled = True
                    index += 1
                    break

        # Check if all data points are labeled by user
        if index == len(project_data):
            all_labeled = True
            index -= 1

        # Make a list of objects where each object consists of id and data.
        data_points = []
        for data in self.data:
            data_point = {}
            if self.project_type == ProjectType.IMAGE_CLASSIFICATION:
                data_item = data.file_name
            else:
                data_item = data.text_data
            data_point["id"] = data.id
            data_point["data"] = data_item
            data_points.append(data_point)

        """
        Fill out the list to always return a list of length LIST_LENGTH.
        Checks if index is close to a border and fills out the list
        with {} if that is the case
        """
        if len(data_points) > LIST_LENGTH:

            if index < LIST_SIDE_LENGTH:
                list_of_data = data_points[:index + LIST_SIDE_LENGTH + 1]
                for i in range(LIST_SIDE_LENGTH - index):
                    list_of_data.insert(0, {})

            # -1 to compensate for index, -(LIST_SIDE_LENGTH) because we want
            # LIST_SIDE_LENGTH values ahead

            elif ((len(data_points) - 1) - LIST_SIDE_LENGTH) < index:
                list_of_data = data_points[index - LIST_SIDE_LENGTH:]
                for i in range(index - ((len(data_points) - 1)
                                        - LIST_SIDE_LENGTH)):
                    list_of_data.append({})
            else:
                list_of_data = \
                    data_points[index - LIST_SIDE_LENGTH:index
                                + LIST_SIDE_LENGTH + 1]
        else:
            list_of_data = data_points[:]
            for i in range(LIST_SIDE_LENGTH - index):
                list_of_data.insert(0, {})
            for i in range(index - ((len(data_points) - 1)
                                    - LIST_SIDE_LENGTH)):
                list_of_data.append({})

        return {"list": list_of_data, "index": index,
                "allLabeled": all_labeled}

    def get_next_data(self, index):
        """
        Get data LIST_SIDE_LENGTH index ahead in the list or return
        empty object
        """
        check_types([(index, int)])
        data_points = self.data
        try:
            data = data_points[index + LIST_SIDE_LENGTH]
            data_point = {}
            data_point["id"] = data.id
            data_point["data"] = data.text_data
            next_data = data_point
        except IndexError:
            next_data = {}
        return next_data

    def get_earlier_data(self, index):
        """
        Get data LIST_SIDE_LENGTH index earlier in the list or return
        empty object
        """
        check_types([(index, int)])
        data_points = self.data
        if index - LIST_SIDE_LENGTH >= 0:
            data = data_points[index - LIST_SIDE_LENGTH]
            data_point = {}
            data_point["id"] = data.id
            data_point["data"] = data.text_data
            earlier_data = data_point
        else:
            earlier_data = {}
        return earlier_data


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

    def has_labeled(self, user_id):
        """
        Return True if user has labeled the data before, otherwise False.
        """
        return sum(1 for label in self.labels if label.user_id == user_id) > 0


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

    def get_image_file(self):
        """
        Store the image file in memory and return it.
        """
        file = io.BytesIO()
        file.write(self.image_data)
        file.seek(0)
        return file


class Label(db.Model):
    """
    Label contains the label for a certain piece of data. Base class that
    should not be instantiated. All children to Label must implement
    a format_json-function.
    """
    __tablename__ = "label"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    data_id = db.Column(db.Integer, db.ForeignKey('project_data.id',
                                                  ondelete="CASCADE"))
    data = db.relationship("ProjectData", back_populates="labels")
    label = db.Column(db.Text, nullable=False)
    color = db.Column(db.Text, nullable=False)
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

    def __init__(self, data_id, user_id, label_str, color, is_prelabel=False):
        args = [(data_id, int), (label_str, str), (color, str)]
        if user_id is not None:
            args.append((user_id, int))
        check_types(args)

        self.data_id = data_id
        self.user_id = user_id
        self.label = label_str
        self.is_prelabel = is_prelabel
        self.color = color

    def format_json(self):
        return {
            self.id: {
                "label_id": self.id,
                "data_id": self.data_id,
                "user_id": self.user_id,
                "label": self.label,
                "color": self.color
            }
        }


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

    def __init__(self, data_id, user_id, label_str, begin, end, color,
                 is_prelabel=False):
        """
        Create a sequence label and add it to a ProjectData.
        """
        args = [(data_id, int), (label_str, str),
                (begin, int), (begin, int), (color, str)]
        if user_id is not None:
            args.append((user_id, int))
        check_types(args)

        self.data_id = data_id
        self.user_id = user_id
        self.label = label_str
        self.begin = begin
        self.end = end
        self.color = color
        self.is_prelabel = is_prelabel

    def format_json(self):
        return {
            self.id: {
                "label_id": self.id,
                "data_id": self.data_id,
                "user_id": self.user_id,
                "label": self.label,
                "begin": self.begin,
                "end": self.end,
                "color": self.color
            }
        }


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

    def __init__(self, data_id, user_id, label_str, color, is_prelabel=False):
        args = [(data_id, int), (label_str, str), (color, str)]
        if user_id is not None:
            args.append((user_id, int))
        check_types(args)

        self.data_id = data_id
        self.user_id = user_id
        self.label = label_str
        self.is_prelabel = is_prelabel
        self.color = color

    def format_json(self):
        return {
            self.id: {
                "label_id": self.id,
                "data_id": self.data_id,
                "user_id": self.user_id,
                "label": self.label,
                "color": self.color
            }
        }


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

    def __init__(self, data_id, user_id, label_str, coord1, coord2, color,
                 is_prelabel=False):
        args = [(data_id, int), (label_str, str),
                (coord1, tuple), (coord2, tuple), (color, str)]
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
        self.is_prelabel = is_prelabel
        self.color = color

    def format_json(self):
        return {
            self.id: {
                "label_id": self.id,
                "data_id": self.data_id,
                "color": self.color,
                "user_id": self.user_id,
                "label": self.label,
                "coordinates": {
                    "x1": self.x1,
                    "x2": self.x2,
                    "y1": self.y1,
                    "y2": self.y2
                }
            }
        }


class Login(db.Model):
    """
    Keeps track of the datetime of all user logins.
    """
    __tablename__ = "login"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id', ondelete="CASCADE"))
    time = db.Column(db.DateTime, nullable=False,
                     default=datetime.datetime.now())


class Statistic(db.Model):
    """
    Keeps track of statisics of each user which can be displayed on their page
    or used to track achievement progress.
    """
    __tablename__ = "statistic"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id', ondelete="CASCADE"))
    occurrences = db.Column(db.Integer, default=0, nullable=False)

    def format_json(self):
        return {
            "name": self.name,
            "occurrences": self.occurrences,
            "ranking": self.user_ranking()
        }

    def user_ranking(self):
        """
        Returns the user's statistic ranking compared to all other users.
        That is, how the user's occurrences compare to other users.
        """
        stats = self.query.filter_by(name=self.name).all()
        # Get all stats that have more occurrances
        more_occurrences = [
            stat.occurrences for stat in stats
            if stat.occurrences > self.occurrences
        ]
        # Remove duplicates
        unique_more_occurrences = list(dict.fromkeys(more_occurrences))

        ranking = len(unique_more_occurrences) + 1
        if ranking == 1:
            return "Top 1"
        else:
            # Ceil ranking to nearest 5.
            return f"Top {5 * ceil(ranking/5)}"

    def __repr__(self):
        return (
            f"<Statistic(id={self.id}, name={self.name}, "
            f"occurrences={self.occurrences}, user_id={self.user_id})>"
        )


class Achievement(db.Model):
    """
    Contains the achievements earned by all users.
    """
    __tablename__ = "achievement"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id', ondelete="CASCADE"))
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    earned = db.Column(db.DateTime)
    has_notified = db.Column(db.Boolean, nullable=False, default=False)

    def format_json(self):
        if self.earned is None:
            earned = None
        else:
            earned = self.earned.strftime("%d %B %Y")
        return {
            "name": self.name,
            "description": self.description,
            "earned": earned
        }

    @staticmethod
    def get_unnotified(user_id):
        achieve_list = Achievement.query.filter(
            Achievement.user_id == user_id,
            Achievement.earned.isnot(None),
            Achievement.has_notified.is_(False)
        ).all()
        for achieve in achieve_list:
            achieve.has_notified = True
        db.session.commit()

        return [achieve.format_json() for achieve in achieve_list]

    def __repr__(self):
        return (
            f"<Achievement(id={self.id}, name={self.name}, "
            f"description={self.description}, earned={self.earned}, "
            f"has_notified={self.has_notified}, user_id={self.user_id})>"
        )
