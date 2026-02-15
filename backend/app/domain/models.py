from __future__ import annotations

from pydantic import BaseModel, Field


class MetaState(BaseModel):
    soul_points: int = 0
    upgrades: dict[str, int] = Field(default_factory=lambda: {"study_efficiency": 0, "start_money_bonus": 0})


class RunState(BaseModel):
    run_id: str
    month_index: int = 0
    month_time_budget: int = 160
    time_left: int = 160
    money: int = 3000
    health: int = 70
    stress: int = 20
    career_level: int = 0
    skills: dict[str, int] = Field(default_factory=lambda: {"dev": 0, "sales": 0, "finance": 0})
    investments: int = 0
    log: list[str] = Field(default_factory=list)
    finished: bool = False
    finish_reason: str | None = None
    points_granted: bool = False


class ActionDefinition(BaseModel):
    action_id: str
    title: str
    time_cost: int
    money_delta: int = 0
    health_delta: int = 0
    stress_delta: int = 0
    skill_delta: dict[str, int] = Field(default_factory=dict)


class RunSnapshot(BaseModel):
    run: RunState
    meta: MetaState


class TurnResult(BaseModel):
    run: RunState
    message: str


class MonthResolution(BaseModel):
    run: RunState
    events: list[str]


class UpgradeDefinition(BaseModel):
    upgrade_id: str
    title: str
    max_level: int
    cost_base: int


class UpgradePurchaseResult(BaseModel):
    meta: MetaState
    message: str
