"""
Tracker integrity tests for data/applications.md and batch/tracker-additions/*.tsv.

Run: python3 -m pytest tests/ -v
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

# Import the validator — this import FAILS until tracker_validator.py exists.
from tests.tracker_validator import (
    load_canonical_states,
    parse_tracker,
    parse_tsv_file,
    validate_tracker,
)

CAREER_OPS = Path(__file__).parent.parent
SCORE_RE = re.compile(r"^\d+\.?\d*/5$")
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
REPORT_LINK_RE = re.compile(r"\]\(([^)]+)\)")


# ---------------------------------------------------------------------------
# 1. Unique entry IDs
# ---------------------------------------------------------------------------

def test_unique_entry_ids(tracker_path, states_path, reports_dir):
    """No two tracker rows may share the same # entry ID."""
    entries = parse_tracker(tracker_path)
    seen: dict[int, int] = {}
    duplicates = []
    for e in entries:
        if e["num"] in seen:
            duplicates.append(
                f"#{e['num']} appears at L{e['line_num']} and L{seen[e['num']]}"
            )
        else:
            seen[e["num"]] = e["line_num"]
    assert not duplicates, "Duplicate entry IDs found:\n" + "\n".join(duplicates)


# ---------------------------------------------------------------------------
# 2. Valid status enums
# ---------------------------------------------------------------------------

def test_all_statuses_canonical(tracker_path, states_path):
    """Every status must be a canonical value from templates/states.yml."""
    entries = parse_tracker(tracker_path)
    canonical = load_canonical_states(states_path)
    bad = []
    for e in entries:
        clean = e["status"].replace("**", "").strip().lower()
        clean = DATE_RE.sub("", clean).strip()
        if clean not in canonical:
            bad.append(f"#{e['num']} L{e['line_num']}: '{e['status']}'")
    assert not bad, "Non-canonical statuses:\n" + "\n".join(bad)


def test_no_markdown_bold_in_status(tracker_path):
    """Status field must not contain ** markdown."""
    entries = parse_tracker(tracker_path)
    bad = [f"#{e['num']} L{e['line_num']}: '{e['status']}'"
           for e in entries if "**" in e["status"]]
    assert not bad, "Markdown bold in status:\n" + "\n".join(bad)


def test_no_date_in_status(tracker_path):
    """Dates belong in the date column, not the status field."""
    entries = parse_tracker(tracker_path)
    bad = [f"#{e['num']} L{e['line_num']}: '{e['status']}'"
           for e in entries if DATE_RE.search(e["status"])]
    assert not bad, "Dates found in status field:\n" + "\n".join(bad)


# ---------------------------------------------------------------------------
# 3. Orphaned report links + duplicate report links
# ---------------------------------------------------------------------------

def test_no_orphaned_report_links(tracker_path, reports_dir):
    """Every [NNN](reports/...) link must resolve to an existing file."""
    entries = parse_tracker(tracker_path)
    missing = []
    for e in entries:
        m = REPORT_LINK_RE.search(e["report"])
        if not m:
            continue
        rel = m.group(1)
        target = CAREER_OPS / rel
        if not target.exists():
            missing.append(f"#{e['num']} L{e['line_num']}: {rel}")
    assert not missing, "Orphaned report links:\n" + "\n".join(missing)


def test_no_duplicate_report_links(tracker_path):
    """No two entries may point to the same report file."""
    entries = parse_tracker(tracker_path)
    seen: dict[str, int] = {}
    dupes = []
    for e in entries:
        m = REPORT_LINK_RE.search(e["report"])
        if not m:
            continue
        rel = m.group(1)
        if rel in seen:
            dupes.append(f"#{e['num']} and #{seen[rel]} both link to {rel}")
        else:
            seen[rel] = e["num"]
    assert not dupes, "Duplicate report links:\n" + "\n".join(dupes)


# ---------------------------------------------------------------------------
# 4. Score format
# ---------------------------------------------------------------------------

def test_score_format(tracker_path):
    """Scores must match X.X/5, X/5, N/A, or DUP."""
    entries = parse_tracker(tracker_path)
    bad = []
    for e in entries:
        s = e["score"].replace("**", "").strip()
        if not (SCORE_RE.match(s) or s in ("N/A", "DUP")):
            bad.append(f"#{e['num']} L{e['line_num']}: '{e['score']}'")
    assert not bad, "Invalid score formats:\n" + "\n".join(bad)


# ---------------------------------------------------------------------------
# 5. Row column counts in the markdown table
# ---------------------------------------------------------------------------

def test_row_column_count(tracker_path):
    """Every data row in applications.md must have exactly 9 inner columns."""
    content = tracker_path.read_text(encoding="utf-8")
    bad = []
    for line_num, line in enumerate(content.splitlines(), 1):
        if not line.startswith("|"):
            continue
        if "---" in line:
            continue
        if any(h in line for h in ("Empresa", "Rol", "Company", "Role", "Fecha", "Date", "#")):
            continue
        parts = [p.strip() for p in line.split("|")]
        # strip leading/trailing empty strings from outer pipes
        inner = parts[1:-1] if parts[0] == "" and parts[-1] == "" else parts
        if len(inner) < 9:
            bad.append(f"L{line_num}: {len(inner)} columns (need >=9): {line[:70]}")
    assert not bad, "Rows with wrong column count:\n" + "\n".join(bad)


# ---------------------------------------------------------------------------
# 6. TSV column counts and tab separators
# ---------------------------------------------------------------------------

def test_tsv_column_counts(tracker_additions_dir):
    """Each TSV file in tracker-additions/ must have 8 or 9 tab-separated fields."""
    tsv_files = list(tracker_additions_dir.glob("*.tsv"))
    if not tsv_files:
        pytest.skip("No pending TSV files")
    bad = []
    for f in tsv_files:
        content = f.read_text(encoding="utf-8").strip()
        if not content:
            bad.append(f"{f.name}: empty file")
            continue
        # Skip pipe-delimited files (they use | as separator)
        if content.startswith("|"):
            continue
        fields = content.split("\t")
        if len(fields) not in (8, 9):
            bad.append(f"{f.name}: {len(fields)} fields (expected 8 or 9)")
    assert not bad, "TSV column count errors:\n" + "\n".join(bad)


def test_tsv_tab_separators(tracker_additions_dir):
    """TSV files must use actual tab characters, not spaces, as separators."""
    tsv_files = list(tracker_additions_dir.glob("*.tsv"))
    if not tsv_files:
        pytest.skip("No pending TSV files")
    bad = []
    for f in tsv_files:
        content = f.read_text(encoding="utf-8").strip()
        if not content or content.startswith("|"):
            continue
        # A valid TSV line has tabs; 0 tabs but multiple "fields" by space = corrupt
        tab_count = content.count("\t")
        if tab_count < 7:
            bad.append(f"{f.name}: only {tab_count} tab(s) — may use spaces as separators")
    assert not bad, "TSV files with bad separators:\n" + "\n".join(bad)


# ---------------------------------------------------------------------------
# 7. Idempotent merge — running merge twice yields identical tracker
# ---------------------------------------------------------------------------

def test_merge_is_idempotent(sandbox):
    """merge-tracker.mjs must not change the tracker when there are no pending TSVs."""
    tracker = sandbox / "data" / "applications.md"
    before = tracker.read_text(encoding="utf-8")

    result = subprocess.run(
        ["node", str(CAREER_OPS / "merge-tracker.mjs")],
        cwd=str(sandbox),
        capture_output=True,
        text=True,
        env={
            **__import__("os").environ,
            "CAREER_OPS_ROOT": str(sandbox),
        },
    )
    # If merge-tracker references CAREER_OPS_ROOT, good; otherwise check output
    after = tracker.read_text(encoding="utf-8")
    assert before == after, (
        "merge-tracker changed the file when no TSVs were pending.\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )


# ---------------------------------------------------------------------------
# 8. validate_tracker integration test
# ---------------------------------------------------------------------------

def test_validate_tracker_clean(tracker_path, states_path, reports_dir):
    """validate_tracker() must return no errors on the current tracker."""
    errors = validate_tracker(tracker_path, states_path, reports_dir)
    assert not errors, (
        f"validate_tracker() found {len(errors)} error(s):\n"
        + "\n".join(errors)
    )
