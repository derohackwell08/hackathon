import { useResults } from "@/hooks/use-results";
import { Loader2, TrendingUp, Target, Brain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Results() {
  const { data, isLoading } = useResults();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const chartData = data?.quizzes?.map((q, i) => ({
    name: `Quiz ${i + 1}`,
    score: q.score ? Math.round((q.score / (q.totalQuestions || 1)) * 100) : 0,
    subject: q.subject
  })) || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Results & Analytics</h1>
        <p className="text-muted-foreground mt-2 text-lg">Track your progress and identify areas for improvement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Graph */}
        <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary w-5 h-5" /> Performance History
          </h3>
          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No quiz data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weak Topics Analysis */}
        <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Target className="text-destructive w-5 h-5" /> Focus Areas
          </h3>
          
          <div className="flex-1">
            {!data?.weakTopics || data.weakTopics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Brain className="w-12 h-12 mb-3 opacity-20" />
                <p>Complete more quizzes to identify weak topics.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.weakTopics.map((topic, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-center justify-between">
                    <span className="font-semibold text-foreground">{topic}</span>
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                      Review Needed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
