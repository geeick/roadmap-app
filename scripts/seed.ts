import { createClient } from "@supabase/supabase-js";
import { seed } from "../src/seed";

const db = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const { error } = await db.from("listings").insert(
  seed.map((l) => ({
    category: l.category,
    name: l.name,
    fields: l.fields,
    tags: l.tags,
    phone: l.phone,
    video_url: l.video,
    url: l.url,
    dx: l.dx,
    approved: true,
  }))
);
if (error) throw error;
console.log(`Inserted ${seed.length} listings`);
