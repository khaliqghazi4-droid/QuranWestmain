import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettings } from "./account-settings";
import { SETTINGS_SECTIONS, SettingsHeader } from "./shell";

export default async function AdminSettings() {
  const session = await getServerSession(authOptions);
  const me = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          country: true,
          timezone: true,
          bio: true,
          image: true,
          role: true,
          createdAt: true,
        },
      })
    : null;

  return (
    // adm-night: the black-and-gold dark mode (globals.css), page by page
    <div className="adm-night space-y-[20px]">
      <SettingsHeader />

      {me && <AccountSettings user={{ ...me, createdAt: me.createdAt.toISOString() }} />}

      {/* Not built yet: plain tiles marked Soon, nothing to click. Sizes
          written out: Bootstrap's .text-sm/.text-xs have no line height. */}
      <section className="adm-glass overflow-hidden rounded-2xl border-[1px] border-border bg-card">
        <div className="px-[20px] py-[16px]">
          <h2 className="text-[16px] font-bold leading-[22px]">Academy settings</h2>
        </div>
        <ul className="grid gap-[10px] px-[20px] pb-[20px] sm:grid-cols-2 lg:grid-cols-3">
          {SETTINGS_SECTIONS.map((s) => (
            <li
              key={s.title}
              className="adm-tile flex items-center gap-[12px] rounded-xl border-[1px] border-border bg-background/60 p-[12px]"
            >
              <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <s.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold leading-[19px]">{s.title}</p>
                <p className="text-[12px] leading-[17px] text-muted-foreground">{s.desc}</p>
              </div>
              <span className="adm-chip shrink-0 self-start rounded-full bg-primary/10 px-[8px] py-[2px] text-[10.5px] font-bold leading-[15px] text-primary">
                Soon
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
