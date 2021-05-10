import datetime
from api.models import (Achievement,
                        Statistic,
                        Login)
from api.database_handler import try_add, add_flush
from api import db


###################################################
#              ABSTRACT CLASSES
###################################################

class BaseStatistic():
    """
    """
    statistic_name = None

    @classmethod
    def get_occurances(cls, user_id):
        """
        """
        return Statistic.query.filter_by(name=cls.statistic_name,
                                         user_id=user_id
                                         ).one().occurances

    @classmethod
    def instantiate(cls, user_id):
        cls.instantiate_statistic_model(user_id)
        cls.instantiate_achievement_models(user_id)

    @classmethod
    def instantiate_statistic_model(cls, user_id):
        """
        """
        db.session.add(Statistic(name=cls.statistic_name, user_id=user_id))

    @classmethod
    def instantiate_achievement_models(cls, user_id):
        """
        """
        raise NotImplementedError()

    @classmethod
    def update(cls, user_id):
        """
        """
        raise NotImplementedError()


class BooleanStatistic(BaseStatistic):
    """
    """
    achievement_name = None
    achievement_description = None

    @classmethod
    def instantiate_achievement_models(cls, user_id):
        """
        """
        db.session.add(Achievement(
            name=cls.achievement_name,
            description=cls.achievement_description,
            user_id=user_id
        ))


class RankStatistic(BaseStatistic):
    """
    """
    ranks = None

    @classmethod
    def update(cls, user_id):
        """
        """
        cls.update_occurances(user_id)
        occurances = cls.get_occurances(user_id)

        # Check if new achievement attained.
        print("occurances", occurances)
        if occurances in cls.ranks.keys():
            new_achieve = Achievement.query.filter_by(
                user_id=user_id,
                name=cls.ranks[occurances][0],
            ).one()
            if (new_achieve):
                new_achieve.earned = datetime.datetime.now()
            print("new achieve:", new_achieve)
            db.session.flush()

    @classmethod
    def update_occurances(cls, user_id):
        """
        """
        raise NotImplementedError()

    @classmethod
    def get_rank(cls, occurances):
        """
        """
        earned_ranks = {
            k: v for (k, v) in cls.ranks.items() if k <= occurances}
        return max(earned_ranks.items(), key=lambda k: k[0])[1]

    @classmethod
    def instantiate_achievement_models(cls, user_id):
        """
        """
        add_list = []
        for k, v in cls.ranks.items():
            achieve = Achievement(
                name=v[0],
                description=v[1],
                user_id=user_id
            )
            add_list.append(achieve)
        db.session.add_all(add_list)


class IncrementStatistic(RankStatistic):
    @classmethod
    def update_occurances(cls, user_id):
        """
        """
        stat = Statistic.query.filter_by(
            name=cls.statistic_name,
            user_id=user_id
        ).with_for_update().one()

        # DO NOT use += operator. Will result in race conditions.
        stat.occurances = stat.occurances + 1
        db.session.flush()


###################################################
#              CONCRETE CLASSES
###################################################

class LoginStatistic(RankStatistic):
    """
    """
    statistic_name = "Logins"
    ranks = {
        1: ("First time", "Log in for the first time"),
    }

    @classmethod
    def get_occurances(cls, user_id):
        """
        """
        return len(Login.query.filter_by(user_id=user_id).all())

    @classmethod
    def update_occurances(cls, user_id):
        """
        """
        add_flush(Login(user_id=user_id))

# class WeekendLoginStatistic(RankStatistic):
#     """
#     """
#     statistic_name = "Weekend logins"
#     ranks = {
#         1: ("First time", "Log in on a weekend"),
#     }

#     @classmethod
#     def get_occurances(cls, user_id):
#         """
#         """
#         logins = Login.query.filter(
#             Login.user_id==user_id,
#             # Login.time.weekday()
#         ).all()
#         return len()

#     @classmethod
#     def update_occurances(cls, user_id):
#         """
#         """
#         add_flush(Login(user_id=user_id))


class WorkdayLoginStatistic(BaseStatistic):
    """
    """
    statistic_name = "Workday logins"
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
        """
        cls.update_occurances(user_id)
        occurances = cls.get_occurances(user_id)

        # Check if new achievement attained.
        print("occurances", occurances)
        workday_ranks = [calc_workdays_in_days(k) for k in cls.ranks.keys()]
        if occurances in workday_ranks:
            new_achieve = Achievement.query.filter_by(
                user_id=user_id,
                name=cls.ranks[occurances][0],
            ).one()
            if (new_achieve):
                new_achieve.earned = datetime.datetime.now()
            print("new achieve:", new_achieve)
            db.session.flush()

    @classmethod
    def instantiate_achievement_models(cls, user_id):
        """
        """
        add_list = []
        for k, v in cls.ranks.items():
            achieve = Achievement(
                name=v[0],
                description=v[1],
                user_id=user_id
            )
            add_list.append(achieve)
        db.session.add_all(add_list)

    @classmethod
    def update_occurances(cls, user_id):
        stat = Statistic.query.filter_by(
            name=cls.statistic_name,
            user_id=user_id
        ).one()

        logins = Login.query.filter_by(user_id=user_id).all()
        workday_streak = calc_workday_streak([log.time for log in logins])
        stat.occurances = workday_streak


class LabelingStatistic(IncrementStatistic):
    """
    """
    statistic_name = "Labels created"
    ranks = {
        1: ("Labeler - Bronze III", "Create 1 label"),
        5: ("Labeler - Bronze II", "Create 5 label"),
        10: ("Labeler - Bronze I", "Create 10 label"),
        25: ("Labeler - Silver III", "Create 25 label"),
        50: ("Labeler - Silver II", "Create 50 label"),
        75: ("Labeler - Silver I", "Create 75 label"),
        150: ("Labeler - Gold III", "Create 150 label"),
        250: ("Labeler - Gold II", "Create 250 label"),
        500: ("Labeler - Gold I", "Create 500 label"),
        1000: ("Labeler - Platinum III", "Create 1 000 label"),
        2500: ("Labeler - Platinum II", "Create 2 500 label"),
        5000: ("Labeler - Platinum I", "Create 5 000 label"),
        10000: ("Labeler - Master", "Create 10 000 label"),
        100000: ("Labeler - Grandmaster", "Create 100 000 label")
    }


class ProjectStatistic(IncrementStatistic):
    """
    """
    statistic_name = "Projects created"
    ranks = {
        1: ("Creator - Bronze III", "Create 1 projects"),
        5: ("Creator - Bronze II", "Create 5 projects"),
        10: ("Creator - Bronze I", "Create 10 projects"),
        50: ("Creator - Silver III", "Create 25 projects"),
        100: ("Creator - Silver II", "Create 50 projects"),
    }


class ImportStatistic(IncrementStatistic):
    """
    """
    statistic_name = "Imports completed"
    ranks = {
        1: ("Importer", "Import data to a project"),
    }


class ExportStatistic(IncrementStatistic):
    """
    """
    statistic_name = "Exports completed"
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
    LabelingStatistic.instantiate(user_id)
    ProjectStatistic.instantiate(user_id)
    ImportStatistic.instantiate(user_id)
    ExportStatistic.instantiate(user_id)
    LoginStatistic.instantiate(user_id)
    WorkdayLoginStatistic.instantiate(user_id)


def calc_workday_streak(datetime_list):
    """
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
        has_streak = streak_day.weekday() > 4 or streak_in_dates

    return streak


def calc_workdays_in_days(num_days):
    """
    """
    to_date = datetime.date.today()
    from_date = datetime.date.today() - datetime.timedelta(days=num_days)
    daygenerator = (from_date + datetime.timedelta(x + 1)
                    for x in range((to_date - from_date).days))
    return sum(1 for day in daygenerator if day.weekday() < 5)
