from app.domain import engine
from app.domain.models import MetaState


def test_new_run_has_valid_initial_values() -> None:
    run = engine.create_new_run("test", MetaState())
    assert run.money == 3000
    assert run.time_left == 160
    assert run.finished is False


def test_action_consumes_time() -> None:
    run = engine.create_new_run("test", MetaState())
    result = engine.apply_action(run, MetaState(), "work")
    assert result.run.time_left == 110
    assert result.run.money == 4400


def test_resolve_month_advances_time() -> None:
    run = engine.create_new_run("test", MetaState())
    resolution = engine.resolve_month(run)
    assert resolution.run.month_index == 1
    assert resolution.run.time_left == 160
