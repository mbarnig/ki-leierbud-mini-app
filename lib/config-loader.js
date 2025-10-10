// lib/config-loader.js
// ⚠️ À utiliser uniquement depuis getStaticProps / getStaticPaths (côté serveur Next)

export function loadConfig() {
  if (typeof window !== 'undefined') {
    throw new Error('loadConfig() must be called on the server only.');
  }

  // Nom du JSON de config (par défaut: config-v4.json)
  const name =
    process.env.CONFIG_FILE ||
    process.env.NEXT_PUBLIC_CONFIG_FILE ||
    'qubit-test.json';

  let cfg;
  try {
    // Laisse Next/Webpack embarquer le JSON au build
    // eslint-disable-next-line import/no-dynamic-require, global-require
    cfg = require(`../data/${name}`);
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    throw new Error(
      `Impossible de charger "../data/${name}". ` +
      `Définis CONFIG_FILE=qubit-test.json (ou autre). Erreur: ${msg}`
    );
  }

  // Validations minimales
  if (!cfg?.sequence || !Array.isArray(cfg.sequence?.posts)) {
    throw new Error(`Config invalide: "sequence.posts" manquant dans ${name}`);
  }
  if (!cfg?.color) {
    throw new Error(`Config invalide: bloc "color" manquant dans ${name}`);
  }

  return cfg;
}

