// lib/config.js
// Client-safe (aucun import Node, compatible Next.js static export)

// --- Base path global (ex: "/what") ---
export const BP = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');

// --- Détection de type d'URL ---
const isAbsoluteUrl = (u = '') => /^https?:\/\//i.test(u);
const ensureLeadingSlash = (p = '') => (p.startsWith('/') ? p : `/${p}`);

// --- Helper principal : withBase ---
// Ajoute le basePath une seule fois, jamais de double "/what/what/"
export function withBase(p = '') {
  if (!p) return BP || ''; // cas vide
  if (isAbsoluteUrl(p)) return p; // URLs externes inchangées
  if (p.startsWith('#') || p.startsWith('?')) return p; // ancres / queries inchangées

  const path = ensureLeadingSlash(p);
  if (!BP) return path; // pas de basePath défini

  // déjà préfixé ?
  if (path === BP || path.startsWith(`${BP}/`)) return path;

  // préfixe unique
  return `${BP}${path}`.replace(/\/{2,}/g, '/');
}

// --- Helper inverse : withoutBase ---
// Retire le basePath si présent (utile pour normaliser des props entrantes)
export function withoutBase(p = '') {
  if (!p || !BP || isAbsoluteUrl(p)) return p;
  const path = ensureLeadingSlash(p);
  return path.startsWith(`${BP}/`) ? path.slice(BP.length) : path;
}

