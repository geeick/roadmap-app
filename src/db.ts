import { supabase } from "./supabase";
import type { Listing } from "./seed";

type Row = {
  id: string;
  category: string;
  name: string;
  fields: [string, string][];
  tags: string[];
  phone: string | null;
  video_url: string | null;
  url: string | null;
  dx: string[] | null;
};

const toListing = (r: Row): Listing => ({
  id: r.id,
  category: r.category,
  name: r.name,
  fields: r.fields,
  tags: r.tags,
  phone: r.phone ?? undefined,
  video: r.video_url ?? undefined,
  url: r.url ?? undefined,
  dx: r.dx ?? undefined,
});

export async function getListings(category: string, diagnosis: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("category", category)
    .or(`dx.is.null,dx.cs.{${diagnosis}}`);
  if (error) {
    console.error(error);
    return [];
  }
  return (data as Row[]).map(toListing);
}

export async function addListing(l: Omit<Listing, "id">): Promise<void> {
  const { error } = await supabase.from("listings").insert({
    category: l.category,
    name: l.name,
    fields: l.fields,
    tags: l.tags,
    phone: l.phone,
    video_url: l.video,
    url: l.url,
    dx: l.dx,
  });
  if (error) throw error;
}
