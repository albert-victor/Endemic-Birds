# Endemic Birds — Cursor-ready destination data pack

## Purpose
This package is a **source-preserving content dataset** and a safe implementation brief for all 27 birding destinations in the supplied Excel file. It does not require you to rebuild or redesign the existing website.

## Contents
- `destinations.json` — canonical machine-readable data: 27 destinations, all species rows, scientific names (or `null`), original status labels, habitat, region, birding highlights.
- `CURSOR_IMPLEMENTATION_PROMPT.md` — detailed instructions to paste into Cursor Agent.
- `DESTINATIONS_OVERVIEW.md` — quick human-reference table.
- `qa_findings.json` — potential source quality issues that must not be silently corrected.
- `Bird_Destinations_Complete_Report.md` — full human-readable species-by-destination tables.

## Verified *against the spreadsheet*, not against external bird authorities
- 27 destinations
- 1,727 listed destination–species entries
- 650 distinct **nonblank** scientific-name strings
- 2 entries lack scientific names in the workbook (both under Nyerere National Park)

Previous discussion mentioned 651 unique scientific names. That count included one blank/null value; **650** is the corrected count of distinct nonblank names.

## Quick start
1. Unzip into a temporary project folder, e.g. `reference/endemic-birds-data/`.
2. Open `CURSOR_IMPLEMENTATION_PROMPT.md`, copy its agent prompt into Cursor.
3. Give Cursor access to `destinations.json`, `qa_findings.json`, and the existing website source files.
4. Have it **inspect existing destination routes/templates first**, then integrate data only into the matching birding destination pages.
5. Review preview and QA before publishing.

## Critical publishing caveat
The source sheet's `Tanzania endemic` and other categories are editorial/checklist labels, *not* IUCN conservation statuses. Neither species distribution nor taxonomic names have been independently revalidated. Don't generate statements that these lists are a comprehensive species count for any park.
