import Link from "next/link";
import { BookOpen, Facebook, Instagram, Youtube, Mail, Phone } from "lucide-react";

const cols = [
  {
    title: "Courses",
    links: ["Noorani Qaida", "Nazra Quran", "Tajweed", "Hifz", "Tafseer", "Arabic"],
  },
  {
    title: "Academy",
    links: ["About Us", "Our Teachers", "Pricing", "Free Trial", "FAQ"],
  },
  {
    title: "Resources",
    links: ["Blog", "Student Portal", "Parent Portal", "Help Center", "Contact"],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="relative border-t border-border bg-muted/30 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-tight">
                  Online Quran
                </span>
                <span className="text-[11px] font-medium text-muted-foreground -mt-0.5">
                  Academy
                </span>
              </div>
            </Link>
            <p className="mt-5 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Empowering students worldwide to learn, recite, and memorize the
              Holy Quran with certified scholars from the comfort of home.
            </p>

            <div className="mt-6 space-y-2">
              <a
                href="mailto:info@onlinequranacademy.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@onlinequranacademy.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                +1 (234) 567-890
              </a>
            </div>

            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-bold tracking-wide uppercase mb-4 text-foreground">
                {c.title}
              </h4>
              <ul className="space-y-2.5">
                {c.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Online Quran Academy. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
