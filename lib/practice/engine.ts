import { MOCK_QUESTIONS } from "../mock/questions";
import { mockFeedback } from "../mock/feedback";
import { Attempt, NextUpOption, PracticeContext, Question } from "./types";

function pickRandom<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

export function selectNextQuestion(ctx: PracticeContext): Question {
  // Filter by role + (very simplified) topic scope.
  const candidates = MOCK_QUESTIONS.filter(
    (q) => q.role === ctx.role && ctx.topicScope.some((t) => q.topicPath.includes(t))
  );

  const base = candidates.length ? pickRandom(candidates) : pickRandom(MOCK_QUESTIONS);

  // 5% “Review injection” stub (label only for now)
  const inject = Math.random() < 0.05;
  if (!inject) return base;

  return { ...base, isReviewInjection: true };
}

export function createAttempt(questionId: string): Attempt {
  const now = Date.now();
  return {
    attemptId: crypto.randomUUID(),
    questionId,
    startedAt: now,
    updatedAt: now,
    status: "in_progress",
  };
}

export function submitAttempt(attempt: Attempt): Attempt {
  return {
    ...attempt,
    updatedAt: Date.now(),
    status: "submitted_unresolved",
    feedback: mockFeedback(),
  };
}

export function skipAttempt(attempt: Attempt): Attempt {
  return {
    ...attempt,
    updatedAt: Date.now(),
    status: "skipped_unresolved",
  };
}

/**
 * Next-Up card must ALWAYS show exactly 5 options.
 * "Continue" appears only when question.sequence?.hasContinue === true.
 */
export function buildNextUpOptions(q: Question): NextUpOption[] {
  const base: NextUpOption[] = [];

  if (q.sequence?.hasContinue) {
    base.push({
      action: "continue",
      title: "Continue",
      description: "Proceed to the next step / follow-up in this thread.",
    });
  } else {
    // Slot 1 becomes something else, but count stays 5.
    base.push({
      action: "new_random",
      title: "New random",
      description: "Load a fresh question from your current scope.",
    });
  }

  // Fill remaining slots deterministically
  const remaining: NextUpOption[] = [
    {
      action: "harder",
      title: "Harder",
      description: "Bias toward a harder question next.",
    },
    {
      action: "easier",
      title: "Easier",
      description: "Bias toward an easier question next.",
    },
    {
      action: "change_topic",
      title: "Change topic",
      description: "Go pick a different topic focus (mock).",
    },
    {
      action: "end_session",
      title: "End session",
      description: "Stop practice for now.",
    },
  ];

  // Ensure total is exactly 5
  const options = [...base, ...remaining].slice(0, 5);

  // If Continue existed, we still need exactly 5:
  // base[0]=continue + 4 of remaining
  return options;
}
