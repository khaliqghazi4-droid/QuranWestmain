import { PageHeader } from "@/components/dashboard/page-header";
import { Bone, SkeletonCard, SkeletonHero, SkeletonLabel } from "@/components/dashboard/skeleton";

// The page's header, and its placeholder for loading.tsx while navigating here

export function SettingsHeader() {
  return <PageHeader title="Settings" description="Configure your academy preferences and integrations" />;
}

// My Account (the profile hero, Personal Information beside Security and
// Account Type), then the six settings cards
export function SettingsShell() {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-sm font-bold">My Account</h2>
        <div className="space-y-6">
          <SkeletonHero tall button />
          <div className="grid gap-[24px] lg:grid-cols-3">
            <SkeletonCard className="p-[24px] lg:col-span-2">
              <Bone className="mb-[20px] h-4 w-44" />
              <div className="grid gap-[16px] sm:grid-cols-2">
                {["Full Name", "Email", "Phone", "Country", "Timezone"].map((l) => (
                  <div key={l}>
                    <SkeletonLabel className="mb-[8px]">{l}</SkeletonLabel>
                    <Bone className="h-4 w-40 max-w-full" />
                  </div>
                ))}
              </div>
              <SkeletonLabel className="mb-[8px] mt-[20px]">Bio</SkeletonLabel>
              <Bone className="h-3.5 w-full" />
              <Bone className="mt-[8px] h-3.5 w-2/3" />
            </SkeletonCard>
            <div className="space-y-6">
              <SkeletonCard className="p-[24px]">
                <div className="mb-[16px] flex items-center gap-[12px]">
                  <Bone className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-[6px]">
                    <Bone className="h-3.5 w-20" />
                    <Bone className="h-3 w-32" />
                  </div>
                </div>
                <Bone className="h-9 w-full rounded-xl" />
              </SkeletonCard>
              <SkeletonCard className="p-[24px]">
                <SkeletonLabel>Account Type</SkeletonLabel>
                <Bone className="mt-[8px] h-4 w-24" />
                <Bone className="mt-[10px] h-3 w-40" />
              </SkeletonCard>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="p-[24px]">
            <Bone className="mb-[16px] h-12 w-12 rounded-xl" />
            <Bone className="h-3.5 w-36" />
            <Bone className="mt-[8px] h-3 w-52 max-w-full" />
          </SkeletonCard>
        ))}
      </div>
    </>
  );
}
