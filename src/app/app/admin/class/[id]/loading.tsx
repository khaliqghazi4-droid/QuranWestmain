import { Loader2, Video } from "lucide-react";

// The class room fills the whole area under the header; while it connects,
// a small card in the middle says so
export default function ClassRoomLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-[24px]">
      <div className="adm-glass flex flex-col items-center gap-[10px] rounded-2xl border border-border bg-card px-[32px] py-[28px] text-center">
        <div className="adm-icon grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Video className="h-5 w-5" />
        </div>
        <p className="text-[15px] font-bold">Opening the class room</p>
        <p className="flex items-center gap-[6px] text-[12px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…
        </p>
      </div>
    </div>
  );
}
