from app.domain.models import ActionDefinition, UpgradeDefinition

ACTIONS: dict[str, ActionDefinition] = {
    "work": ActionDefinition(
        action_id="work",
        title="Work",
        time_cost=50,
        money_delta=1400,
        health_delta=-4,
        stress_delta=8,
    ),
    "study_dev": ActionDefinition(
        action_id="study_dev",
        title="Study (Dev)",
        time_cost=40,
        money_delta=-200,
        health_delta=-2,
        stress_delta=4,
        skill_delta={"dev": 2},
    ),
    "invest": ActionDefinition(
        action_id="invest",
        title="Invest",
        time_cost=20,
        money_delta=-500,
        health_delta=0,
        stress_delta=3,
    ),
    "rest": ActionDefinition(
        action_id="rest",
        title="Rest",
        time_cost=30,
        money_delta=0,
        health_delta=6,
        stress_delta=-8,
    ),
    "leisure": ActionDefinition(
        action_id="leisure",
        title="Leisure",
        time_cost=25,
        money_delta=-250,
        health_delta=2,
        stress_delta=-10,
    ),
}

UPGRADES: dict[str, UpgradeDefinition] = {
    "start_money_bonus": UpgradeDefinition(
        upgrade_id="start_money_bonus",
        title="Start Money Bonus",
        max_level=5,
        cost_base=8,
    ),
    "study_efficiency": UpgradeDefinition(
        upgrade_id="study_efficiency",
        title="Study Efficiency",
        max_level=5,
        cost_base=10,
    ),
}
