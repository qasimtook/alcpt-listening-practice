import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TestSelection from "@/pages/test-selection";
import Question from "@/pages/question";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tests" component={TestSelection} />
      <Route path="/tests/:testId" component={TestSelection} />
      <Route path="/question" component={Question} />
      <Route path="/question/:questionId" component={Question} />
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
