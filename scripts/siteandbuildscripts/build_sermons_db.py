#!/usr/bin/env python3
"""
Build the deployable Electron SQLite database from local sermon source files.

Output defaults to resources/sermons.db, matching the desktop app's dev path
and GitHub release asset.

Important: this builds a lean DB. It does not create FTS/search index tables.
The Electron app creates those heavier tables locally after the DB is present
on the user's machine.
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from dataclasses import dataclass
from pathlib import Path


DEFAULT_SERMONS_DIR = Path("sermons")
DEFAULT_OUTPUT = Path("resources/sermons.db")


@dataclass
class Sermon:
    id: str
    title: str
    location: str
    year: str
    type: str
    date: str
    sermon: str
    audio_url: str
    download_link: str


def js_string_value(raw: str) -> str:
    raw = raw.strip()
    try:
        return json.loads(raw)
    except Exception:
        if (raw.startswith("'") and raw.endswith("'")) or (
            raw.startswith('"') and raw.endswith('"')
        ):
            return raw[1:-1]
        return raw


def unescape_template_literal(value: str) -> str:
    value = value.replace("\\`", "`").replace("\\${", "${")
    value = value.replace("\\\\", "\\")
    return value


def parse_template_at(text: str, start: int) -> tuple[str, int]:
    if text[start] != "`":
        raise ValueError("Expected template literal start")

    index = start + 1
    chunks: list[str] = []
    while index < len(text):
        char = text[index]
        if char == "\\" and index + 1 < len(text):
            chunks.append(text[index : index + 2])
            index += 2
            continue
        if char == "`":
            return unescape_template_literal("".join(chunks)), index + 1
        chunks.append(char)
        index += 1
    raise ValueError("Unterminated template literal")


def extract_field(segment: str, field: str, default: str = "") -> str:
    pattern = re.compile(
        rf"\b{re.escape(field)}\s*:\s*(?P<value>\"(?:\\.|[^\"])*\"|'(?:\\.|[^'])*'|[^\n,]+)",
        re.MULTILINE,
    )
    match = pattern.search(segment)
    if not match:
        return default
    return js_string_value(match.group("value").strip())


def parse_text_sermon_file(path: Path) -> list[Sermon]:
    text = path.read_text(encoding="utf-8", errors="replace")
    sermons: list[Sermon] = []
    cursor = 0

    while True:
        id_match = re.search(r"\bid\s*:", text[cursor:])
        if not id_match:
            break

        id_pos = cursor + id_match.start()
        object_start = text.rfind("{", 0, id_pos)
        sermon_match = re.search(r"\bsermon\s*:\s*`", text[id_pos:])
        if object_start == -1 or not sermon_match:
            cursor = id_pos + 3
            continue

        sermon_tick = id_pos + sermon_match.end() - 1
        before_sermon = text[object_start:sermon_tick]
        sermon_text, end_pos = parse_template_at(text, sermon_tick)

        sermons.append(
            Sermon(
                id=str(extract_field(before_sermon, "id")),
                title=extract_field(before_sermon, "title"),
                location=extract_field(before_sermon, "location"),
                year=extract_field(before_sermon, "year"),
                type=extract_field(before_sermon, "type", "text"),
                date=extract_field(before_sermon, "date"),
                sermon=sermon_text.strip(),
                audio_url=extract_field(before_sermon, "audioUrl"),
                download_link=extract_field(before_sermon, "downloadLink"),
            )
        )
        cursor = end_pos

    return sermons


def parse_audio_sermons(path: Path) -> list[Sermon]:
    text = path.read_text(encoding="utf-8", errors="replace")
    object_pattern = re.compile(r"\{(?P<body>[\s\S]*?)\}\s*,?", re.MULTILINE)
    sermons: list[Sermon] = []

    for match in object_pattern.finditer(text):
        body = match.group("body")
        if "id" not in body or "title" not in body:
            continue
        sermon_type = extract_field(body, "type", "")
        if sermon_type != "mp3":
            continue
        sermons.append(
            Sermon(
                id=str(extract_field(body, "id")),
                title=extract_field(body, "title"),
                location=extract_field(body, "location"),
                year=extract_field(body, "year"),
                type=sermon_type,
                date=extract_field(body, "date"),
                sermon="",
                audio_url=extract_field(body, "audioUrl"),
                download_link=extract_field(body, "downloadLink"),
            )
        )
    return sermons


def load_sermons(sermons_dir: Path) -> list[Sermon]:
    sermons: list[Sermon] = []
    for path in sorted(sermons_dir.glob("*/*.js")):
        sermons.extend(parse_text_sermon_file(path))
    sermons.extend(parse_audio_sermons(sermons_dir / "audio.ts"))
    return sermons


def initialize_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        DROP TABLE IF EXISTS sermons;
        DROP TABLE IF EXISTS sermon_db_meta;

        CREATE TABLE sermons (
          id TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          year TEXT,
          date TEXT,
          type TEXT,
          location TEXT,
          audio_url TEXT,
          download_link TEXT,
          sermon_text TEXT
        );

        CREATE INDEX idx_sermons_type ON sermons(type);
        CREATE INDEX idx_sermons_year ON sermons(year);
        CREATE INDEX idx_sermons_date ON sermons(date);

        CREATE TABLE sermon_db_meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        """
    )


def insert_sermons(connection: sqlite3.Connection, sermons: list[Sermon]) -> None:
    for sermon in sermons:
        connection.execute(
            """
            INSERT INTO sermons
              (id, title, year, date, type, location, audio_url, download_link, sermon_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sermon.id,
                sermon.title,
                sermon.year,
                sermon.date,
                sermon.type,
                sermon.location,
                sermon.audio_url,
                sermon.download_link,
                sermon.sermon,
            ),
        )

    connection.execute(
        "INSERT OR REPLACE INTO sermon_db_meta (key, value, updated_at) VALUES (?, ?, datetime('now'))",
        ("schema", "electron-lean-v1"),
    )
    connection.execute(
        "INSERT OR REPLACE INTO sermon_db_meta (key, value, updated_at) VALUES (?, ?, datetime('now'))",
        ("search_index_included", "false"),
    )


def verify_database(connection: sqlite3.Connection) -> dict[str, int]:
    values = {}
    for key, query in {
        "total": "SELECT COUNT(*) FROM sermons",
        "text": "SELECT COUNT(*) FROM sermons WHERE type = 'text'",
        "audio": "SELECT COUNT(*) FROM sermons WHERE type = 'mp3'",
        "meta": "SELECT COUNT(*) FROM sermon_db_meta",
    }.items():
        values[key] = int(connection.execute(query).fetchone()[0])
    return values


def main() -> int:
    parser = argparse.ArgumentParser(description="Build desktop resources/sermons.db from local sermon files.")
    parser.add_argument("--sermons-dir", type=Path, default=DEFAULT_SERMONS_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    sermons = load_sermons(args.sermons_dir)
    text_count = sum(1 for sermon in sermons if sermon.type == "text")
    audio_count = sum(1 for sermon in sermons if sermon.type == "mp3")

    if text_count == 0:
        raise RuntimeError("Parsed 0 text sermons")
    if audio_count == 0:
        raise RuntimeError("Parsed 0 audio sermons")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.output.exists():
        args.output.unlink()

    connection = sqlite3.connect(args.output)
    try:
        initialize_schema(connection)
        insert_sermons(connection, sermons)
        connection.commit()
        verification = verify_database(connection)
    finally:
        connection.close()

    size_mb = args.output.stat().st_size / 1024 / 1024
    print(f"Built database: {args.output}")
    print(f"Size: {size_mb:.2f} MB")
    print(f"Rows: {verification}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
