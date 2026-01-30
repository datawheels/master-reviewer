export type Role = "DE" | "DS" | "DA";
export type QuestionFormat = "short" | "code" | "mcq" | "review" | "strategy";

export type RubricCategory =
  | "Correctness"
  | "Completeness"
  | "Clarity"
  | "Risk & Edge Cases"
  | "Structure";

export type Question = {
  id: string;
  role: Role;
  topicPath: string[];         // e.g., ["SQL", "Window Functions"]
  difficulty: 1 | 2 | 3 | 4 | 5;
  format: QuestionFormat;

  prompt: string;

  // MCQ
  choices?: { id: string; text: string }[];
  multiSelect?: boolean;

  // Sequencing
  sequence?: {
    kind: "planned" | "unplanned";
    step?: { index: number; total: number };   // planned only
    followUpOfQuestionId?: string;             // unplanned only
    hasContinue: boolean;                       // governs Next-Up “Continue”
  };

  // Disclosure label
  isReviewInjection?: boolean;
};

export type Feedback = {
  overallScore: number;          // 0-100
  overallBand: 1 | 2 | 3 | 4 | 5;
  confidence: "Low" | "Medium" | "High";

  rubric: Array<{
    category: RubricCategory;
    band: 1 | 2 | 3 | 4 | 5;
    rationale: string;
  }>;

  wentWell: string[];
  missing: string[];

  exemplarAnswer: string;
};

export type AttemptStatus =
  | "in_progress"              // question loaded, not submitted
  | "submitted_unresolved"     // feedback shown, Next-Up not chosen
  | "skipped_unresolved"       // skipped, Next-Up not chosen
  | "resolved";                // user chose Next-Up

export type Attempt = {
  attemptId: string;
  questionId: string;
  startedAt: number;
  updatedAt: number;

  status: AttemptStatus;

  answerText?: string;          // for short/code/strategy
  selectedChoiceIds?: string[]; // for mcq

  feedback?: Feedback;
};

export type PracticeContext = {
  role: Role;
  topicScope: string[];         // active topic path (mock)
  difficultyBias: "easier" | "balanced" | "harder";
};

export type NextUpAction =
  | "continue"
  | "new_random"
  | "harder"
  | "easier"
  | "change_topic"
  | "end_session";

export type NextUpOption = {
  action: NextUpAction;
  title: string;
  description: string;
};
