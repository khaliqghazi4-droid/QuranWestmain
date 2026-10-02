"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Users, BookOpen, CornerDownLeft, type LucideIcon } from "lucide-react";
import { navConfig, type Role } from "@/lib/nav-config";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";

// Dashboard header search with live suggestions. Every role can jump to its
// own pages; the admin also finds students, teachers and courses by name,
// email or phone (/api/admin/search). Arrow keys move, Enter opens, Esc closes.

type Group = "Pages" | "Students" | "Teachers" | "Courses";

type Suggestion = {
  key: string;
  group: Group;
  label: string;
  sub?: string;
  href: string;
  icon?: LucideIcon;
  avatarName?: string; // people show their avatar instead of an icon
};

type SearchResponse = {
  students: { id: string; name: string; email: string; country: string | null }[];
  teachers: { id: string; name: string; email: string }[];
  courses: { id: string; name: string; level: string; isActive: boolean }[];
};

const GROUP_ORDER: Group[] = ["Pages", "Students", "Teachers", "Courses"];

const PLACEHOLDER: Record<Role, string> = {
  admin: "Search students, teachers, courses…",
  teacher: "Search pages…",
  student: "Search pages…",
};

export function HeaderSearch({ role }: { role: Role }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [remote, setRemote] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const term = query.trim();

  const pages = React.useMemo<Suggestion[]>(() => {
    if (!term) return [];
    const t = term.toLowerCase();
    // Best first: label starts with the text, then a word in it does, then anywhere
    const rank = (label: string) => {
      const l = label.toLowerCase();
      if (l.startsWith(t)) return 0;
      if (l.split(/\s+/).some((w) => w.startsWith(t))) return 1;
      return l.includes(t) ? 2 : -1;
    };
    return navConfig[role]
      .map((n) => ({ n, r: rank(n.label) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r)
      .slice(0, 5)
      .map(({ n }) => ({ key: `page:${n.href}`, group: "Pages", label: n.label, href: n.href, icon: n.icon }));
  }, [term, role]);

  // Admin: people and courses from the server, a moment after typing stops
  React.useEffect(() => {
    if (role !== "admin" || term.length < 2) {
      setRemote([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as SearchResponse;
        setRemote([
          ...data.students.map<Suggestion>((s) => ({
            key: `s:${s.id}`,
            group: "Students",
            label: s.name,
            sub: [s.email, s.country].filter(Boolean).join(" · "),
            href: `/app/admin/students/${s.id}`,
            avatarName: s.name,
          })),
          ...data.teachers.map<Suggestion>((t) => ({
            key: `t:${t.id}`,
            group: "Teachers",
            label: t.name,
            sub: t.email,
            href: `/app/admin/teachers/${t.id}`,
            avatarName: t.name,
          })),
          ...data.courses.map<Suggestion>((c) => ({
            key: `c:${c.id}`,
            group: "Courses",
            label: c.name,
            sub: c.isActive ? c.level : `${c.level} · inactive`,
            href: "/app/admin/courses",
            icon: BookOpen,
          })),
        ]);
        setLoading(false);
      } catch {
        if (ctrl.signal.aborted) return;
        setRemote([]);
        setLoading(false);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [term, role]);

  const items = React.useMemo(
    () => GROUP_ORDER.flatMap((g) => [...pages, ...remote].filter((s) => s.group === g)),
    [pages, remote]
  );

  React.useEffect(() => setActive(0), [term]);
  React.useEffect(() => {
    if (active > items.length - 1) setActive(Math.max(0, items.length - 1));
  }, [items.length, active]);

  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function go(s: Suggestion) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(s.href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const s = items[active] ?? items[0];
      if (s) {
        e.preventDefault();
        go(s);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showPanel = open && term.length > 0;
  const emptyText = loading
    ? "Searching…"
    : role === "admin" && term.length < 2
      ? "Type at least 2 letters to search students, teachers and courses"
      : `No results for “${term}”`;

  return (
    <div ref={boxRef} className="relative max-w-md flex-1 hidden sm:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={PLACEHOLDER[role]}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="header-search-results"
        aria-activedescendant={showPanel && items[active] ? `hs-${items[active].key}` : undefined}
        className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-9 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}

      {showPanel && (
        <div
          id="header-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          <div className="max-h-[70vh] overflow-y-auto py-1">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">{emptyText}</p>
            ) : (
              GROUP_ORDER.map((group) => {
                const inGroup = items.filter((s) => s.group === group);
                if (inGroup.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    {inGroup.map((s) => {
                      const index = items.indexOf(s);
                      const Icon = s.icon ?? Users;
                      return (
                        <button
                          key={s.key}
                          id={`hs-${s.key}`}
                          role="option"
                          aria-selected={index === active}
                          onMouseEnter={() => setActive(index)}
                          onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                          onClick={() => go(s)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                            index === active ? "bg-muted" : "hover:bg-muted/60"
                          )}
                        >
                          {s.avatarName ? (
                            <Avatar name={s.avatarName} size={28} className="border" />
                          ) : (
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              <Highlight text={s.label} term={term} />
                            </span>
                            {s.sub && (
                              <span className="block truncate text-[11px] text-muted-foreground">
                                <Highlight text={s.sub} term={term} />
                              </span>
                            )}
                          </span>
                          {index === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
            ↑ ↓ to move · Enter to open · Esc to close
          </div>
        </div>
      )}
    </div>
  );
}

// Bolds the first case-insensitive match of term inside text
function Highlight({ text, term }: { text: string; term: string }) {
  const i = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-bold text-primary">{text.slice(i, i + term.length)}</span>
      {text.slice(i + term.length)}
    </>
  );
}
