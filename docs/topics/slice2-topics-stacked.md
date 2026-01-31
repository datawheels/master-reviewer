# Topics Slice 2 — Stacked Levels + Details Panel (Dev)

Location: `/app/(app)/dev/topics-stacked`

## Goals
- Validate interaction model for topic selection across levels (L1 → L2).
- Validate details-side-panel UI and what context will be sent to question generation.

## Terminology
- **Explicit**: user directly selected the topic.
- **Implicit**: topic is included because its parent is selected, but the user did not explicitly choose it (or has demoted it).
- **Unselected**: not included and not visible (unless in Level 1 list).

## Selection rules
### Level 1
- Clicking an L1 pill toggles **explicit on/off**.
- When L1 becomes explicit:
  - All its Level 2 children are automatically added as **explicit** (default behavior).
- When L1 is removed:
  - Parent explicit is removed.
  - All child explicit selections under that parent are removed (strict cleanup).
  - Children disappear from Level 2 because they are no longer included.

### Level 2
- Level 2 shows only topics whose parent is explicitly selected.
- Clicking an L2 pill toggles:
  - **explicit → implicit** (removes explicit entry, but remains included via parent)
  - **implicit → explicit** (adds explicit entry)

## Details panel
- Each pill renders a **right-arrow** button.
- Clicking the arrow opens the Topic Details side panel.
- Clicking the pill itself does NOT open details; it toggles selection.

## Details panel contents
- **Metrics**: band (score), attempts, trend, last practiced
- **User input**:
  - Expertise slider (1–5)
  - Notes textarea (free-form)
- **User feedback**: concise “Strong points” and “Points to work on” bullets (scrollable)

## Context window (for future question generation)
The following fields are intended to be concatenated into a small context input:
- Topic label, role, level
- Metrics: band, attempts, trend, last practiced
- Expertise (1–5)
- User feedback bullets
- User notes (trimmed)

A preview is visible in the panel to validate what will be passed into generation.

## Known dev constraints
- Data is in-memory only (no persistence).
- Feedback is currently seeded heuristically; later replaced by analytics + AI.
- Actions are placeholders and only logged.
