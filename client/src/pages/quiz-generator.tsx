import { useState } from "react";
import { useLocation } from "wouter";
import { useGenerateQuiz } from "@/hooks/use-quizzes";
import { BrainCircuit, Sparkles, Loader2 } from "lucide-react";

export default function QuizGenerator() {
  const [, setLocation] = useLocation();
  const generateQuiz = useGenerateQuiz();
  
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic) return;

    try {
      const quiz = await generateQuiz.mutateAsync({ subject, topic, difficulty });
      setLocation(`/quizzes/${quiz.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Quiz Generator</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Create custom multiple-choice quizzes powered by AI to test your knowledge on any topic.
        </p>
      </div>

      <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl shadow-black/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Subject Area</label>
            <input
              type="text"
              required
              placeholder="e.g., Computer Science, Biology, History"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Specific Topic</label>
            <input
              type="text"
              required
              placeholder="e.g., Relational Databases, Mitosis"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-secondary/50 border-2 border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['Easy', 'Medium', 'Hard'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-3 rounded-xl font-semibold border-2 transition-all ${
                    difficulty === level 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {generateQuiz.isError && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
              {generateQuiz.error?.message || "Failed to generate quiz. Try again."}
            </div>
          )}

          <button
            type="submit"
            disabled={generateQuiz.isPending || !subject || !topic}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all flex items-center justify-center gap-2 mt-8"
          >
            {generateQuiz.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating AI Quiz...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Create Quiz</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
