import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveTreatmentImage, resolveTeamImage } from "./assets";

export type Treatment = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  price: string;
  priceOptions: { label: string; price: string }[];
  duration: string;
  sessions: string;
  benefits: string[];
  whatToExpect: string;
  image: string;
  image_url: string | null;
  beforeAfter: { before: string; after: string; caption?: string }[];
  faqs: { question: string; answer: string }[];
  sort_order: number;
  is_active: boolean;
};


export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  credentials: string;
  tags: string[];
  icon: string;
  image: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

function mapTreatment(r: any): Treatment {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    description: r.description ?? "",
    longDescription: r.long_description ?? "",
    price: r.price ?? "",
    priceOptions: Array.isArray(r.price_options) ? r.price_options : [],
    duration: r.duration ?? "",
    sessions: r.sessions ?? "",
    benefits: r.benefits ?? [],
    whatToExpect: r.what_to_expect ?? "",
    image: resolveTreatmentImage(r.slug, r.image_url),
    image_url: r.image_url ?? null,
    beforeAfter: Array.isArray(r.before_after) ? r.before_after : [],
    sort_order: r.sort_order ?? 0,

    is_active: r.is_active,
  };
}

function mapTeam(r: any): TeamMember {
  return {
    id: r.id,
    name: r.name,
    role: r.role ?? "",
    bio: r.bio ?? "",
    credentials: r.credentials ?? "",
    tags: r.tags ?? [],
    icon: r.icon ?? "Stethoscope",
    image: resolveTeamImage(r.name, r.image_url),
    image_url: r.image_url ?? null,
    sort_order: r.sort_order ?? 0,
    is_active: r.is_active,
  };
}

export async function fetchTreatments(): Promise<Treatment[]> {
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapTreatment);
}

export async function fetchAllTreatments(): Promise<Treatment[]> {
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapTreatment);
}

export async function fetchTreatmentBySlug(slug: string): Promise<Treatment | null> {
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapTreatment(data) : null;
}

export async function fetchTeam(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapTeam);
}

export async function fetchAllTeam(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapTeam);
}

export async function fetchSiteContent(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from("site_content")
    .select("key,value");
  if (error) throw error;
  const map: Record<string, any> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
}

export function useTreatments() {
  return useQuery({ queryKey: ["treatments"], queryFn: fetchTreatments });
}

export function useTeam() {
  return useQuery({ queryKey: ["team"], queryFn: fetchTeam });
}

export function useSiteContent() {
  return useQuery({ queryKey: ["site_content"], queryFn: fetchSiteContent });
}

export type DbCondition = {
  id: string;
  area: "face" | "body" | "skin";
  name: string;
  description: string;
  treatments: string[];
  sort_order: number;
  is_active: boolean;
};

export async function fetchConditionsByArea(area: "face" | "body" | "skin"): Promise<DbCondition[]> {
  const { data, error } = await supabase
    .from("conditions")
    .select("*")
    .eq("area", area)
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as DbCondition[];
}

export function useConditionsByArea(area: "face" | "body" | "skin") {
  return useQuery({ queryKey: ["conditions", area], queryFn: () => fetchConditionsByArea(area) });
}

export type DbFaq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

export async function fetchFaqs(): Promise<DbFaq[]> {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as DbFaq[];
}

export function useFaqs() {
  return useQuery({ queryKey: ["faqs"], queryFn: fetchFaqs });
}

// Helper for synchronous string with fallback
export function getString(content: Record<string, any> | undefined, key: string, fallback: string): string {
  const v = content?.[key];
  return typeof v === "string" ? v : fallback;
}
export function getArray(content: Record<string, any> | undefined, key: string, fallback: string[]): string[] {
  const v = content?.[key];
  return Array.isArray(v) ? v : fallback;
}

export const treatmentCategories = [
  "All",
  "Consultation",
  "HydraFacial",
  "Injectables",
  "Skin Rejuvenation",
  "PRP",
  "Hay Fever Treatment",
  "Wellness",
];
