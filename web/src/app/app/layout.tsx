import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { LowCreditBanner } from "@/components/CreditConfirmDialog";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";
import { SideNav } from "@/components/SideNav";
import { getMyBalance } from "@/lib/actions/credits";
import { getMyUnreadCounts } from "@/lib/db/counts";
import { getCurrentProfile } from "@/lib/db/profiles";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [counts, credits, profile] = await Promise.all([
    getMyUnreadCounts(),
    getMyBalance(),
    getCurrentProfile(),
  ]);

  return (
    <div className="flex min-h-dvh">
      <RealtimeRefresh profileId={profile?.id ?? null} />
      <SideNav unreadChat={counts.chat} unreadNotif={counts.notifications} credits={credits} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader unreadNotif={counts.notifications} credits={credits} />
        <LowCreditBanner balance={credits} threshold={50} />
        <main className="flex-1 pb-32 md:pb-8 md:pt-6">{children}</main>
      </div>
      <BottomNav unreadChat={counts.chat} />
    </div>
  );
}
