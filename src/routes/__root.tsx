import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ArrowRight, Bookmark, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/univero-logo.png.asset.json";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="page-shell flex h-[72px] items-center justify-between gap-2 md:h-[84px] md:gap-4">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Univero home"><img src={logo.url} alt="Univero" className="h-[55px] w-auto md:h-[72px]" /></Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex" aria-label="Main navigation">
            <Link to="/results" className="hover:text-primary">Explore matches</Link><Link to="/compare" className="hover:text-primary">Compare</Link><Link to="/shortlist" className="hover:text-primary">My shortlist</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" asChild className="md:hidden" title="Shortlist"><Link to="/shortlist"><Bookmark /></Link></Button>
            <Button variant="ghost" size="icon" asChild className="md:hidden" title="Compare"><Link to="/compare"><GitCompareArrows /></Link></Button>
            <Button size="sm" asChild><Link to="/profile"><span className="sm:hidden">Match me</span><span className="hidden sm:inline">Find my matches</span> <ArrowRight /></Link></Button>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="mt-20 border-t border-border bg-card"><div className="page-shell flex flex-col gap-3 py-9 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between"><img src={logo.url} alt="Univero" className="h-[64px] w-fit" /><span>Find where you belong. Made for the possibilities ahead.</span><span>© 2026 Univero · Prototype data</span></div></footer>
    </QueryClientProvider>
  );
}
