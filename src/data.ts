export type Item = { label: string; category: string };
export type Step = { title: string; color: string; ink?: string; items: Item[] };
export type Diagnosis = {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  resourcesUrl?: string;
  steps: Step[];
};

const BLUE = "#4FC3E3";
const RED = "#E8190C";
const ORANGE = "#FF7F27";
const YELLOW = "#F0E442";
const YELLOW_INK = "#B5A52A";
const PURPLE = "#A5439B";
const GREEN = "#00A66E";

const i = (label: string, category: string): Item => ({ label, category });

const neurologist = i("Neurologist", "neurologist");
const pcp = i("Primary Care Provider (PCP)", "pcp");
const research = [i("Clinical Trials", "trials"), i("Observational Studies", "studies"), i("Brain & Tissue Donation", "brain-donation")];
const poa = i("Power of Attorney", "legal");
const directive = i("Advance Directive", "legal");
const finance = i("Financial Planning", "financial");
const planning = [i("Adult daycare programs", "daycare"), i("Living arrangements", "living"), i("Review Advanced Care Directive", "legal")];

const parkinsonian = (id: string, name: string, abbr: string, color: string, resourcesUrl: string): Diagnosis => ({
  id,
  name,
  subtitle: "A Guide for Patients and Families",
  color,
  resourcesUrl,
  steps: [
    { title: "Build Your Care Team", color: BLUE, items: [neurologist, pcp, i("Supportive Care Medicine Team", "supportive-care")] },
    {
      title: "Understand and Manage Symptoms",
      color: RED,
      items: [i("Educational Information", "education"), i("Support Therapies", "therapy"), i("Preparing for Doctor Appointments", "appointments"), i("Adaptive Equipment", "equipment")],
    },
    {
      title: "Seek Out Support",
      color: ORANGE,
      items: [i(`${abbr} Support Groups`, "support-group"), i("Family, Friends, or Spiritual Support", "spiritual"), i("Caregiver Coaching Resources", "coaching"), i(`${abbr} Community Events`, "events")],
    },
    { title: "Plan for Future Care", color: YELLOW, ink: YELLOW_INK, items: [poa, finance, directive] },
    { title: "Explore Research Opportunities", color: PURPLE, items: research },
  ],
});

const ftd: Diagnosis = {
  id: "ftd",
  name: "Frontotemporal Dementia (FTD)",
  subtitle: "A Guide for Family and Care Partners",
  color: "#8556AE",
  steps: [
    { title: "Build Your Care Team", color: BLUE, items: [neurologist, pcp, i("Social Support", "social-worker")] },
    { title: "Establish or Update Legal Forms", color: RED, items: [poa, directive, finance] },
    {
      title: "Seek Out Support",
      color: ORANGE,
      items: [i("Family, friend, or mental health professional", "counselor"), i("Support groups, dementia specific community organizations, Caregiver Agencies", "support-group")],
    },
    { title: "Plan for Future Care Needs", color: YELLOW, ink: YELLOW_INK, items: planning },
    { title: "Explore Research Opportunities", color: PURPLE, items: research },
    { title: "Connect to Community Resources", color: GREEN, items: planning },
  ],
};

export const diagnoses: Diagnosis[] = [
  parkinsonian("cbs", "CBS/CBD", "CBS", "#6FE0FA", "https://linktr.ee/CBScedarssinai"),
  ftd,
  parkinsonian("msa", "MSA", "MSA", "#56A630", "https://linktr.ee/multiplesystematrophy"),
  parkinsonian("psp", "PSP", "PSP", "#FF6657", "https://linktr.ee/PSPCEDARSSINAI"),
];
