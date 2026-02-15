from __future__ import annotations

import os
import signal
from pathlib import Path


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    pid_path = project_root / "runtime" / "backend.pid"

    if not pid_path.exists():
        print("pid file not found")
        return

    pid = int(pid_path.read_text(encoding="utf-8").strip())
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"stopped backend pid={pid}")
    except ProcessLookupError:
        print(f"pid {pid} is not running")
    pid_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
