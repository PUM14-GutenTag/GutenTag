from api.models import Achievement, Statistic, Login
from api.database_handler import try_add, add_flush
from api import db


class BaseStatistic():
    """
    """
    statistic_name = None

    @classmethod
    def increment(cls, user_id):
        """
        """
        stat = Statistic.query.filter_by(name=cls.statistic_name,
                                         user_id=user_id).one_or_none()
        if (stat is None):
            stat = Statistic(name=cls.statistic_name, user_id=user_id)
            add_flush(stat)

        stat.occurances += 1

    @classmethod
    def get_occurances(cls, user_id):
        """
        """
        return Statistic.query.filter_by(name=cls.statistic_name,
                                         user_id=user_id
                                         ).occurances


class RankStatistic(BaseStatistic):
    """
    """
    achievement_prefix = None
    ranks = None

    @classmethod
    def increment(cls, user_id):
        """
        """
        super(user_id)
        stat = Statistic.query.filter_by(name=cls.statistic_name,
                                         user_id=user_id).one()

        # Check if new achievement attained.
        if stat.occurances in cls.ranks.keys():
            achieve = Achievement(user_id=user_id,
                                  name=cls.get_achievement_name(
                                      stat.occurances)
                                  )
            add_flush(achieve)

    @classmethod
    def get_rank(cls, occurances):
        """
        """
        earned_ranks = {
            k: v for (k, v) in cls.ranks.items() if k <= occurances}
        return max(earned_ranks.items(), key=lambda k: k[0])[1]

    @classmethod
    def get_achievement_name(cls, occurances):
        """
        """
        return f"{cls.achievement_prefix} - {cls.get_rank(occurances)}"


class LabelingStatistic(RankStatistic):
    statistic_name = "Labels created"
    achievement_prefix = "Labeler"
    ranks = {
        1: "Bronze III",
        5: "Bronze II",
        10: "Bronze I",
        25: "Silver III",
        50: "Silver II",
        75: "Silver I",
        150: "Gold III",
        250: "Gold II",
        500: "Gold I",
        1000: "Platinum III",
        2500: "Platinum II",
        5000: "Platinum I",
        10000: "Master",
        100000: "Grandmaster"
    }


class LoginStatistic(BaseStatistic):
    """
    """
    statistic_name = "Logins"

    @classmethod
    def increment(cls, user_id):
        """
        """
        super(user_id)

        logins = Login.query.filter_by(user_id=user_id).all()

        # Check if new achievement attained, starting with the hardest to
        # achieve.
        # TODO