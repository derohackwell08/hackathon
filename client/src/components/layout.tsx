import { Link, useLocation } from "wouter";
import { BookOpen, LayoutDashboard, Calendar, MessageSquare, BrainCircuit, BarChart, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Study Planner", icon: Calendar },
  { href: "/chat", label: "AI Assistant", icon: MessageSquare },
  { href: "/quizzes", label: "Quiz Generator", icon: BrainCircuit },
  { href: "/results", label: "Results & Insights", icon: BarChart },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card hidden md:flex flex-col shadow-sm relative z-10">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-lg hover:opacity-80 transition-opacity">
            <BookOpen className="w-6 h-6" />
            <span>AI Study</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group",
                  active 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-3 bg-secondary/50 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.[0] || user?.email?.[0] || "U"
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">{user?.firstName || "Student"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 border-b border-border/50 bg-card flex items-center px-4 md:hidden justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold">
            <BookOpen className="w-6 h-6" />
            <span>AI Study</span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Mobile Nav could go here, keeping simple for now */}
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar relative z-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-8 max-w-6xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
