"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { isMockMode } from "@/lib/supabase/config";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export interface PushState {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  loading: boolean;
}

export function usePushSubscription() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: "unsupported",
    subscribed: false,
    loading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    if (!supported) {
      setState({ supported: false, permission: "unsupported", subscribed: false, loading: false });
      return;
    }

    (async () => {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      setState({
        supported: true,
        permission: Notification.permission,
        subscribed: !!sub,
        loading: false,
      });
    })();
  }, []);

  async function subscribe(): Promise<boolean> {
    if (!state.supported || isMockMode() || !VAPID_PUBLIC_KEY) return false;
    setState((s) => ({ ...s, loading: true }));

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState((s) => ({ ...s, permission, loading: false }));
      return false;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const sb = supabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      await sb.from("push_tokens").upsert({
        profile_id: user.id,
        platform: "web",
        token: JSON.stringify(sub.toJSON()),
        enabled: true,
      });
    }

    setState({ supported: true, permission: "granted", subscribed: true, loading: false });
    return true;
  }

  async function unsubscribe(): Promise<void> {
    if (!state.supported) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    setState((s) => ({ ...s, subscribed: false }));
  }

  return { ...state, subscribe, unsubscribe };
}
