"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/helpers";
import type { ApiEnvelope, AuthPayload, User } from "@/lib/types";

type UseMeState =
  | { loading: true; error: null; user: null }
  | { loading: false; error: string | null; user: User | null };

export function useMe(): UseMeState {
  const [state, setState] = useState<UseMeState>({
    loading: true,
    error: null,
    user: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const envelope = await apiFetch<ApiEnvelope<AuthPayload>>("/auth/me"); // fetch envelope of payload(user)
        setState({ loading: false, error: null, user: envelope.data.user });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load user";
        setState({ loading: false, error: message, user: null });
      }
    })();
  }, []);

  return state;
}
