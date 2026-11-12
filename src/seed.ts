import { diagnoses } from "./data";

export type Listing = {
  id: string;
  category: string;
  name: string;
  fields: [string, string][];
  tags: string[];
  phone?: string;
  video?: string;
  url?: string;
  dx?: string[];
};

let n = 0;
const l = (
  category: string,
  name: string,
  fields: Record<string, string>,
  tags: string[] = ["English"],
  o: { dx?: string[]; video?: boolean; call?: boolean; url?: string } = {}
): Listing => {
  const id = `${category}-${++n}`;
  return {
    id,
    category,
    name,
    fields: Object.entries(fields),
    tags,
    phone: o.call ? `(310) 555-01${String(n).padStart(2, "0")}` : undefined,
    video: o.video ? `https://example.com/visit/${id}` : undefined,
    url: o.url,
    dx: o.dx,
  };
};

const doc = (category: string, name: string, title: string, specialties: string, tags: string[]) =>
  l(category, name, { Title: title, Specialties: specialties }, tags, { video: true, call: true });

const edu = (name: string, source: string, url: string, dx: string) =>
  l("education", name, { Source: source, Type: "Patient education" }, ["English"], { dx: [dx], url });

const ev = (dx: string, name: string) => l("events", name, { Where: "Los Angeles, CA", When: "Spring" }, [], { dx: [dx] });

const CT = "https://clinicaltrials.gov";

export const seed: Listing[] = [
  doc("neurologist", "Dr. Maya Patel", "MD or DO Doctor", "Movement Disorders", ["English", "Hindi"]),
  doc("neurologist", "Dr. Samuel Okafor", "MD or DO Doctor", "Behavioral Neurology", ["English"]),
  doc("neurologist", "Dr. Elena Rossi", "MD or DO Doctor", "Neuro-ophthalmology", ["English", "Italian"]),
  doc("pcp", "Dr. Naomi Hart", "MD or DO Doctor", "Internal Medicine", ["English", "French"]),
  doc("pcp", "Dr. Kevin Tran", "MD or DO Doctor", "Family Medicine", ["English", "Vietnamese"]),
  doc("pcp", "Dr. Carlos Mendes", "MD or DO Doctor", "Family Medicine", ["English", "Spanish"]),
  doc("supportive-care", "Dr. Hannah Cole", "MD or DO Doctor", "Palliative Medicine", ["English"]),
  doc("supportive-care", "Dr. Luis Ortega", "MD or DO Doctor", "Supportive Care", ["English", "Spanish"]),
  doc("social-worker", "Priya Nair", "Licensed Clinical Social Worker", "Dementia care navigation", ["English", "Hindi"]),
  doc("social-worker", "Tom Becker", "Licensed Clinical Social Worker", "Caregiver support", ["English"]),
  doc("counselor", "Dr. Alicia Grant", "Psychologist", "Caregiver stress", ["English"]),
  doc("counselor", "Jonah Weiss", "Marriage & Family Therapist", "Family counseling", ["English", "Hebrew"]),
  doc("spiritual", "Ruth Adams", "Chaplain", "Interfaith spiritual care", ["English"]),
  doc("spiritual", "Daniel Reyes", "Chaplain", "Grief and spiritual support", ["English", "Spanish"]),
  doc("therapy", "Alma Chen", "Physical Therapist", "Gait and balance", ["English", "Mandarin"]),
  doc("therapy", "Ben Ortiz", "Occupational Therapist", "Daily living skills", ["English", "Spanish"]),
  doc("therapy", "Sara Lind", "Speech-Language Pathologist", "Speech and swallowing", ["English"]),

  edu("About Corticobasal Syndrome (CBS/CBD)", "CurePSP", "https://www.curepsp.org", "cbs"),
  edu("About Progressive Supranuclear Palsy (PSP)", "CurePSP", "https://www.curepsp.org", "psp"),
  edu("About Frontotemporal Degeneration", "Association for Frontotemporal Degeneration", "https://www.theaftd.org", "ftd"),
  edu("About Multiple System Atrophy", "MSA Coalition", "https://www.multiplesystematrophy.org", "msa"),
  ...diagnoses
    .filter((d) => d.resourcesUrl)
    .map((d) => l("education", "Cedars-Sinai Resource Library", { Source: "Cedars-Sinai", Type: "Curated resource links" }, ["English"], { dx: [d.id], url: d.resourcesUrl })),

  l("appointments", "Before the visit", { Bring: "Medication list, insurance card, recent test results", "Write down": "New symptoms, falls, and questions" }, []),
  l("appointments", "Questions to ask", { Ask: "What has changed since the last visit?", "Then ask": "Which symptoms can be treated?", Finally: "Who else should join the care team?" }, []),
  l("appointments", "After the visit", { Request: "A written summary of the visit", Share: "Updates with family and care partners" }, []),

  l("equipment", "Rolling walker", { "Helps with": "Balance and walking" }, []),
  l("equipment", "Weighted or built-up utensils", { "Helps with": "Tremor and grip" }, []),
  l("equipment", "Shower chair and grab bars", { "Helps with": "Bathroom safety" }, []),

  l("support-group", "CBS/CBD Connection Group", { Meets: "First Tuesday, online" }, ["English"], { dx: ["cbs"], call: true }),
  l("support-group", "MSA Circle", { Meets: "Second Thursday, online" }, ["English"], { dx: ["msa"], call: true }),
  l("support-group", "PSP Family Group", { Meets: "Third Monday, in person" }, ["English"], { dx: ["psp"], call: true }),
  l("support-group", "Frontotemporal Care Partners", { Meets: "Weekly, online" }, ["English"], { dx: ["ftd"], call: true }),
  l("support-group", "Dementia Resource Center", { Type: "Community organization" }, ["English", "Spanish"], { dx: ["ftd"], call: true }),
  l("support-group", "LA Caregiver Agency", { Type: "Caregiver agency" }, ["English"], { dx: ["ftd"], call: true }),
  l("coaching", "Care Partner Coaching", { Format: "One-on-one video sessions" }, ["English"], { call: true }),
  l("coaching", "Caregiver Skills Workshop", { Format: "Monthly workshop" }, ["English"], { call: true }),

  ev("cbs", "CBS/CBD Community Day"),
  ev("msa", "MSA Awareness Walk"),
  ev("psp", "PSP Awareness Walk"),
  ev("ftd", "FTD Awareness Walk"),

  doc("legal", "Harper & Lane Elder Law", "Attorney", "Power of attorney, advance directives", ["English", "Spanish"]),
  doc("legal", "Nguyen Estate Planning", "Attorney", "Wills, trusts, advance directives", ["English", "Vietnamese"]),
  doc("financial", "Brightpath Financial Planning", "Certified Financial Planner", "Long-term care planning", ["English"]),
  doc("financial", "Sunrise Benefits Advisors", "Benefits Advisor", "Medicare and disability benefits", ["English", "Spanish"]),

  l("trials", "Tau Antibody Study", { Phase: "Phase 2", Site: "Los Angeles, CA" }, [], { dx: ["cbs", "psp"], url: CT }),
  l("trials", "Alpha-Synuclein Study", { Phase: "Phase 2", Site: "Los Angeles, CA" }, [], { dx: ["msa"], url: CT }),
  l("trials", "FTD Therapy Study", { Phase: "Phase 1", Site: "Los Angeles, CA" }, [], { dx: ["ftd"], url: CT }),
  l("studies", "Atypical Parkinsonism Registry", { Commitment: "Yearly visit" }, [], { url: CT }),
  l("studies", "Frontotemporal Natural History Study", { Commitment: "Visit every 6 months" }, [], { dx: ["ftd"], url: CT }),
  l("brain-donation", "Brain & Tissue Donation Program", { Contact: "Research coordinator" }, ["English"], { call: true }),

  l("daycare", "Sunrise Adult Day Program", { Hours: "Mon–Fri, 8am–4pm" }, ["English"], { call: true }),
  l("daycare", "Westside Memory Day Center", { Hours: "Mon–Sat, 9am–3pm" }, ["English", "Spanish"], { call: true }),
  l("living", "Maple Grove Memory Care", { Type: "Memory care" }, ["English"], { call: true }),
  l("living", "Cedar Court Assisted Living", { Type: "Assisted living" }, ["English"], { call: true }),
];
