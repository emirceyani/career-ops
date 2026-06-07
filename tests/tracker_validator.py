#!/usr/bin/env python3
"""
tracker_validator.py — Parse and validate career-ops tracker files.

Used by:
  - tests/test_tracker.py (pytest)
  - .git/hooks/pre-commit (git hook)
  - merge-tracker.mjs / dedup-tracker.mjs (via subprocess)

Exit codes (CLI mode):
  0 = clean
  1 = validation errors found
  2 = file not found or parse failure
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import TypedDict

import yaml

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

CAREER_OPS = Path(__file__).parent.parent

CANONICAL_STATUSES: set[str] = {
    "evaluated", "applied", "responded", "interview",
    "offer", "rejected", "discarded", "skip",
}

SCORE_RE = re.compile(r"^\d+\.?\d*/5$")
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
REPORT_LINK_RE = re.compile(r"\]\(([^)]+)\)")


class TrackerEntry(TypedDict):
    num: int
    date: str
    company: str
    role: str
    score: str
    status: str
    pdf: str
    report: str
    notes: str
    raw: str
    line_num: int


class TsvEntry(TypedDict):
    filename: str
    fields: list[str]
    tab_count: int
    is_pipe_delimited: bool


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def load_canonical_states(states_path: Path) -> set[str]:
    """Load canonical + alias status strings from templates/states.yml."""
    if not states_path.exists():
        return CANONICAL_STATUSES

    data = yaml.safe_load(states_path.read_text(encoding="utf-8"))
    result: set[str] = set()
    for state in data.get("states", []):
        result.add(state["label"].lower())
        for alias in state.get("aliases", []):
            result.add(alias.lower())
    return result


def _is_header_row(parts: list[str]) -> bool:
    """True if this pipe-delimited row is a markdown table header (not data)."""
    # The header row's first data cell is '#' or a word like 'Fecha', 'Empresa', etc.
    # Data rows always have an integer in parts[1].
    if not parts or len(parts) < 2:
        return True
    first = parts[1].strip()
    if first == "#":
        return True
    # If first cell is not parseable as int it's a header word
    try:
        int(first)
        return False
    except ValueError:
        return True


def parse_tracker(tracker_path: Path) -> list[TrackerEntry]:
    """Parse applications.md into a list of structured entry dicts."""
    entries: list[TrackerEntry] = []
    content = tracker_path.read_text(encoding="utf-8")

    for line_num, line in enumerate(content.splitlines(), 1):
        if not line.startswith("|"):
            continue
        if "---" in line:
            continue

        parts = [p.strip() for p in line.split("|")]
        # After split on "|": ['', col1, col2, ..., colN, '']
        if len(parts) < 11:  # 2 empty + 9 data cols
            continue

        if _is_header_row(parts):
            continue

        try:
            num = int(parts[1])
        except ValueError:
            continue
        if num == 0:
            continue

        entries.append(TrackerEntry(
            num=num,
            date=parts[2],
            company=parts[3],
            role=parts[4],
            score=parts[5],
            status=parts[6],
            pdf=parts[7],
            report=parts[8],
            notes=parts[9] if len(parts) > 9 else "",
            raw=line,
            line_num=line_num,
        ))

    return entries


def parse_tsv_file(tsv_path: Path) -> TsvEntry:
    """Parse a single TSV file from batch/tracker-additions/."""
    content = tsv_path.read_text(encoding="utf-8").strip()
    is_pipe = content.startswith("|")
    fields = (
        [f.strip() for f in content.split("|") if f.strip()]
        if is_pipe
        else content.split("\t")
    )
    return TsvEntry(
        filename=tsv_path.name,
        fields=fields,
        tab_count=content.count("\t"),
        is_pipe_delimited=is_pipe,
    )


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_tracker(
    tracker_path: Path,
    states_path: Path,
    reports_dir: Path,
) -> list[str]:
    """
    Validate the tracker. Returns a list of error strings.
    An empty list means the tracker is clean.
    """
    errors: list[str] = []

    if not tracker_path.exists():
        return [f"Tracker file not found: {tracker_path}"]

    entries = parse_tracker(tracker_path)
    canonical = load_canonical_states(states_path)

    # 1. Unique entry IDs
    seen_ids: dict[int, int] = {}
    for e in entries:
        if e["num"] in seen_ids:
            errors.append(
                f"L{e['line_num']}: duplicate entry ID #{e['num']} "
                f"(first at L{seen_ids[e['num']]})"
            )
        else:
            seen_ids[e["num"]] = e["line_num"]

    # 2. Status validation
    for e in entries:
        raw_status = e["status"]
        clean = raw_status.replace("**", "").strip().lower()
        # Strip any trailing date that leaked into the status
        clean = DATE_RE.sub("", clean).strip()

        if clean not in canonical:
            errors.append(
                f"L{e['line_num']}: #{e['num']}: non-canonical status '{raw_status}'"
            )
        if "**" in raw_status:
            errors.append(
                f"L{e['line_num']}: #{e['num']}: markdown bold in status '{raw_status}'"
            )
        if DATE_RE.search(raw_status):
            errors.append(
                f"L{e['line_num']}: #{e['num']}: date in status field '{raw_status}'"
            )

    # 3. Orphaned and duplicate report links
    seen_reports: dict[str, int] = {}
    for e in entries:
        m = REPORT_LINK_RE.search(e["report"])
        if not m:
            continue
        rel = m.group(1)
        # Reports are relative to the career-ops root
        target = reports_dir.parent / rel
        if not target.exists():
            errors.append(f"L{e['line_num']}: #{e['num']}: report not found: {rel}")
        if rel in seen_reports:
            errors.append(
                f"L{e['line_num']}: #{e['num']}: duplicate report link {rel} "
                f"(also #{seen_reports[rel]})"
            )
        else:
            seen_reports[rel] = e["num"]

    # 4. Score format
    for e in entries:
        s = e["score"].replace("**", "").strip()
        if not (SCORE_RE.match(s) or s in ("N/A", "DUP")):
            errors.append(
                f"L{e['line_num']}: #{e['num']}: invalid score '{e['score']}'"
            )

    # 5. Row column count
    content = tracker_path.read_text(encoding="utf-8")
    for line_num, line in enumerate(content.splitlines(), 1):
        if not line.startswith("|"):
            continue
        if "---" in line:
            continue
        parts = [p.strip() for p in line.split("|")]
        if _is_header_row(parts):
            continue
        inner = parts[1:-1]  # strip outer empty strings from pipes
        if len(inner) < 9:
            errors.append(
                f"L{line_num}: row has {len(inner)} columns (need >=9): {line[:60]}…"
            )

    return errors


def validate_tsv_additions(additions_dir: Path) -> list[str]:
    """Validate all pending TSV files in batch/tracker-additions/."""
    errors: list[str] = []
    if not additions_dir.exists():
        return errors

    for tsv_path in sorted(additions_dir.glob("*.tsv")):
        entry = parse_tsv_file(tsv_path)
        if entry["is_pipe_delimited"]:
            if len(entry["fields"]) < 8:
                errors.append(
                    f"{tsv_path.name}: pipe-delimited with only "
                    f"{len(entry['fields'])} fields (need >=8)"
                )
        else:
            if len(entry["fields"]) not in (8, 9):
                errors.append(
                    f"{tsv_path.name}: {len(entry['fields'])} tab-separated fields "
                    f"(expected 8 or 9)"
                )
            if entry["tab_count"] < 7:
                errors.append(
                    f"{tsv_path.name}: only {entry['tab_count']} tab(s) — "
                    f"may use spaces instead of tabs"
                )
    return errors


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def _resolve_paths(root: Path) -> tuple[Path, Path, Path]:
    tracker = root / "data" / "applications.md"
    if not tracker.exists():
        tracker = root / "applications.md"
    states = root / "templates" / "states.yml"
    reports = root / "reports"
    return tracker, states, reports


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv[1:]
    root = Path(args[0]) if args else CAREER_OPS

    tracker, states, reports = _resolve_paths(root)
    errors = validate_tracker(tracker, states, reports)
    errors += validate_tsv_additions(root / "batch" / "tracker-additions")

    if errors:
        print(f"❌ Tracker validation failed — {len(errors)} error(s):\n")
        for e in errors:
            print(f"  • {e}")
        print()
        return 1

    print(f"✅ Tracker is clean ({len(list(parse_tracker(tracker)))} entries)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
