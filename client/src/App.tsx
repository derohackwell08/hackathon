import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import StudyPlanner from "./pages/study-planner";
import Chat from "./pages/chat";
import QuizGenerator from "./pages/quiz-generator";
import QuizTake from "./pages/quiz-take";
import Results from "./pages/results";

import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Protected App Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/planner">
        <ProtectedRoute>
          <Layout><StudyPlanner /></Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/chat">
        <ProtectedRoute>
          <Layout><Chat /></Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/quizzes">
        <ProtectedRoute>
          <Layout><QuizGenerator /></Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/quizzes/:id">
        <ProtectedRoute>
          <Layout><QuizTake /></Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/results">
        <ProtectedRoute>
          <Layout><Results /></Layout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
