from __future__ import annotations

import json
from pathlib import Path

from app.domain.models import MetaState, RunState


class JsonStore:
    def __init__(self, base_dir: Path) -> None:
        self.base_dir = base_dir
        self.runs_dir = base_dir / "runs"
        self.meta_path = base_dir / "meta.json"
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.runs_dir.mkdir(parents=True, exist_ok=True)

    def load_meta(self) -> MetaState:
        if not self.meta_path.exists():
            meta = MetaState()
            self.save_meta(meta)
            return meta
        data = json.loads(self.meta_path.read_text(encoding="utf-8"))
        return MetaState.model_validate(data)

    def save_meta(self, meta: MetaState) -> None:
        self._atomic_write_json(self.meta_path, meta.model_dump())

    def load_run(self, run_id: str) -> RunState | None:
        path = self.runs_dir / f"{run_id}.json"
        if not path.exists():
            return None
        data = json.loads(path.read_text(encoding="utf-8"))
        return RunState.model_validate(data)

    def save_run(self, run: RunState) -> None:
        path = self.runs_dir / f"{run.run_id}.json"
        self._atomic_write_json(path, run.model_dump())

    def _atomic_write_json(self, path: Path, data: dict) -> None:
        tmp_path = path.with_suffix(path.suffix + ".tmp")
        backup_path = path.with_suffix(path.suffix + ".bak")
        text = json.dumps(data, ensure_ascii=False, indent=2)
        tmp_path.write_text(text, encoding="utf-8")
        if path.exists():
            path.replace(backup_path)
        tmp_path.replace(path)
