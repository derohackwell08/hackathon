import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuiz, useSubmitQuiz } from "@/hooks/use-quizzes";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizTake() {
  const [, params] = useRoute("/quizzes/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();

  const { data: quiz, isLoading } = useQuiz(id);
  const submitQuiz = useSubmitQuiz(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!quiz) return <div className="text-center py-20">Quiz not found</div>;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (option: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleNext = () => {
    if (!isLast) setCurrentIndex(c => c + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) return;
    }
    
    await submitQuiz.mutateAsync(answers);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Quiz Complete!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your answers have been analyzed and added to your results.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => setLocation("/results")} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
            View Analytics
          </button>
          <button onClick={() => setLocation("/quizzes")} className="px-6 py-3 bg-secondary text-foreground rounded-xl font-bold hover:bg-border transition-all">
            Generate Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz.subject}</h1>
          <p className="text-muted-foreground text-sm">{quiz.topic}</p>
        </div>
        <div className="bg-secondary px-4 py-2 rounded-lg font-bold font-mono">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="w-full bg-secondary h-2 rounded-full mb-10 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border shadow-lg rounded-[2rem] p-8 md:p-10 min-h-[400px] flex flex-col"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-8 leading-snug">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4 flex-1">
            {currentQuestion.options.map((opt: string, i: number) => {
              const isSelected = answers[currentQuestion.id] === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    isSelected 
                      ? "border-primary bg-primary/5 text-foreground shadow-sm" 
                      : "border-border/60 hover:border-primary/40 bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-bold mr-3 opacity-50">{String.fromCharCode(65 + i)}.</span>
                  <span className="font-medium text-[15px]">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 text-muted-foreground hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitQuiz.isPending}
                className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {submitQuiz.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-xl font-bold bg-foreground text-background shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
