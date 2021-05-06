import datetime
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

    @classmethod
    def get_achievement_description(cls, occurances):
        raise NotImplementedError()


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
                                      stat.occurances),
                                  description=cls.get_achievement_description(
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

    @classmethod
    def get_achievement_description(cls, occurances):
        return f"Create {occurances} labels"


class LoginStatistic(BaseStatistic):
    """
    """
    statistic_name = "Logins"

    @classmethod
    def increment(cls, user_id):
        """
        """
        super(user_id)

        # Check if new achievement attained
        logins = Login.query.filter_by(user_id=user_id).all()

        workday_streak = calc_workday_streak([log.time for log in logins])
        new_achieves = []

        if workday_streak >= calc_workdays_in_days(30):
            achieve_name = "Employee of the month"
            achieve_desc = "Log in every business day for a month"
            new_achieves.append((achieve_name, achieve_desc))
        elif workday_streak >= calc_workdays_in_days(21):
            achieve_name = "Work! Work! Work!"
            achieve_desc = "Log in every business day for three weeks"
            new_achieves.append((achieve_name, achieve_desc))
        elif workday_streak >= calc_workdays_in_days(14):
            achieve_name = "All I do is work"
            achieve_desc = "Log in every business day for two weeks"
            new_achieves.append((achieve_name, achieve_desc))
        elif workday_streak >= calc_workdays_in_days(7):
            achieve_name = "Business day champion"
            achieve_desc = "Log in every business day for a week"
            new_achieves.append((achieve_name, achieve_desc))
        elif workday_streak >= calc_workdays_in_days(2):
            achieve_name = "I'm back"
            achieve_desc = "Log in two business days in a row"
            new_achieves.append((achieve_name, achieve_desc))

        if (datetime.date.today().weekday > 4):
            achieve_name = "Leisure time"
            achieve_desc = "Log in on a weekend"
            new_achieves.append((achieve_name, achieve_desc))

        if len(logins) == 1:
            achieve_name = "First timer"
            achieve_desc = "Log in for the first time"
            new_achieves.append((achieve_name, achieve_desc))

        if new_achieves:
            achieve_list = Achievement.query.filter_by(user_id=user_id,
                                                       earned=True).all()
            earned_names = {achieve.name for achieve in achieve_list}
            for new in new_achieves:
                if new[0] not in earned_names:
                    achieve = Achievement(
                        user_id=user_id, name=new[0], description=new[1])
                    try_add(achieve)

        db.session.commit()


def calc_workday_streak(datetime_list):
    """
    """
    date_list = [dt.date() for dt in datetime_list]
    unique_dates = list({date_list}).sort(reverse=True)
    # unique_dates.discard(datetime.date.today())

    streak = 0
    streak_day = datetime.date.today()
    has_streak = True
    while has_streak:
        streak_day -= - datetime.timedelta(days=1)
        streak_in_dates = streak_day in unique_dates
        if streak_in_dates:
            streak += 1
        has_streak = streak_day.weekday > 4 or streak_in_dates

    return streak


def calc_workdays_in_days(num_days):
    """
    """
    from_date = datetime.date.today()
    to_date = datetime.timedelta(days=num_days)
    daygenerator = (from_date + datetime.timedelta(x + 1)
                    for x in range((to_date - from_date).days))
    return sum(1 for day in daygenerator if day.weekday() < 5)
