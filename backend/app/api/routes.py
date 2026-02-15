from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.domain.actions import UPGRADES
from app.services.game_service import GameService


class ActionRequest(BaseModel):
    action_id: str


class UpgradeRequest(BaseModel):
    upgrade_id: str


def build_router(service: GameService) -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @router.get("/actions")
    def list_actions():
        return service.list_actions()

    @router.get("/upgrades")
    def list_upgrades():
        return list(UPGRADES.values())

    @router.get("/meta")
    def get_meta():
        return service.get_meta()

    @router.post("/runs")
    def create_run():
        return service.start_run()

    @router.get("/runs/{run_id}")
    def get_run(run_id: str):
        snapshot = service.get_run(run_id)
        if snapshot is None:
            raise HTTPException(status_code=404, detail="run_not_found")
        return snapshot

    @router.post("/runs/{run_id}/actions")
    def apply_action(run_id: str, payload: ActionRequest):
        result = service.apply_action(run_id=run_id, action_id=payload.action_id)
        if result is None:
            raise HTTPException(status_code=404, detail="run_not_found")
        return result

    @router.post("/runs/{run_id}/next-month")
    def next_month(run_id: str):
        result = service.resolve_month(run_id)
        if result is None:
            raise HTTPException(status_code=404, detail="run_not_found")
        return result

    @router.post("/meta/upgrades")
    def purchase_upgrade(payload: UpgradeRequest):
        return service.purchase_upgrade(payload.upgrade_id)

    return router
