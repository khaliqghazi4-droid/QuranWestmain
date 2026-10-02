import Image from "next/image";
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
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit the academy website"
            className="flex items-center group"
          >
            <Image
              src="/quran-academy-logo.png"
              alt="Quran Academy Logo"
              width={140}
              height={44}
              className="h-10 w-auto object-contain transition-opacity group-hover:opacity-80"
              priority
            />
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
