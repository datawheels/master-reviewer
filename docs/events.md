# Analytics Events (UI-only stub)

- role_selected { role, selected }
- topic_selected { role, topicId, mode: "selected" | "implicitly_included" }
- include_children_toggled { role, topicId, includeChildren }
- topic_removed { role, topicId, removed_descendant_count }
- topics_see_more_clicked { role, level, seeMore }
- topic_details_opened { role, topicId }
- start_practice_clicked { role, topicId, source: "drawer" | "primary_cta" }
