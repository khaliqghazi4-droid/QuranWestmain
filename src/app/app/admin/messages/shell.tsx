import { MessageSquare } from "lucide-react";
import { Bone, SkeletonAvatar, SkeletonLines } from "@/components/dashboard/skeleton";

// The inbox while it loads (page.tsx inside its Suspense, loading.tsx while
// navigating here): the conversation list with its search on the left, and
// on laptops the empty chat pane on the right
export function MessagesShell() {
  return (
    <div className="adm-glass h-full overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid h-full lg:grid-cols-[320px_1fr]">
        <div className="flex min-h-0 flex-col border-border lg:border-r">
          <div className="border-b border-border px-[12px] py-[8px]">
            <Bone className="h-8 w-full rounded-full" />
            {/* the filter chips: All, Unread, Needs reply, Teachers, Students */}
            <div className="mt-[10px] flex flex-wrap gap-[6px]">
              {["w-[38px]", "w-[66px]", "w-[92px]", "w-[74px]", "w-[74px]"].map((w, i) => (
                <Bone key={i} className={`h-[28px] rounded-full ${w}`} />
              ))}
            </div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-[12px] border-b border-border p-[16px]">
              <SkeletonAvatar size={40} />
              <SkeletonLines wide="w-28" narrow="w-44" />
            </div>
          ))}
        </div>
        <div className="hidden min-h-0 flex-col items-center justify-center gap-[12px] lg:flex">
          <div className="adm-icon grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquare className="h-7 w-7" />
          </div>
          <p className="text-base font-bold">Select a conversation</p>
          <Bone className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
