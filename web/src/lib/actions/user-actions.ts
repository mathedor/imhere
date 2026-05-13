"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export async function doCheckInAction(formData: FormData) {
  const estabId = String(formData.get("estabId") ?? "");
  if (!estabId) return;
  if (isMockMode()) {
    revalidatePath(`/app/estabelecimento/${estabId}`);
    return;
  }
  const sb = await supabaseServer();
  await sb.rpc("do_checkin", { estab_id: estabId });

  // Dispara match contextual em background (não bloqueia o redirect)
  notifyContextualMatches(estabId).catch((err) =>
    console.error("[notifyContextualMatches]", err)
  );

  revalidatePath(`/app/estabelecimento/${estabId}`);
  revalidatePath("/app");
}

/**
 * Notifica usuarios JÁ presentes no estab quando alguem com match potencial
 * (perfil similar OU já conversaram antes) faz check-in.
 */
async function notifyContextualMatches(estabId: string): Promise<void> {
  if (isMockMode()) return;
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;

    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const admin = supabaseAdmin();

    // Pega meu profile (gender, age, city)
    const { data: myProfile } = await admin
      .from("profiles")
      .select("id, name, gender, birth_date, city")
      .eq("id", user.id)
      .maybeSingle();
    if (!myProfile) return;

    // Quem está presente NESSE estab agora (exceto eu)
    const { data: presentRows } = await admin
      .from("checkins")
      .select("profile_id, profiles(id, gender, birth_date)")
      .eq("establishment_id", estabId)
      .eq("status", "active")
      .neq("profile_id", user.id);

    type PresentRow = {
      profile_id: string;
      profiles: { id: string; gender: string | null; birth_date: string | null } | null;
    };
    const present = (presentRows ?? []) as unknown as PresentRow[];
    if (present.length === 0) return;

    // Pega estab pra incluir o nome na notif
    const { data: estab } = await admin
      .from("establishments")
      .select("name")
      .eq("id", estabId)
      .maybeSingle();
    const estabName = estab?.name ?? "no lugar";

    // Histórico: conversas antigas (já conversamos)
    const { data: convs } = await admin
      .from("conversations")
      .select("participants")
      .contains("participants", [user.id])
      .limit(200);

    const knownIds = new Set<string>();
    for (const c of (convs ?? []) as Array<{ participants: string[] }>) {
      for (const p of c.participants ?? []) {
        if (p !== user.id) knownIds.add(p);
      }
    }

    // Match score simples:
    //  - +3 se já conversaram antes
    //  - +1 se idade similar (±5 anos)
    //  - +1 se gênero "compatível" (heuristica simples: gêneros opostos
    //    ou ambos "other" — você pode ajustar pela orientação dele futuramente)
    const myAge = myProfile.birth_date
      ? Math.floor((Date.now() - new Date(myProfile.birth_date).getTime()) / (365.25 * 86400_000))
      : null;
    const myGender = myProfile.gender;

    const matches: Array<{ profileId: string; score: number; reason: string }> = [];
    for (const row of present) {
      if (!row.profiles) continue;
      let score = 0;
      let reason = "";

      if (knownIds.has(row.profile_id)) {
        score += 3;
        reason = "que você já conversou";
      }

      if (myAge && row.profiles.birth_date) {
        const otherAge = Math.floor(
          (Date.now() - new Date(row.profiles.birth_date).getTime()) / (365.25 * 86400_000)
        );
        if (Math.abs(otherAge - myAge) <= 5) {
          score += 1;
          if (!reason) reason = "com idade próxima";
        }
      }

      if (myGender && row.profiles.gender) {
        const compat =
          (myGender === "male" && row.profiles.gender === "female") ||
          (myGender === "female" && row.profiles.gender === "male") ||
          (myGender === "other" || row.profiles.gender === "other");
        if (compat) {
          score += 1;
          if (!reason) reason = "do seu interesse";
        }
      }

      if (score >= 2) {
        matches.push({ profileId: row.profile_id, score, reason });
      }
    }

    // Pra cada match, notifica O OUTRO que A pessoa (currentUser) chegou
    if (matches.length === 0) return;

    const myName = myProfile.name ?? "Alguém";
    const myFirstName = myName.split(" ")[0];

    const notifRows = matches.map((m) => ({
      profile_id: m.profileId,
      kind: "checkin_done",
      title: `${myFirstName} chegou ${estabName} 👀`,
      body: `Possível match · ${m.reason} · perfil disponível pra conversa`,
      link: `/app/usuario/${user.id}`,
    }));

    await admin.from("notifications").insert(notifRows);

    // Push paralelo (silently noop sem VAPID)
    const { sendWebPushTo } = await import("@/lib/push");
    await Promise.all(
      matches.map((m) =>
        sendWebPushTo(m.profileId, {
          title: `${myFirstName} chegou ${estabName} 👀`,
          body: `Match potencial ${m.reason}`,
          url: `/app/usuario/${user.id}`,
          tag: `match-${user.id}`,
        }).catch(() => 0)
      )
    );
  } catch (err) {
    console.error("[notifyContextualMatches]", err);
  }
}

export async function doCheckOutAction(formData: FormData) {
  const estabId = String(formData.get("estabId") ?? "");
  if (isMockMode()) {
    if (estabId) revalidatePath(`/app/estabelecimento/${estabId}`);
    return;
  }
  const sb = await supabaseServer();
  await sb.rpc("do_checkout");
  if (estabId) revalidatePath(`/app/estabelecimento/${estabId}`);
  revalidatePath("/app");
}

export async function createContactRequestAction(formData: FormData) {
  const toProfileId = String(formData.get("toProfileId") ?? "");
  const establishmentId = String(formData.get("establishmentId") ?? "");
  if (!toProfileId || !establishmentId) return;
  if (isMockMode()) {
    revalidatePath(`/app/usuario/${toProfileId}`);
    return;
  }
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  await sb.from("contact_requests").insert({
    from_profile_id: user.id,
    to_profile_id: toProfileId,
    establishment_id: establishmentId,
  });
  await sb.from("notifications").insert({
    profile_id: toProfileId,
    kind: "contact_request",
    title: "Alguém quer falar com você",
    body: "Toque para responder",
    link: "/app/notificacoes",
  });
  revalidatePath(`/app/usuario/${toProfileId}`);
}

export async function respondContactRequestAction(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const accept = formData.get("accept") === "true";
  if (!requestId || isMockMode()) return;

  const sb = await supabaseServer();
  await sb.rpc("respond_contact_request", { req_id: requestId, accept });
  revalidatePath("/app/notificacoes");
  revalidatePath("/app/chat");
}
