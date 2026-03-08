import { useState } from "react";
import { useStudyPlans, useCreateStudyPlan } from "@/hooks/use-study-plans";
import { Calendar, Plus, Loader2, Book, Clock } from "lucide-react";
import { format } from "date-fns";
import { StudyPlan } from "@shared/schema";

export default function StudyPlanner() {
  const { data: plans, isLoading } = useStudyPlans();
  const createPlan = useCreateStudyPlan();
  
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !examDate) return;
    
    await createPlan.mutateAsync({ subject, examDate });
    setSubject("");
    setExamDate("");
    setIsFormOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Study Planner</h1>
          <p className="text-muted-foreground mt-2">Organize your preparation leading up to exams.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Plan
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-card p-6 rounded-3xl border border-border shadow-lg animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4">Create New Plan</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Subject / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Operating Systems"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Exam Date</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={createPlan.isPending}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {createPlan.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Generate Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : plans?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground">No plans yet</h3>
          <p className="text-muted-foreground mt-2">Create your first study plan to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {plans?.map((plan: StudyPlan) => (
            <div key={plan.id} className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Book className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.subject}</h3>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" /> Exam: {format(new Date(plan.examDate), 'MMMM do, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-sm md:prose-base max-w-none text-foreground prose-p:leading-relaxed prose-headings:font-bold">
                  {/* Safely render generated plan content. A real app might use Markdown parser here. */}
                  {plan.planContent.split('\n').map((line: string, i: number) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
