"use client";

import { useEffect, useMemo, useState } from "react";
import { MOCK_QUESTIONS } from "@/lib/mock/questions";
import {
  Attempt,
  NextUpOption,
  PracticeContext,
  Question,
} from "@/lib/practice/types";
import {
  buildNextUpOptions,
  createAttempt,
  selectNextQuestion,
  skipAttempt,
  submitAttempt,
} from "@/lib/practice/engine";
import {
  appendHistory,
  loadContext,
  loadUnfinishedAttempt,
  saveUnfinishedAttempt,
} from "@/lib/practice/storage";

function findQuestion(questionId: string): Question | undefined {
  return MOCK_QUESTIONS.find((q) => q.id === questionId);
}

export default function PracticePage() {
  const [ctx, setCtx] = useState<PracticeContext | null>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  const [answerText, setAnswerText] = useState("");
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>([]);
  const [exemplarOpen, setExemplarOpen] = useState(false);

  // ---- Entry resolution (resume unfinished OR load random)
  useEffect(() => {
    const c = loadContext();
    setCtx(c);

    const unfinished = loadUnfinishedAttempt();
    if (unfinished) {
      const q = findQuestion(unfinished.questionId);
      if (q) {
        setQuestion(q);
        setAttempt(unfinished);
        setAnswerText(unfinished.answerText ?? "");
        setSelectedChoiceIds(unfinished.selectedChoiceIds ?? []);
        return;
      }
      // If question missing (mock bank changed), clear unfinished
      saveUnfinishedAttempt(null);
    }

    // otherwise random
    const q = selectNextQuestion(c);
    setQuestion(q);
    setAttempt(createAttempt(q.id));
  }, []);

  // Persist attempt as “unfinished” whenever it’s not resolved
  useEffect(() => {
    if (!attempt) return;
    if (attempt.status === "resolved") return;
    saveUnfinishedAttempt({
      ...attempt,
      answerText,
      selectedChoiceIds,
      updatedAt: Date.now(),
    });
  }, [attempt, answerText, selectedChoiceIds]);

  const nextUpOptions: NextUpOption[] = useMemo(() => {
    if (!question) return [];
    return buildNextUpOptions(question);
  }, [question]);

  if (!ctx || !question || !attempt) {
    return <div className="p-6 text-sm text-neutral-400">Loading Practice…</div>;
  }

  const showFeedback = attempt.status === "submitted_unresolved";
  const showNextUp =
    attempt.status === "submitted_unresolved" || attempt.status === "skipped_unresolved";

  function onSubmit() {
    // Minimal: bind answer into attempt and generate mock feedback
    const updated: Attempt = {
      ...attempt,
      answerText: question.format !== "mcq" ? answerText : undefined,
      selectedChoiceIds: question.format === "mcq" ? selectedChoiceIds : undefined,
      updatedAt: Date.now(),
    };

    const submitted = submitAttempt(updated);
    setAttempt(submitted);
    appendHistory(submitted);
    setExemplarOpen(false);
  }

  function onSkip() {
    const skipped = skipAttempt({
      ...attempt,
      answerText: question.format !== "mcq" ? answerText : undefined,
      selectedChoiceIds: question.format === "mcq" ? selectedChoiceIds : undefined,
      updatedAt: Date.now(),
    });
    setAttempt(skipped);
    appendHistory(skipped);
  }

  function resolveAndLoadNext(option: NextUpOption) {
    // Mark current attempt resolved and clear unfinished pointer
    const resolved: Attempt = { ...attempt, status: "resolved", updatedAt: Date.now() };
    setAttempt(resolved);
    saveUnfinishedAttempt(null);

    if (option.action === "end_session") {
      setQuestion(null);
      setAttempt(null);
      return;
    }

    // In a real system, “continue” would fetch a follow-up in the sequence.
    // For mock UI: just load a new random question (but the Continue option only appears when allowed).
    const next = selectNextQuestion(ctx);

    setQuestion(next);
    setAttempt(createAttempt(next.id));
    setAnswerText("");
    setSelectedChoiceIds([]);
    setExemplarOpen(false);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <header className="space-y-1">
          <div className="text-xs text-neutral-400">
            Role: <span className="text-neutral-200">{ctx.role}</span> · Scope:{" "}
            <span className="text-neutral-200">{ctx.topicScope.join(" / ")}</span>
          </div>
          <h1 className="text-2xl font-semibold">Practice</h1>
        </header>

        {/* Question Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-neutral-400">
              {question.topicPath.join(" · ")} · Difficulty {question.difficulty}/5
            </div>

            <div className="flex items-center gap-2 text-xs">
              {question.isReviewInjection && (
                <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-200 border border-amber-500/30">
                  Review
                </span>
              )}
              {question.sequence?.kind === "planned" && question.sequence.step && (
                <span className="rounded-full bg-sky-500/15 px-2 py-1 text-sky-200 border border-sky-500/30">
                  Step {question.sequence.step.index} of {question.sequence.step.total}
                </span>
              )}
              {question.sequence?.kind === "unplanned" && (
                <span className="rounded-full bg-fuchsia-500/15 px-2 py-1 text-fuchsia-200 border border-fuchsia-500/30">
                  Follow-up
                </span>
              )}
            </div>
          </div>

          <pre className="whitespace-pre-wrap text-sm leading-6 text-neutral-100">
            {question.prompt}
          </pre>
        </div>

        {/* Answer */}
        {!showNextUp && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
            <div className="text-sm font-medium">Your response</div>

            {question.format === "mcq" ? (
              <div className="space-y-2">
                {question.choices?.map((c) => {
                  const checked = selectedChoiceIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 cursor-pointer"
                    >
                      <input
                        type={question.multiSelect ? "checkbox" : "radio"}
                        name="mcq"
                        checked={checked}
                        onChange={() => {
                          if (question.multiSelect) {
                            setSelectedChoiceIds((prev) =>
                              prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                            );
                          } else {
                            setSelectedChoiceIds([c.id]);
                          }
                        }}
                        className="mt-1"
                      />
                      <span className="text-sm text-neutral-100">{c.text}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer (mock)."
                className="min-h-[180px] w-full rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 text-sm outline-none focus:border-neutral-600"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={onSubmit}
                className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200"
              >
                Submit
              </button>
              <button
                onClick={onSkip}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
              >
                Skip
              </button>
            </div>

            <div className="text-xs text-neutral-500">
              Resume rule: if you leave before choosing Next-Up, this attempt will resume here next time.
            </div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && attempt.feedback && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium">Feedback</div>
              <span className="text-xs rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
                Score {attempt.feedback.overallScore}/100
              </span>
              <span className="text-xs rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
                Band {attempt.feedback.overallBand}/5
              </span>
              <span className="text-xs rounded-full border border-neutral-700 px-2 py-1 text-neutral-200">
                Confidence {attempt.feedback.confidence}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {attempt.feedback.rubric.map((r) => (
                <div
                  key={r.category}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-neutral-300">{r.category}</div>
                    <div className="text-xs text-neutral-200">Band {r.band}/5</div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-400">{r.rationale}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
                <div className="text-xs font-medium text-neutral-200">What went well</div>
                <ul className="mt-2 list-disc pl-5 text-xs text-neutral-400 space-y-1">
                  {attempt.feedback.wentWell.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
                <div className="text-xs font-medium text-neutral-200">What’s missing</div>
                <ul className="mt-2 list-disc pl-5 text-xs text-neutral-400 space-y-1">
                  {attempt.feedback.missing.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
              <button
                onClick={() => setExemplarOpen((v) => !v)}
                className="text-xs font-medium text-neutral-200 hover:text-neutral-50"
              >
                {exemplarOpen ? "Hide" : "Show"} exemplar answer
              </button>
              {exemplarOpen && (
                <pre className="mt-3 whitespace-pre-wrap text-xs text-neutral-300">
                  {attempt.feedback.exemplarAnswer}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Next-Up (after feedback OR after skip) */}
        {showNextUp && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
            <div className="text-sm font-medium">Next-Up</div>
            <div className="text-xs text-neutral-400">
              Choose one option to continue. (Always exactly 5.)
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {nextUpOptions.map((o) => (
                <button
                  key={o.action}
                  onClick={() => resolveAndLoadNext(o)}
                  className="text-left rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 hover:border-neutral-600 hover:bg-neutral-950"
                >
                  <div className="text-sm font-semibold">{o.title}</div>
                  <div className="mt-1 text-xs text-neutral-400">{o.description}</div>
                </button>
              ))}
            </div>

            <div className="text-xs text-neutral-500">
              Continue is shown only when a follow-up exists; otherwise slot #1 becomes “New random”.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
