"""Shared fixtures for career-ops tracker tests."""

import shutil
from pathlib import Path

import pytest

CAREER_OPS = Path(__file__).parent.parent


@pytest.fixture(scope="session")
def career_ops_root():
    return CAREER_OPS


@pytest.fixture(scope="session")
def tracker_path(career_ops_root):
    p = career_ops_root / "data" / "applications.md"
    if not p.exists():
        p = career_ops_root / "applications.md"
    return p


@pytest.fixture(scope="session")
def states_path(career_ops_root):
    return career_ops_root / "templates" / "states.yml"


@pytest.fixture(scope="session")
def reports_dir(career_ops_root):
    return career_ops_root / "reports"


@pytest.fixture(scope="session")
def tracker_additions_dir(career_ops_root):
    return career_ops_root / "batch" / "tracker-additions"


@pytest.fixture
def sandbox(tmp_path, tracker_path, states_path, reports_dir):
    """Isolated copy of tracker data for mutation tests."""
    (tmp_path / "data").mkdir()
    shutil.copy2(tracker_path, tmp_path / "data" / "applications.md")

    (tmp_path / "templates").mkdir()
    shutil.copy2(states_path, tmp_path / "templates" / "states.yml")

    sandbox_reports = tmp_path / "reports"
    sandbox_reports.mkdir()
    for f in reports_dir.glob("*.md"):
        shutil.copy2(f, sandbox_reports / f.name)

    (tmp_path / "batch" / "tracker-additions" / "merged").mkdir(parents=True)

    return tmp_path
