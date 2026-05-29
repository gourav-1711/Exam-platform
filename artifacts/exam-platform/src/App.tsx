import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import QuizListing from "@/pages/QuizListing";
import QuizInstructions from "@/pages/QuizInstructions";
import QuizPlayer from "@/pages/QuizPlayer";
import CurrentAffairsListing from "@/pages/CurrentAffairsListing";
import CurrentAffairDetail from "@/pages/CurrentAffairDetail";
import StudyNotes from "@/pages/StudyNotes";
import PyqSubjects from "@/pages/PyqSubjects";
import PyqQuestions from "@/pages/PyqQuestions";
import NcertMcq from "@/pages/NcertMcq";
import NcertBooks from "@/pages/NcertBooks";
import Pyp from "@/pages/Pyp";
import Syllabus from "@/pages/Syllabus";
import MockTests from "@/pages/MockTests";
import MockTestDetail from "@/pages/MockTestDetail";
import Support from "@/pages/Support";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        
        {/* Quiz Routes */}
        <Route path="/quiz" component={QuizListing} />
        <Route path="/quiz/:id/play" component={QuizPlayer} />
        <Route path="/quiz/:id" component={QuizInstructions} />
        
        {/* Current Affairs Routes */}
        <Route path="/current-affairs" component={CurrentAffairsListing} />
        <Route path="/current-affairs/:id" component={CurrentAffairDetail} />
        
        {/* Resource Routes */}
        <Route path="/study-notes" component={StudyNotes} />
        <Route path="/pyq" component={PyqSubjects} />
        <Route path="/pyq/:subjectId" component={PyqQuestions} />
        <Route path="/ncert-mcq" component={NcertMcq} />
        <Route path="/ncert-books" component={NcertBooks} />
        <Route path="/pyp" component={Pyp} />
        <Route path="/syllabus" component={Syllabus} />
        
        {/* Mock Test Routes */}
        <Route path="/mock-tests" component={MockTests} />
        <Route path="/mock-tests/:id" component={MockTestDetail} />
        
        {/* Support & Static Routes */}
        <Route path="/support" component={Support} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />

        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
