"""
This file contains all database models and associated methods.
"""
import datetime
from enum import IntEnum
from api import db
from api.database_handler import try_add, try_delete, check_types


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

    @staticmethod
    def create(first_name, last_name, email, isAdmin=False):
        """
        Function creates a user in the database.
        """
        check_types([(first_name, str), (last_name, str), (email, str),
                     (isAdmin, bool)])

        access = AccessLevel.ADMIN if isAdmin else AccessLevel.USER
        user = User(first_name=first_name, last_name=last_name, email=email,
                    access_level=access)

        return try_add(user)


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

    data = db.relationship("ProjectData", back_populates="project",
                           cascade="all, delete", passive_deletes=True)
    users = db.relationship(
        "User", secondary=access_control, back_populates="projects")

    @staticmethod
    def create(project_name, project_type):
        """
        Function creates a project in the database
        """
        check_types([(project_name, str), (project_type, int)])
        project = Project(name=project_name, project_type=project_type)
        return try_add(project)

    def delete(self):
        """
        Function deletes an existing project from the database.
        """
        return try_delete(self)

    def add_text_data(self, text, prelabel=None):
        """
        Function adds text data to an existing project.
        """
        if (self.project_type == ProjectType.IMAGE_CLASSIFICATION):
            raise ValueError("Could not add text data:"
                             "project type is IMAGE_CLASSIFICATION.")

        args = [(text, str)]
        if prelabel is not None:
            args.append((prelabel, str))
        check_types(args)

        project_data = ProjectTextData(project_id=self.id,
                                       text_data=text,
                                       prelabel=prelabel)
        return try_add(project_data)

    def add_image_data(self, image):
        """
        Function adds image data to an existing project. 'image' is a
        dictionary containing a 'file_name', 'file_type' and 'data'.
        """
        if (self.project_type != ProjectType.IMAGE_CLASSIFICATION):
            raise ValueError("Could not add image data:"
                             "project type is not IMAGE_CLASSIFICATION.")

        # FIXME Is data an instance of str?
        check_types([(image["data"], str), (image["file_name"], str),
                     (image["file_type", str])])

        project_data = ProjectImageData(
            project_id=self.id,
            file_name=image["file_name"],
            file_type=image["file_type"],
            image_data=image["data"],
        )
        return try_add(project_data)

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
                                                     ondelete="CASCADE"))
    project = db.relationship("Project", back_populates="data")
    labels = db.relationship("Label", back_populates="data",
                             cascade="all, delete", passive_deletes=True)
    prelabel = db.Column(db.Text)
    type = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.now())
    polymorphic_type = db.Column(db.Text)

    __mapper_args__ = {
        "polymorphic_identity": "base",
        "polymorphic_on": type
    }

    def label_data(self, user_id, label):
        """
        Function adds a label to a data object.
        """
        check_types([(user_id, int), (label, str)])
        label_data = Label(data_id=self.id,
                           user_id=user_id,
                           label=label)
        return try_add(label_data)


class ProjectTextData(ProjectData):
    """
    ProjectData child for text data.
    """
    __tablename__ = "project_text_data"

    id = db.Column(db.Integer,
                   db.ForeignKey("project_data.id", ondelete="CASCADE"),
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

    id = db.Column(db.Integer,
                   db.ForeignKey("project_data.id", ondelete="CASCADE"),
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
    data_id = db.Column(db.Integer, db.ForeignKey('project_data.id',
                                                  ondelete="CASCADE"))
    data = db.relationship("ProjectData", back_populates="labels")
    label = db.Column(db.Text, nullable=False)
    updated = db.Column(db.DateTime, default=datetime.datetime.now())
    created = db.Column(db.DateTime, default=datetime.datetime.now())
    project_type = db.Column(db.Integer)

    __mapper_args__ = {
        "polymorphic_identity": ProjectType.DOCUMENT_CLASSIFICATION,
        "polymorphic_on": project_type
    }

    def delete(self):
        """
        Function removes an existing label from the databse.
        """
        return try_delete(self)


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
