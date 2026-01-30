import { Question } from "@/lib/practice/types";

export default function AnswerPanel({
  question,
  answerText,
  setAnswerText,
  selectedChoiceIds,
  setSelectedChoiceIds,
  onSubmit,
  onSkip,
}: {
  question: Question;
  answerText: string;
  setAnswerText: (v: string) => void;
  selectedChoiceIds: string[];
  setSelectedChoiceIds: (v: string[]) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
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
                      setSelectedChoiceIds(
                        checked
                          ? selectedChoiceIds.filter((x) => x !== c.id)
                          : [...selectedChoiceIds, c.id]
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
  );
}
