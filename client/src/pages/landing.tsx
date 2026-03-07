import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, BrainCircuit, Sparkles, Target, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <header className="container mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <BookOpen className="w-7 h-7" />
          <span>AI Study</span>
        </div>
        <div className="flex gap-4">
          <a 
            href="/api/login"
            className="px-5 py-2.5 rounded-full font-semibold text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Sign In
          </a>
          <a 
            href="/api/login"
            className="px-5 py-2.5 rounded-full font-semibold text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Get Started
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 border border-border/50 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Your intelligent learning companion</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6 text-foreground"
        >
          Master any subject with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI-powered</span> study tools.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12"
        >
          Generate practice quizzes, get real-time tutoring from our AI assistant, and track your weak points to study smarter, not harder.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a 
            href="/api/login"
            className="group px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
          >
            Start Learning Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left"
        >
          {[
            { icon: BrainCircuit, title: "Smart Quizzes", desc: "Generate MCQs instantly for any topic like DBMS, OS, or Java." },
            { icon: MessageSquare, title: "24/7 AI Tutor", desc: "Ask questions, get explanations, and clear your doubts anytime." },
            { icon: Target, title: "Target Weaknesses", desc: "Our analytics pinpoint what you need to review before exams." },
          ].map((feature, i) => (
            <div key={i} className="bg-card p-6 rounded-3xl border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
