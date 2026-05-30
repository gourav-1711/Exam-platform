import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
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
import Profile from "@/pages/Profile";

// ─── Clerk setup ──────────────────────────────────────────────────────────────
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#7c3aed",
    colorForeground: "#111827",
    colorMutedForeground: "#6b7280",
    colorDanger: "#dc2626",
    colorBackground: "#ffffff",
    colorInput: "#f9fafb",
    colorInputForeground: "#111827",
    colorNeutral: "#e5e7eb",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center items-center min-h-[100dvh] bg-gray-50 px-4",
    cardBox: "bg-white rounded-2xl shadow-xl shadow-violet-100/50 border border-gray-100 w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-gray-900 font-extrabold",
    headerSubtitle: "text-gray-500",
    socialButtonsBlockButtonText: "text-gray-700 font-semibold",
    formFieldLabel: "text-gray-700 font-medium",
    footerActionLink: "text-violet-600 font-semibold hover:text-violet-700",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-400",
    identityPreviewEditButton: "text-violet-600",
    formFieldSuccessText: "text-green-600",
    alertText: "text-red-600",
    logoBox: "flex justify-center pt-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50 rounded-xl",
    formButtonPrimary: "bg-violet-600 hover:bg-violet-700 rounded-xl font-bold",
    formFieldInput: "rounded-xl border-gray-200 bg-gray-50 focus:ring-violet-500 focus:border-violet-500",
    footerAction: "bg-gray-50",
    dividerLine: "bg-gray-200",
    alert: "rounded-xl",
    otpCodeFieldInput: "rounded-xl border-gray-200",
    formFieldRow: "gap-3",
    main: "px-6 pb-6",
  },
};

// ─── Query Client ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

// ─── Cache invalidator ────────────────────────────────────────────────────────
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

// ─── Auth pages ───────────────────────────────────────────────────────────────
function SignInPage() {
  return <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />;
}

function SignUpPage() {
  return <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />;
}

// ─── Protected route wrapper ──────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />

        {/* Auth-required routes */}
        <Route path="/quiz">
          <RequireAuth><QuizListing /></RequireAuth>
        </Route>
        <Route path="/quiz/:id/play">
          {(params) => <RequireAuth><QuizPlayer /></RequireAuth>}
        </Route>
        <Route path="/quiz/:id">
          {(params) => <RequireAuth><QuizInstructions /></RequireAuth>}
        </Route>

        <Route path="/study-notes">
          <RequireAuth><StudyNotes /></RequireAuth>
        </Route>

        <Route path="/pyq">
          <RequireAuth><PyqSubjects /></RequireAuth>
        </Route>
        <Route path="/pyq/:subjectId">
          {(params) => <RequireAuth><PyqQuestions /></RequireAuth>}
        </Route>

        <Route path="/ncert-mcq">
          <RequireAuth><NcertMcq /></RequireAuth>
        </Route>

        <Route path="/mock-tests">
          <RequireAuth><MockTests /></RequireAuth>
        </Route>
        <Route path="/mock-tests/:id">
          {(params) => <RequireAuth><MockTestDetail /></RequireAuth>}
        </Route>

        {/* Public routes */}
        <Route path="/current-affairs" component={CurrentAffairsListing} />
        <Route path="/current-affairs/:id" component={CurrentAffairDetail} />
        <Route path="/ncert-books" component={NcertBooks} />
        <Route path="/pyp" component={Pyp} />
        <Route path="/syllabus" component={Syllabus} />
        <Route path="/support" component={Support} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/profile" component={Profile} />

        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

// ─── Clerk-wrapped provider ───────────────────────────────────────────────────
function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your Manish Ki Pathshala account",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Start your exam preparation journey today",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={AppRouter} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
