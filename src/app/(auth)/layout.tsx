import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { IslamicPattern } from "@/components/islamic-pattern";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <IslamicPattern className="text-primary" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl -z-10" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[hsl(var(--gold)/0.20)] blur-3xl -z-10" />

      <header className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">Online Quran</span>
              <span className="text-[11px] font-medium text-muted-foreground -mt-0.5">
                Academy
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
