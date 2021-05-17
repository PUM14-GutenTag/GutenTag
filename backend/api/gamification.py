import datetime
from sqlalchemy.sql import extract
from sqlalchemy import or_
from api.models import (Achievement,
                        Statistic,
                        Login,
                        User)
from api import db


###################################################
#              ABSTRACT CLASSES
###################################################

class BaseStatistic():
    """
    Abstract class that keeps track of a single statistic and its achievements.
    This involves instantiating db models, and updating occurrences.
    """
    statistic_name = None
    requires_admin = False

    @classmethod
    def get_occurrences(cls, user_id):
        """
        Return the number of occurrences for this statistic.
        """
        return Statistic.query.filter_by(name=cls.statistic_name,
                                         user_id=user_id
                                         ).one().occurrences

    @classmethod
    def instantiate(cls, user_id):
        """
        Create database models for a new user.
        """
        user = User.query.get(user_id)
        if cls.requires_admin and not user.is_admin():
            return

        cls.instantiate_statistic_model(user_id)
        cls.instantiate_achievement_models(user_id)

    @classmethod
    def instantiate_statistic_model(cls, user_id):
        """
        Create a database model to track the user's progress on the statistic.
        """
        db.session.add(Statistic(name=cls.statistic_name, user_id=user_id))

    @classmethod
    def instantiate_achievement_models(cls, user_id):
        """
        Create a database model to track the user's progress on the statistic's
        achievements.
        """
        raise NotImplementedError()

    @classmethod
    def update(cls, user_id):
        """
        Update the number of occurrences.
        """
        raise NotImplementedError()


class BooleanStatistic(BaseStatistic):
    """
    Subclass of BaseStatistic used to track boolean statistics, that is, stats
    that cannot occur more than once.
    """
    achievement_name = None
    achievement_description = None

    @classmethod
    def get_occurrences(cls, user_id):
        """
        Return the number of occurrences for this statistic.
        """
        stat = Statistic.query.filter_by(name=cls.statistic_name,
                                         user_id=user_id
                                         ).one()
        return stat.occurrences > 0

    @classmethod
    def instantiate_achievement_models(cls, user_id):
        """
        Create a database model to track the user's progress on the statistic's
        achievements.
        """
        db.session.add(Achievement(
            name=cls.achievement_name,
            description=cls.achievement_description,
            user_id=user_id
        ))

    @classmethod
    def update(cls, user_id):
        """
        Update the number of occurrences.
        """
        stat = Statistic.query.filter_by(name=cls.statistic_name,
                                         user_id=user_id
                                         ).one()
        if (stat.occurrences < 1):
            stat.occurrences = 1

            new_achieve = Achievement.query.filter_by(
                user_id=user_id,
                name=cls.achievement_name,
            ).one()
            new_achieve.earned = datetime.datetime.now()

            db.session.flush()


class RankStatistic(BaseStatistic):
    """
    Subclass of BaseStatistic used to track achievements with multiple tiers.
    """
    ranks = None

    @classmethod
    def update(cls, user_id):
        """
        Update the number of occurrences.
        """
        cls.update_occurrences(user_id)
        occurrences = cls.get_occurrences(user_id)

        # Check if new achievement attained.
        if occurrences in cls.ranks.keys():
            new_achieve = Achievement.query.filter_by(
                user_id=user_id,
                name=cls.ranks[occurrences][0],
            ).one()
            if (new_achieve):
                new_achieve.earned = datetime.datetime.now()
            db.session.flush()

    @classmethod
    def update_occurrences(cls, user_id):
        """
        Update the number of occurrences.
        """
        raise NotImplementedError()

    @classmethod
    def get_rank(cls, occurrences):
        """
        Get the name of the highest achieved rank.
        """
        earned_ranks = {
            k: v for (k, v) in cls.ranks.items() if k <= occurrences}
        return max(earned_ranks.items(), key=lambda k: k[0])[1]

    @classmethod
    def instantiate_achievement_models(cls, user_id):
        """
        Create a database model to track the user's progress on the statistic's
        achievements.
        """
        add_list = []
        for v in cls.ranks.values():
            achieve = Achievement(
                name=v[0],
                description=v[1],
                user_id=user_id
            )
            add_list.append(achieve)
        db.session.add_all(add_list)


class IncrementStatistic(RankStatistic):
    """
    Subclass of RankStatistic where the number of occurrences simply increment
    on a certain action.
    """
    @classmethod
    def update_occurrences(cls, user_id):
        """
        Update the number of occurrences.
        """
        stat = Statistic.query.filter_by(
            name=cls.statistic_name,
            user_id=user_id
        ).with_for_update().one()

        # DO NOT use += operator. Will result in race conditions.
        stat.occurrences = stat.occurrences + 1
        db.session.flush()


###################################################
#              CONCRETE CLASSES
###################################################

class LoginStatistic(IncrementStatistic):
    """
    Keeps track of number of logins.
    """
    statistic_name = "Logins"
    ranks = {
        1: ("First time", "Log in for the first time"),
    }

    @classmethod
    def get_occurrences(cls, user_id):
        """
        Return the number of occurrences for this statistic.
        """
        return len(Login.query.filter_by(user_id=user_id).all())


class WeekendLoginStatistic(RankStatistic):
    """
    Keeps track of number of logins on weekends.
    """
    statistic_name = "Weekend logins"
    ranks = {
        1: ("Working weekends?", "Log in on a weekend"),
    }

    @classmethod
    def update_occurrences(cls, user_id):
        """
        Update the number of occurrences.
        """

    @classmethod
    def get_occurrences(cls, user_id):
        """
        Return the number of occurrences for this statistic.
        """
        logins = Login.query.filter(
            Login.user_id == user_id,
            # dow: day of week. Sunday is 0, saturday is 6.
            or_(extract('dow', Login.time) == 0,
                extract('dow', Login.time) == 6)
        ).all()
        return len(logins)


class WorkdayLoginStatistic(BaseStatistic):
    """
    Keeps track of the number of consecutive weekdays the user has logged in
    for.
    """
    statistic_name = "Workday login streak"
    ranks = {
        2: ("I'm back", "Log in two workdays in a row"),
        7: ("Workday champion", "Log in every workday for a week"),
        14: ("All I do is work", "Log in every workday for two weeks"),
        21: ("Work! Work! Work!", "Log in every workday for three weeks"),
        30: ("Employee of the month", "Log in every workday for a month")
    }

    @classmethod
    def update(cls, user_id):
        """
        Update the number of occurrences.
        """
        cls.update_occurrences(user_id)
        occurrences = cls.get_occurrences(user_id)

        # Check if new achievement attained.
        workday_ranks = [(k, calc_workdays_in_days(k))
                         for k in cls.ranks.keys()]
        print("workday_ranks", workday_ranks)
        for days, workdays in workday_ranks:
            if occurrences == workdays:
                new_achieve = Achievement.query.filter_by(
                    user_id=user_id,
                    name=cls.ranks[days][0],
                ).one()
                if (new_achieve):
                    new_achieve.earned = datetime.datetime.now()
                db.session.flush()
                break

    @classmethod
    def instantiate_achievement_models(cls, user_id):
        """
        Create a database model to track the user's progress on the statistic's
        achievements.
        """
        add_list = []
        for v in cls.ranks.values():
            achieve = Achievement(
                name=v[0],
                description=v[1],
                user_id=user_id
            )
            add_list.append(achieve)
        db.session.add_all(add_list)

    @classmethod
    def update_occurrences(cls, user_id):
        """
        Update the number of occurrences.
        """
        stat = Statistic.query.filter_by(
            name=cls.statistic_name,
            user_id=user_id
        ).one()

        logins = Login.query.filter_by(user_id=user_id).all()
        workday_streak = calc_workday_streak([log.time for log in logins])
        stat.occurrences = workday_streak


class LabelingStatistic(IncrementStatistic):
    """
    Keeps track of the number of labels that user has created.
    """
    statistic_name = "Data labeled"
    ranks = {
        1: ("Labeler - Bronze III", "Label your first data point"),
        5: ("Labeler - Bronze II", "Label 5 data"),
        10: ("Labeler - Bronze I", "Label 10 data"),
        25: ("Labeler - Silver III", "Label 25 data"),
        50: ("Labeler - Silver II", "Label 50 data"),
        75: ("Labeler - Silver I", "Label 75 data"),
        150: ("Labeler - Gold III", "Label 150 data"),
        250: ("Labeler - Gold II", "Label 250 data"),
        500: ("Labeler - Gold I", "Label 500 data"),
        1000: ("Labeler - Platinum III", "Label 1 000 data"),
        2500: ("Labeler - Platinum II", "Label 2 500 data"),
        5000: ("Labeler - Platinum I", "Label 5 000 data"),
        10000: ("Labeler - Master", "Label 10 000 data"),
        100000: ("Labeler - Grandmaster", "Label 100 000 data")
    }


class ProjectStatistic(IncrementStatistic):
    """
    Keeps track of the number of projects the user has created.
    """
    statistic_name = "Projects created"
    requires_admin = True
    ranks = {
        1: ("Creator - Bronze III", "Create your first project"),
        5: ("Creator - Bronze II", "Create 5 projects"),
        10: ("Creator - Bronze I", "Create 10 projects"),
        50: ("Creator - Silver III", "Create 25 projects"),
        100: ("Creator - Silver II", "Create 50 projects"),
    }


class ImportStatistic(IncrementStatistic):
    """
    Keeps track of the number of data imports the user has done.
    """
    statistic_name = "Imports completed"
    requires_admin = True
    ranks = {
        1: ("Importer", "Import data to a project"),
    }


class ExportStatistic(IncrementStatistic):
    """
    Keeps track of the number of data exports the user has done.
    """
    statistic_name = "Exports completed"
    requires_admin = True
    ranks = {
        1: ("Exporter", "Export data from a project"),
    }


# TODO: Don't currently have a way of measuring individual progress in project.
#
# class CompletedProjectStatistic(IncrementStatistic):
#     """
#     """
#     statistic_name = "Completed projects"
#     ranks = {
#         1: ("Screw it let's do it", "Reach 100% completion in one project"),
#         2: ("Another one", "Reach 100% completion in two projects")
#     }


###################################################
#              HELPER FUNCTIONS
###################################################

def add_stats_to_new_user(user_id):
    """
    Instantiate all statistic and achievement models for a new user.
    """
    LabelingStatistic.instantiate(user_id)
    ProjectStatistic.instantiate(user_id)
    ImportStatistic.instantiate(user_id)
    ExportStatistic.instantiate(user_id)
    LoginStatistic.instantiate(user_id)
    WorkdayLoginStatistic.instantiate(user_id)
    WeekendLoginStatistic.instantiate(user_id)


def calc_workday_streak(datetime_list):
    """
    Returns the number of consecutive workday in datetime_list.
    """
    date_list = [dt.date() for dt in datetime_list]
    unique_dates = list(dict.fromkeys(date_list))
    unique_dates.sort(reverse=True)

    streak = 1
    streak_day = datetime.date.today()
    has_streak = True
    while has_streak:
        streak_day -= datetime.timedelta(days=1)
        streak_in_dates = streak_day in unique_dates
        if streak_in_dates:
            streak += 1
        # weekday() returns 0 for monday and 6 for sunday.
        has_streak = streak_day.weekday() > 4 or streak_in_dates

    return streak


def calc_workdays_in_days(num_days):
    """
    Returns how many of the previous num_days are workdays.
    """
    to_date = datetime.date.today()
    from_date = datetime.date.today() - datetime.timedelta(days=num_days)
    daygenerator = (from_date + datetime.timedelta(x + 1)
                    for x in range((to_date - from_date).days))
    return sum(1 for day in daygenerator if day.weekday() < 5)
