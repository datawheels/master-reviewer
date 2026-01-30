# Master Reviewer — UI Contracts (v1)

## Screens
- /practice (core engine)
- /topics (role + topic tree selection)
- /history (attempt log)
- /bookmarks (saved questions)
- /profile (local settings + reset)

## Topics — Required behaviors
- Role pills: multi-select + active role focus
- Level stacks: Level 1, Level 2, Level 3...
- Pill states: unselected | explicit | implicit
- Selecting L1 topic => include-children ON by default + reveal deeper levels
- Include toggle OFF => remove implicit descendants
- X removes topic + visible descendants immediately
- + Add topic per level inserts visible topic
- Topic details drawer on pill click + “Practice this topic”
- States: empty/loading/error + performance guard (>60 pills => internal scroll + see more)

## Visual rules
- Explicit pills: solid
- Implicit pills: ghost/dotted look
- Selected-count badge per level header
