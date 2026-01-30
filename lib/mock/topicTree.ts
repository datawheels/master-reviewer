import { TopicNode, Role } from "@/lib/topics/types";

function node(
  role: Role,
  id: string,
  label: string,
  parentId: string | undefined,
  childrenIds: string[],
  level: number,
  band: 1|2|3|4|5
): TopicNode {
  return {
    role, id, label, parentId, childrenIds, level,
    metrics: { band, trend: "flat", attempts: Math.floor(Math.random()*20) }
  };
}

// Minimal but real tree
export const TOPIC_NODES: TopicNode[] = [
  // DE Level 1
  node("DE","de_sql","SQL", undefined, ["de_sql_joins","de_sql_windows","de_sql_modeling"], 1, 3),
  node("DE","de_py","Python", undefined, ["de_py_ds","de_py_debug"], 1, 4),
  node("DE","de_de","Data Engineering", undefined, ["de_de_etl","de_de_stream","de_de_dq"], 1, 3),

  // DE Level 2+
  node("DE","de_sql_joins","Joins", "de_sql", ["de_sql_joins_adv"], 2, 3),
  node("DE","de_sql_windows","Window Functions", "de_sql", [], 2, 2),
  node("DE","de_sql_modeling","Modeling", "de_sql", [], 2, 3),
  node("DE","de_sql_joins_adv","Join Debugging", "de_sql_joins", [], 3, 2),

  node("DE","de_py_ds","Data Structures", "de_py", [], 2, 4),
  node("DE","de_py_debug","Debugging", "de_py", [], 2, 3),

  node("DE","de_de_etl","ETL", "de_de", [], 2, 3),
  node("DE","de_de_stream","Streaming", "de_de", [], 2, 2),
  node("DE","de_de_dq","Data Quality", "de_de", [], 2, 3),

  // DS root
  node("DS","ds_ml","ML", undefined, ["ds_ml_eval","ds_ml_feat"], 1, 3),
  node("DS","ds_stats","Stats", undefined, ["ds_stats_tests"], 1, 4),

  node("DS","ds_ml_eval","Evaluation", "ds_ml", [], 2, 3),
  node("DS","ds_ml_feat","Features", "ds_ml", [], 2, 2),
  node("DS","ds_stats_tests","Hypothesis Tests", "ds_stats", [], 2, 4),

  // DA root
  node("DA","da_metrics","Metrics", undefined, ["da_metrics_funnels","da_metrics_ret"], 1, 3),
  node("DA","da_exp","Experimentation", undefined, ["da_exp_design"], 1, 3),

  node("DA","da_metrics_funnels","Funnels", "da_metrics", [], 2, 3),
  node("DA","da_metrics_ret","Retention", "da_metrics", [], 2, 2),
  node("DA","da_exp_design","Design", "da_exp", [], 2, 3),
];

export function nodesByRole(role: Role): TopicNode[] {
  return TOPIC_NODES.filter(n => n.role === role);
}

export function nodeById(id: string): TopicNode | undefined {
  return TOPIC_NODES.find(n => n.id === id);
}
