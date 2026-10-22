import { Bell, CreditCard, Globe, Mail, Settings, Shield } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonCard, SkeletonLabel } from "@/components/dashboard/skeleton";

// The page's header, its "Academy settings" tiles, and its placeholder for
// loading.tsx while navigating here

export function SettingsHeader() {
  return <PageHeader title="Settings" description="Configure your academy preferences and integrations" />;
}

export const SETTINGS_SECTIONS = [
  { icon: Settings, title: "General Settings", desc: "Academy name, logo, contact information" },
  { icon: Mail, title: "Email Configuration", desc: "SMTP settings, email templates, broadcasts" },
  { icon: Bell, title: "Notifications", desc: "Customize alerts for admins and users" },
  { icon: CreditCard, title: "Payment Gateways", desc: "Stripe, PayPal, and pricing plans" },
  { icon: Shield, title: "Security & Privacy", desc: "Authentication, 2FA, GDPR settings" },
  { icon: Globe, title: "Localization", desc: "Languages, timezones, regional settings" },
];

// The profile card (photo, name and tags, four contact details, bio) beside
// Security & account, then the Academy settings tiles
export function SettingsShell() {
  return (
    <>
      <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_340px]">
        <SkeletonCard className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-[16px] px-[20px] py-[20px] sm:px-[24px]">
            <Bone className="h-[80px] w-[80px] rounded-2xl" />
            <div className="min-w-[180px] flex-1 space-y-[10px]">
              <Bone className="h-5 w-40" />
              <div className="flex gap-[6px]">
                <Bone className="h-[24px] w-20 rounded-full" />
                <Bone className="h-[24px] w-48 rounded-full" />
              </div>
            </div>
            <Bone className="h-[36px] w-32 rounded-full" />
          </div>
          <div className="grid border-t border-border sm:grid-cols-2">
            {["Email", "Phone", "Country", "Timezone"].map((l, i) => (
              <div
                key={l}
                className={`flex items-center gap-[12px] border-border px-[20px] py-[14px] sm:px-[24px] ${
                  i > 0 ? "border-t" : ""
                } ${i === 1 ? "sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}
              >
                <Bone className="h-9 w-9 rounded-xl" />
                <div className="space-y-[6px]">
                  <SkeletonLabel>{l}</SkeletonLabel>
                  <Bone className="h-3.5 w-36" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-[20px] py-[14px] sm:px-[24px]">
            <SkeletonLabel>Bio</SkeletonLabel>
            <Bone className="mt-[8px] h-3.5 w-2/3" />
          </div>
        </SkeletonCard>

        <SkeletonCard className="overflow-hidden">
          <div className="px-[20px] py-[16px]">
            <h2 className="text-[16px] font-bold leading-[22px]">Security &amp; account</h2>
          </div>
          <div className="divide-y divide-border border-t border-border">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-[12px] px-[20px] py-[12px]">
                <Bone className="h-9 w-9 rounded-xl" />
                <div className="flex-1 space-y-[6px]">
                  <Bone className="h-3.5 w-28" />
                  <Bone className="h-3 w-40" />
                </div>
                {i < 2 && <Bone className="h-[26px] w-16 rounded-full" />}
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      <SkeletonCard className="overflow-hidden">
        <div className="px-[20px] py-[16px]">
          <h2 className="text-[16px] font-bold leading-[22px]">Academy settings</h2>
        </div>
        <div className="grid gap-[10px] px-[20px] pb-[20px] sm:grid-cols-2 lg:grid-cols-3">
          {SETTINGS_SECTIONS.map((s) => (
            <div key={s.title} className="adm-tile flex items-center gap-[12px] rounded-xl border-[1px] border-border p-[12px]">
              <Bone className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-[6px]">
                <Bone className="h-3.5 w-32" />
                <Bone className="h-3 w-44 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>
    </>
  );
}
