import Link from "next/link";

export function NavHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-base tracking-tight hover:text-primary transition-colors"
        >
          CCAF Practice
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/practice"
            className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Practice
          </Link>
          <Link
            href="/quiz"
            className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Quiz
          </Link>
          <Link
            href="/progress"
            className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Progress
          </Link>
        </nav>
      </div>
    </header>
  );
}
