import { supabase } from "./supabase";
import type { Listing } from "./seed";

type CheckRow = {
  diagnosis: string;
  step_index: number;
  item_index: number;
  completed: boolean;
};

export type SavedRow = {
  diagnosis: string;
  step_index: number;
  item_index: number;
  category: string;
  listing_id: string;
};

export type SavedWithListing = SavedRow & { listing: Listing };

export const checkKey = (stepIndex: number, itemIndex: number) => `${stepIndex}:${itemIndex}`;

export async function getChecks(userId: string, diagnosis: string): Promise<Set<string>> {
  const { data, error } = await supabase.from("roadmap_checks")
    .select("diagnosis,step_index,item_index,completed")
    .eq("user_id", userId).eq("diagnosis", diagnosis);
  if (error) throw error;
  return new Set((data as CheckRow[]).filter((r) => r.completed).map((r) => checkKey(r.step_index, r.item_index)));
}

export async function setCheck(userId: string, diagnosis: string, stepIndex: number, itemIndex: number, completed: boolean) {
  const { error } = await supabase.from("roadmap_checks").upsert({
    user_id: userId, diagnosis, step_index: stepIndex, item_index: itemIndex, completed,
  }, { onConflict: "user_id,diagnosis,step_index,item_index" });
  if (error) throw error;
}

export async function getSaved(userId: string, diagnosis: string): Promise<SavedWithListing[]> {
  const { data, error } = await supabase.from("saved_resources")
    .select("diagnosis,step_index,item_index,category,listing_id")
    .eq("user_id", userId).eq("diagnosis", diagnosis);
  if (error) throw error;
  const rows = (data ?? []) as SavedRow[];
  if (!rows.length) return [];
  const ids = [...new Set(rows.map((r) => r.listing_id))];
  const result = await supabase.from("listings")
    .select("id,category,name,fields,tags,phone,video_url,url,dx")
    .in("id", ids);
  if (result.error) throw result.error;
  const byId = new Map((result.data ?? []).map((r) => [r.id, {
    id: r.id,
    category: r.category,
    name: r.name,
    fields: r.fields as [string, string][],
    tags: r.tags,
    phone: r.phone ?? undefined,
    video: r.video_url ?? undefined,
    url: r.url ?? undefined,
    dx: r.dx ?? undefined,
  } as Listing]));
  return rows.flatMap((r) => {
    const listing = byId.get(r.listing_id);
    return listing ? [{ ...r, listing }] : [];
  });
}

export async function saveResource(userId: string, diagnosis: string, stepIndex: number, itemIndex: number, category: string, listingId: string) {
  const { error } = await supabase.from("saved_resources").upsert({
    user_id: userId, diagnosis, step_index: stepIndex, item_index: itemIndex, category, listing_id: listingId,
  }, { onConflict: "user_id,diagnosis,step_index,item_index,listing_id" });
  if (error) throw error;
}

export async function removeResource(userId: string, diagnosis: string, stepIndex: number, itemIndex: number, listingId: string) {
  const { error } = await supabase.from("saved_resources").delete()
    .eq("user_id", userId).eq("diagnosis", diagnosis)
    .eq("step_index", stepIndex).eq("item_index", itemIndex).eq("listing_id", listingId);
  if (error) throw error;
}
