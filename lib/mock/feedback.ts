import { Feedback, RubricCategory } from "../practice/types";

const CATS: RubricCategory[] = [
  "Correctness",
  "Completeness",
  "Clarity",
  "Risk & Edge Cases",
  "Structure",
];

export function mockFeedback(): Feedback {
  const overallBand = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
  const overallScore = Math.min(100, Math.max(0, overallBand * 18 + Math.floor(Math.random() * 10)));

  const confidence = overallBand >= 4 ? "High" : overallBand === 3 ? "Medium" : "Low";

  return {
    overallScore,
    overallBand,
    confidence,
    rubric: CATS.map((c) => ({
      category: c,
      band: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
      rationale: `Mock rationale for ${c}. (Replace with real evaluator later.)`,
    })),
    wentWell: [
      "You stated the main idea clearly.",
      "You gave at least one concrete example.",
    ],
    missing: [
      "Call out edge cases explicitly.",
      "Add a brief tradeoff / decision rule.",
    ],
    exemplarAnswer:
      "Exemplar (mock): A strong answer defines terms, gives a simple example, then lists edge cases and tradeoffs.",
  };
}
