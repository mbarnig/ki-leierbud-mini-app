// lib/wp.js
const BASE = 'https://admin.ki-leierbud.lu/wp-json/wp/v2';

// Timeout/retries configurables via .env.local (facultatif)
const TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_WP_TIMEOUT_MS || 25000);
const RETRIES    = Number(process.env.NEXT_PUBLIC_WP_RETRIES || 2);

async function fetchWithTimeout(url, { timeout = TIMEOUT_MS, retries = RETRIES, ...init } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const r = await fetch(url, {
        ...init,
        signal: ctrl.signal,
        headers: {
          'User-Agent': 'visionaries-static',
          'Accept': 'application/json',
          ...(init?.headers || {})
        },
        cache: 'no-store'
      });
      clearTimeout(timer);
      return r;
    } catch (e) {
      clearTimeout(timer);
      if (attempt === retries) throw e;
      await new Promise(res => setTimeout(res, 500 * (attempt + 1)));
    }
  }
}

export async function fetchPost(id) {
  const r = await fetchWithTimeout(`${BASE}/posts/${id}?_embed=1`);
  if (!r.ok) throw new Error(`fetchPost(${id}) HTTP ${r.status}`);
  return await r.json();
}

// Nommage explicite : auteur (writer), bien que l'endpoint WP soit /users/{id}
export async function fetchAuthor(id) {
  const r = await fetchWithTimeout(`${BASE}/users/${id}`);
  if (!r.ok) return null;
  return await r.json();
}

export function postTitle(post) {
  if (!post) return 'Sans titre';
  if (post.title?.rendered) return post.title.rendered;
  if (post.title?.raw) return post.title.raw;
  return 'Sans titre';
}

export function postSlug(post) {
  return post?.slug ? post.slug : String(post?.id || '').trim();
}

