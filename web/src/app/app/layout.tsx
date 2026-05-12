import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { getMyUnreadCounts } from "@/lib/db/counts";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const counts = await getMyUnreadCounts();

  return (
    <div className="flex min-h-dvh">
      <SideNav unreadChat={counts.chat} unreadNotif={counts.notifications} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader unreadNotif={counts.notifications} />
        <main className="flex-1 pb-32 md:pb-8 md:pt-6">{children}</main>
      </div>
      <BottomNav unreadChat={counts.chat} />
    </div>
  );
}
