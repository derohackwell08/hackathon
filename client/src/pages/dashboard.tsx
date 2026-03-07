import { useAuth } from "@/hooks/use-auth";
import { useStudyPlans } from "@/hooks/use-study-plans";
import { useResults } from "@/hooks/use-results";
import { Link } from "wouter";
import { Calendar, BrainCircuit, Target, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: plans, isLoading: plansLoading } = useStudyPlans();
  const { data: results, isLoading: resultsLoading } = useResults();

  if (plansLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingPlans = plans?.slice(0, 3) || [];
  const weakTopics = results?.weakTopics?.slice(0, 4) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Welcome back, {user?.firstName || 'Student'}! 👋</h1>
        <p className="text-muted-foreground mt-2 text-lg">Here's your learning overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <h3 className="text-primary font-semibold flex items-center gap-2 mb-4">
            <Target className="w-5 h-5" /> Average Score
          </h3>
          <div className="text-4xl font-extrabold text-foreground">
            {results?.averageScore ? `${Math.round(results.averageScore)}%` : '--'}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Across all generated quizzes</p>
        </div>
        
        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
          <h3 className="text-muted-foreground font-semibold flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-accent-foreground" /> Quizzes Taken
          </h3>
          <div className="text-4xl font-extrabold text-foreground">
            {results?.quizzes?.length || 0}
          </div>
          <div className="mt-4">
            <Link href="/quizzes" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
              Generate new quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
          <h3 className="text-muted-foreground font-semibold flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-accent-foreground" /> Study Plans
          </h3>
          <div className="text-4xl font-extrabold text-foreground">
            {plans?.length || 0}
          </div>
          <div className="mt-4">
            <Link href="/planner" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
              View planner <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Study Plans */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Upcoming Exams
            </h2>
            <Link href="/planner" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {upcomingPlans.length === 0 ? (
              <div className="bg-secondary/50 rounded-2xl p-8 text-center border border-border/50">
                <p className="text-muted-foreground mb-4">No upcoming exams scheduled.</p>
                <Link href="/planner" className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors">
                  Create Study Plan
                </Link>
              </div>
            ) : (
              upcomingPlans.map(plan => (
                <div key={plan.id} className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{plan.subject}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Exam on {format(new Date(plan.examDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-destructive" /> Needs Review
            </h2>
            <Link href="/results" className="text-sm text-primary hover:underline">Full Analysis</Link>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
            {weakTopics.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No weak topics identified yet. Take more quizzes!</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {weakTopics.map((topic, i) => (
                  <li key={i} className="p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <span className="font-medium">{topic}</span>
                    <Link href={`/quizzes?topic=${encodeURIComponent(topic)}`} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium hover:bg-border transition-colors">
                      Practice This
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
