// Tracked search phrases for the admin ranking panel. Derived from the /learn
// content architecture (lib/learn.ts) so there is ONE source of truth: every
// page we publish is a phrase we watch, and adding a /learn page automatically
// adds it here. No second hardcoded keyword list to drift.
//
// Each page's slug is already the clean phrase seed ("doordash-fees" ->
// "doordash fees", "toast-alternative" -> "toast alternative").

import { LEARN_PAGES } from "./learn";

export type TrackedQuery = {
  phrase: string; // the watched phrase, e.g. "doordash fees"
  slug: string; // the /learn page it maps to
  title: string; // human label for the panel
};

// Short function words dropped from token matching so a phrase like "getting off
// the delivery apps" matches on its meaningful words, not "the"/"off".
const STOP = new Set(["a", "an", "the", "for", "to", "of", "and", "&", "your", "you"]);

function slugToPhrase(slug: string): string {
  return slug.replace(/-/g, " ").trim();
}

export function trackedQueries(): TrackedQuery[] {
  return LEARN_PAGES.map((p) => ({
    phrase: slugToPhrase(p.slug),
    slug: p.slug,
    title: p.title,
  }));
}

// Significant (non-stopword) tokens of a phrase.
export function phraseTokens(phrase: string): string[] {
  return phrase
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));
}

// A real Search Console query counts toward a tracked phrase when it contains
// all of the phrase's significant tokens (order independent). This groups the
// long-tail variants people actually type ("how much are doordash fees 2026")
// under the topic we publish for ("doordash fees").
export function queryMatchesPhrase(query: string, phrase: string): boolean {
  const q = query.toLowerCase();
  return phraseTokens(phrase).every((t) => q.includes(t));
}
