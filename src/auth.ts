import { supabase } from "./supabase";

export type User = { id: string; email: string; diagnosis: string; role: "patient" | "provider" };

async function load(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u) return null;
  const { data: p, error } = await supabase.from("profiles").select("diagnosis, role").eq("id", u.id).single();
  if (error) throw error;
  return { id: u.id, email: u.email ?? "", diagnosis: p.diagnosis, role: p.role };
}

export const currentUser = load;

export async function signUp(email: string, password: string, diagnosis: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { diagnosis } },
  });
  if (error) throw error;
  if (!data.session) throw new Error("Check your email to confirm your account");
  return (await load())!;
}

export async function logIn(email: string, password: string): Promise<User> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return (await load())!;
}

export const logOut = () => supabase.auth.signOut();
