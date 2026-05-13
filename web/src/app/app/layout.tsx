import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { LowCreditBanner } from "@/components/CreditConfirmDialog";
import { NpsPrompt } from "@/components/app/NpsPrompt";
import { OnboardingTour } from "@/components/app/OnboardingTour";
import { PhotoNudgeBanner } from "@/components/app/PhotoNudgeBanner";
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

  const needsOnboarding = !!profile && !(profile as { onboarding_completed_at?: string | null }).onboarding_completed_at;
  const needsPhoto = !!profile && !profile.photo_url;

  return (
    <div className="flex min-h-dvh">
      <RealtimeRefresh profileId={profile?.id ?? null} />
      <SideNav unreadChat={counts.chat} unreadNotif={counts.notifications} credits={credits} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader unreadNotif={counts.notifications} credits={credits} />
        <LowCreditBanner balance={credits} threshold={50} />
        {needsPhoto && <PhotoNudgeBanner />}
        <main className="flex-1 pb-32 md:pb-8 md:pt-6">{children}</main>
      </div>
      <BottomNav unreadChat={counts.chat} />
      <OnboardingTour show={needsOnboarding} />
      <NpsPrompt />
    </div>
  );
}
