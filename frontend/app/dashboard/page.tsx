
"use client";
import { useMe } from "@/hooks/useMe";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/helpers";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, error } = useMe();

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return <div>Loading…</div>;
  if (error)   return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome to Xpinion!</h1>
      {user && <p>Hello, {user.username}!</p>}
      <button onClick={logout}>Log Out</button>
    </div>
  );
}
