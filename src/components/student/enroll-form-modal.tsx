"use client";

import * as React from "react";
import {
  X,
  BookOpen,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

// Mirrors the public website's Enroll Now form so an in-app submission
// lands in the same MongoDB collection / admin review flow.
export type EnrollFormCourse = {
  id: string;
  name: string;
};

export type EnrollFormPrefill = {
  fullName: string;
  email: string;
  whatsapp: string;
  country: string;
};

type Child = { name: string; age: string; gender: "male" | "female" | "" };

const COUNTRIES = [
  "Pakistan",
  "United Kingdom",
  "United States",
  "Canada",
  "Saudi Arabia",
  "United Arab Emirates",
  "Australia",
  "Germany",
  "France",
  "Other",
];

export function EnrollFormModal({
  course,
  courses,
  prefill,
  onClose,
  onSubmitted,
}: {
  course: EnrollFormCourse;
  courses: EnrollFormCourse[];
  prefill: EnrollFormPrefill;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [selectedCourseId, setSelectedCourseId] = React.useState(course.id);
  const [courseFor, setCourseFor] = React.useState<"adult" | "kid">("adult");
  const [gender, setGender] = React.useState<"male" | "female" | "">("");
  const [tutorGender, setTutorGender] = React.useState<"male" | "female" | "">("");

  const [fullName, setFullName] = React.useState(prefill.fullName);
  const [email, setEmail] = React.useState(prefill.email);
  const [whatsapp, setWhatsapp] = React.useState(prefill.whatsapp);
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState(prefill.country || "Pakistan");

  const [children, setChildren] = React.useState<Child[]>([
    { name: "", age: "", gender: "" },
  ]);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  function addChild() {
    if (children.length >= 10) return;
    setChildren([...children, { name: "", age: "", gender: "" }]);
  }
  function removeChild(idx: number) {
    setChildren(children.filter((_, i) => i !== idx));
  }
  function updateChild(idx: number, patch: Partial<Child>) {
    setChildren(children.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    // Client-side guardrails — server re-validates everything.
    if (!fullName.trim()) return setError("Please enter your full name");
    if (!email.trim()) return setError("Please enter your email");
    if (!whatsapp.trim()) return setError("Please enter your WhatsApp number");
    if (!country.trim()) return setError("Please pick your country");
    if (!gender) return setError("Please select your gender");
    if (!tutorGender) return setError("Please select the tutor gender");

    const chosenCourse =
      courses.find((c) => c.id === selectedCourseId)?.name ?? course.name;

    setSubmitting(true);
    try {
      const res = await fetch("/api/enrollments/website-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: chosenCourse,
          courseFor,
          gender,
          tutorGender,
          fullName: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          city: city.trim(),
          country: country.trim(),
          children:
            courseFor === "kid"
              ? children
                  .filter((c) => c.name.trim())
                  .map((c) => ({
                    name: c.name.trim(),
                    age: c.age ? Number(c.age) : null,
                    gender: c.gender || null,
                  }))
              : [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `Failed to submit (${res.status})`);
        return;
      }
      setSuccess(true);
      // Brief delay so the success state is visible before the modal closes.
      setTimeout(() => onSubmitted(), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl my-auto"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-card rounded-t-3xl">
            <div>
              <h2 className="text-base font-bold">Enroll in this course</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                The academy admin will review your request and book your classes
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {success ? (
            <div className="p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold">Enrollment request sent!</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                The admin will contact you soon to schedule your first class.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="p-5 space-y-6">
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
                </div>
              )}

              {/* ─────────── Course details ─────────── */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Course details</p>
                    <p className="text-[11px] text-muted-foreground">
                      Choose your course and preferences
                    </p>
                  </div>
                </div>

                <Field label="Select Course" required>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Course For" required>
                  <ChoicePair
                    value={courseFor}
                    onChange={(v) => setCourseFor(v as "adult" | "kid")}
                    options={[
                      { value: "adult", label: "Adult", icon: <User className="h-4 w-4" /> },
                      { value: "kid", label: "Kid", icon: <User className="h-4 w-4" /> },
                    ]}
                  />
                </Field>

                <Field label="Your Gender" required>
                  <ChoicePair
                    value={gender}
                    onChange={(v) => setGender(v as "male" | "female")}
                    options={[
                      { value: "male", label: "Male", icon: <span>♂</span> },
                      { value: "female", label: "Female", icon: <span>♀</span> },
                    ]}
                  />
                </Field>

                <Field label="Required Tutor Gender" required>
                  <ChoicePair
                    value={tutorGender}
                    onChange={(v) => setTutorGender(v as "male" | "female")}
                    options={[
                      { value: "male", label: "Male tutor", icon: <span>♂</span> },
                      { value: "female", label: "Female tutor", icon: <span>♀</span> },
                    ]}
                  />
                </Field>

                {courseFor === "kid" && (
                  <Field label="Children details">
                    <div className="space-y-2">
                      {children.map((ch, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_auto] gap-2 rounded-xl border border-border bg-background p-2"
                        >
                          <input
                            type="text"
                            placeholder="Child name"
                            value={ch.name}
                            onChange={(e) => updateChild(i, { name: e.target.value })}
                            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          />
                          <input
                            type="number"
                            min={1}
                            max={99}
                            placeholder="Age"
                            value={ch.age}
                            onChange={(e) => updateChild(i, { age: e.target.value })}
                            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          />
                          <select
                            value={ch.gender}
                            onChange={(e) =>
                              updateChild(i, {
                                gender: e.target.value as "male" | "female" | "",
                              })
                            }
                            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          >
                            <option value="">Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                          {children.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeChild(i)}
                              className="grid h-9 w-9 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <div className="w-9" />
                          )}
                        </div>
                      ))}
                      {children.length < 10 && (
                        <button
                          type="button"
                          onClick={addChild}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" /> Add another child
                        </button>
                      )}
                    </div>
                  </Field>
                )}
              </section>

              {/* ─────────── Information ─────────── */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Information</p>
                    <p className="text-[11px] text-muted-foreground">
                      Your personal &amp; contact details
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Full Name" required>
                    <IconInput
                      icon={<User className="h-3.5 w-3.5" />}
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </Field>
                  <Field label="Email" required>
                    <IconInput
                      icon={<Mail className="h-3.5 w-3.5" />}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="WhatsApp Number" required>
                    <IconInput
                      icon={<Phone className="h-3.5 w-3.5" />}
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+92 300 1234567"
                    />
                  </Field>
                  <Field label="Country" required>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Field>
                  <Field label="City">
                    <IconInput
                      icon={<MapPin className="h-3.5 w-3.5" />}
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                    />
                  </Field>
                </div>
              </section>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Submit Enrollment Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function IconInput({
  icon,
  ...rest
}: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      <input
        {...rest}
        className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function ChoicePair({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon: React.ReactNode }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            <span className={active ? "text-primary" : "text-muted-foreground"}>
              {o.icon}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
