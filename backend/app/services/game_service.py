from __future__ import annotations

from uuid import uuid4

from app.domain import engine
from app.domain.actions import UPGRADES
from app.domain.models import MetaState, MonthResolution, RunSnapshot, TurnResult, UpgradePurchaseResult
from app.repos.json_store import JsonStore


class GameService:
    def __init__(self, store: JsonStore) -> None:
        self.store = store

    def get_meta(self) -> MetaState:
        return self.store.load_meta()

    def list_actions(self):
        return engine.list_actions()

    def start_run(self) -> RunSnapshot:
        meta = self.store.load_meta()
        run_id = uuid4().hex[:12]
        run = engine.create_new_run(run_id=run_id, meta=meta)
        self.store.save_run(run)
        return RunSnapshot(run=run, meta=meta)

    def get_run(self, run_id: str) -> RunSnapshot | None:
        run = self.store.load_run(run_id)
        if run is None:
            return None
        meta = self.store.load_meta()
        return RunSnapshot(run=run, meta=meta)

    def apply_action(self, run_id: str, action_id: str) -> TurnResult | None:
        run = self.store.load_run(run_id)
        if run is None:
            return None
        meta = self.store.load_meta()
        result = engine.apply_action(run, meta, action_id)
        self._commit_if_finished(result.run, meta)
        return result

    def resolve_month(self, run_id: str) -> MonthResolution | None:
        run = self.store.load_run(run_id)
        if run is None:
            return None
        meta = self.store.load_meta()
        resolution = engine.resolve_month(run)
        self._commit_if_finished(resolution.run, meta)
        return resolution

    def purchase_upgrade(self, upgrade_id: str) -> UpgradePurchaseResult:
        meta = self.store.load_meta()
        upgrade = UPGRADES.get(upgrade_id)
        if upgrade is None:
            return UpgradePurchaseResult(meta=meta, message="Unknown upgrade.")

        current = meta.upgrades.get(upgrade_id, 0)
        if current >= upgrade.max_level:
            return UpgradePurchaseResult(meta=meta, message="Upgrade already maxed.")

        cost = upgrade.cost_base * (current + 1)
        if meta.soul_points < cost:
            return UpgradePurchaseResult(meta=meta, message="Not enough soul points.")

        meta.soul_points -= cost
        meta.upgrades[upgrade_id] = current + 1
        self.store.save_meta(meta)
        return UpgradePurchaseResult(meta=meta, message=f"Purchased {upgrade.title} Lv.{current + 1}.")

    def _commit_if_finished(self, run, meta: MetaState) -> None:
        if run.finished and not run.points_granted:
            points = engine.calculate_reincarnation_points(run)
            meta.soul_points += points
            run.points_granted = True
            run.log.append(f"Granted soul points: +{points}.")
            self.store.save_meta(meta)
        self.store.save_run(run)
