import { Question } from "../practice/types";

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q_sql_001",
    role: "DE",
    topicPath: ["SQL", "Joins"],
    difficulty: 2,
    format: "short",
    prompt:
      "Explain the difference between INNER JOIN and LEFT JOIN. When would LEFT JOIN change row counts?",
    sequence: { kind: "planned", step: { index: 1, total: 2 }, hasContinue: true },
  },
  {
    id: "q_sql_002",
    role: "DE",
    topicPath: ["SQL", "Joins"],
    difficulty: 3,
    format: "short",
    prompt:
      "Given a LEFT JOIN that increased row count, list the top 3 debugging checks you’d do.",
    sequence: { kind: "planned", step: { index: 2, total: 2 }, hasContinue: false },
  },
  {
    id: "q_py_001",
    role: "DE",
    topicPath: ["Python", "Data Structures"],
    difficulty: 3,
    format: "code",
    prompt:
      "Review this Python snippet for correctness and edge cases:\n\n" +
      "def dedupe_keep_last(xs):\n" +
      "    seen = set()\n" +
      "    out = []\n" +
      "    for x in xs:\n" +
      "        if x not in seen:\n" +
      "            out.append(x)\n" +
      "            seen.add(x)\n" +
      "    return out\n",
    sequence: { kind: "unplanned", followUpOfQuestionId: "q_py_000", hasContinue: false },
  },
  {
    id: "q_mcq_001",
    role: "DA",
    topicPath: ["Experimentation", "Metrics"],
    difficulty: 2,
    format: "mcq",
    prompt: "Which metric best captures early retention for a weekly planning product?",
    multiSelect: false,
    choices: [
      { id: "a", text: "Daily Active Users (DAU)" },
      { id: "b", text: "Day 7 retention" },
      { id: "c", text: "Pageviews per session" },
      { id: "d", text: "Time on site" },
    ],
    sequence: { kind: "planned", step: { index: 1, total: 1 }, hasContinue: false },
  },
];
