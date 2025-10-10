// utils/paths.js

// Ajoute automatiquement le basePath (utile pour les exports sous /qubit-test)
export const withBase = (p) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${p}`;

// S'assure qu'un chemin commence par "/"
export const ensureAbs = (p) => (p?.startsWith('/') ? p : `/${p}`);
