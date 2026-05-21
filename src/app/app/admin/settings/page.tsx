import { PageHeader } from "@/components/dashboard/page-header";
import { Settings, Mail, Bell, CreditCard, Shield, Globe } from "lucide-react";

const sections = [
  { icon: Settings, title: "General Settings", desc: "Academy name, logo, contact information" },
  { icon: Mail, title: "Email Configuration", desc: "SMTP settings, email templates, broadcasts" },
  { icon: Bell, title: "Notifications", desc: "Customize alerts for admins and users" },
  { icon: CreditCard, title: "Payment Gateways", desc: "Stripe, PayPal, and pricing plans" },
  { icon: Shield, title: "Security & Privacy", desc: "Authentication, 2FA, GDPR settings" },
  { icon: Globe, title: "Localization", desc: "Languages, timezones, regional settings" },
];

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your academy preferences and integrations"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <button
            key={s.title}
            className="group text-left rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md mb-4 group-hover:scale-110 transition-transform">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold group-hover:text-primary transition-colors">
              {s.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
