from __future__ import annotations

import math
import random

from app.domain.actions import ACTIONS
from app.domain.models import ActionDefinition, MetaState, MonthResolution, RunState, TurnResult

BASE_LIVING_COST = 600
BASE_TIME_BUDGET = 160


def age_label(month_index: int) -> str:
    years = 30 + month_index // 12
    months = month_index % 12
    return f"{years}y {months}m"


def create_new_run(run_id: str, meta: MetaState) -> RunState:
    money_bonus = meta.upgrades.get("start_money_bonus", 0) * 500
    run = RunState(run_id=run_id, money=3000 + money_bonus)
    run.log.append(f"Run started at age {age_label(run.month_index)}.")
    return run


def list_actions() -> list[ActionDefinition]:
    return list(ACTIONS.values())


def _apply_limits(run: RunState) -> None:
    run.health = max(0, min(100, run.health))
    run.stress = max(0, min(100, run.stress))
    run.time_left = max(0, run.time_left)


def apply_action(run: RunState, meta: MetaState, action_id: str) -> TurnResult:
    if run.finished:
        return TurnResult(run=run, message="Run already finished.")

    action = ACTIONS.get(action_id)
    if action is None:
        return TurnResult(run=run, message="Unknown action.")

    if run.time_left < action.time_cost:
        return TurnResult(run=run, message="Not enough time left this month.")

    run.time_left -= action.time_cost
    run.money += action.money_delta
    run.health += action.health_delta
    run.stress += action.stress_delta

    study_bonus = meta.upgrades.get("study_efficiency", 0)
    for skill_name, delta in action.skill_delta.items():
        adjusted_delta = delta
        if action_id.startswith("study"):
            adjusted_delta = math.floor(delta * (1 + 0.1 * study_bonus))
        run.skills[skill_name] = run.skills.get(skill_name, 0) + adjusted_delta

    if action_id == "work" and run.skills.get("dev", 0) >= 20:
        run.career_level = max(run.career_level, 1)
    if action_id == "invest":
        run.investments += 500

    _apply_limits(run)
    _finish_if_needed(run)
    run.log.append(f"Action {action.title} executed.")
    return TurnResult(run=run, message=f"{action.title} applied.")


def resolve_month(run: RunState) -> MonthResolution:
    if run.finished:
        return MonthResolution(run=run, events=["Run already finished."])

    events: list[str] = []

    # Natural decay and pressure.
    run.stress += 3
    run.health -= max(0, (run.stress - 60) // 10)

    # Investment return with light randomness.
    if run.investments > 0:
        ratio = random.randint(-12, 18) / 100
        delta = math.floor(run.investments * ratio)
        run.money += delta
        events.append(f"Investment result: {delta:+}.")

    # Fixed monthly cost.
    run.money -= BASE_LIVING_COST
    events.append(f"Living cost paid: -{BASE_LIVING_COST}.")

    # Reset next month.
    run.month_index += 1
    run.time_left = BASE_TIME_BUDGET

    _apply_limits(run)
    _finish_if_needed(run)

    if run.finished:
        events.append(f"Run finished: {run.finish_reason}.")
    else:
        events.append(f"Now at age {age_label(run.month_index)}.")

    run.log.extend(events)
    return MonthResolution(run=run, events=events)


def _finish_if_needed(run: RunState) -> None:
    if run.finished:
        return

    if run.health <= 0:
        run.finished = True
        run.finish_reason = "health_depleted"
        return
    if run.money < -2000:
        run.finished = True
        run.finish_reason = "bankrupt"
        return
    if run.month_index >= 60:
        run.finished = True
        run.finish_reason = "lifespan_end"


def calculate_reincarnation_points(run: RunState) -> int:
    base = run.money / 1000
    skill_value = sum(run.skills.values()) / 20
    career_value = run.career_level * 3
    penalty = 5 if run.finish_reason == "bankrupt" else 0
    return max(0, math.floor(base + skill_value + career_value - penalty))
