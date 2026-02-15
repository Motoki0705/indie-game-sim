from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    runtime_dir = project_root / "runtime"
    runtime_dir.mkdir(exist_ok=True)

    log_path = runtime_dir / "backend.log"
    pid_path = runtime_dir / "backend.pid"

    with log_path.open("a", encoding="utf-8") as log_file:
        process = subprocess.Popen(  # noqa: S603
            [sys.executable, "-m", "app.main"],
            cwd=project_root,
            stdout=log_file,
            stderr=log_file,
            start_new_session=True,
        )

    pid_path.write_text(str(process.pid), encoding="utf-8")
    print(f"started backend pid={process.pid}")
    print(f"log: {log_path}")


if __name__ == "__main__":
    main()
