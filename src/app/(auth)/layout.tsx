import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthPanel from "@/components/auth/auth-panel";

// The sign-in pages, in the site's navy and gold: on laptops a navy side
// with the logo, a way back to the website and a welcome, and the form on
// the cream beside it; on phones and tablets the form alone, under the logo
// and the way back. The spacing follows the screen's height, so the page
// fits one screen without scrolling.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#FBF8F1] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <AuthPanel />

      <div className="flex min-h-screen flex-col">
        {/* phones and tablets (on laptops these are on the navy side) */}
        <header className="flex items-center justify-between gap-[1rem] px-[1.25rem] py-[clamp(0.6rem,2vh,1.25rem)] sm:px-[2rem] lg:hidden">
          <Link href="/" aria-label="Quran West home" className="shrink-0">
            <Image
              src="/quran-academy-logo.png"
              alt="Quran West Academy"
              width={140}
              height={57}
              className="h-auto w-[clamp(6.5rem,15vh,8.5rem)]"
              priority
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-[0.4rem] rounded-full border-[1px] border-[#0B1A37]/15 px-[1rem] py-[0.5rem] text-[0.82rem] font-semibold !text-[#0B1A37] !no-underline transition-colors duration-300 hover:border-[#0B1A37] hover:bg-[#0B1A37] hover:!text-white"
          >
            <ArrowLeft className="h-[0.9rem] w-[0.9rem]" aria-hidden="true" />
            Back to website
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-[1rem] py-[clamp(0.25rem,1vh,0.75rem)] sm:px-[2rem]">
          {children}
        </main>

        <p className="!mb-0 pb-[clamp(0.5rem,1.6vh,1.25rem)] pt-[clamp(0.25rem,1vh,0.5rem)] text-center !text-[0.8rem] !text-[#0B1A37]/65">
          © {new Date().getFullYear()} Quran West. All rights reserved.
        </p>
      </div>
    </div>
  );
}
