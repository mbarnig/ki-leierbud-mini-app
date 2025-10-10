// pages/[lang]/[slug].js
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { withBase } from '@/lib/config';
import { loadConfig } from '@/lib/config-loader';
import Layout from '@/components/Layout';

const LOGO_BY_LANG = {
  en: '/assets/logo-en.svg',
  fr: '/assets/logo-fr.svg',
  de: '/assets/logo-de.svg',
  pt: '/assets/logo-pt.svg',
  lb: '/assets/logo-lb.svg',
};

const ORDER = ['en', 'fr', 'de', 'pt', 'lb'];


function bestForRow(row, preferredLc) {
  if (row[preferredLc]) return { lc: preferredLc, id: String(row[preferredLc]) };
  for (const lc of ORDER) if (row[lc]) return { lc, id: String(row[lc]) };
  return null;
}
function findRowById(cfg, idStr) {
  for (let i = 0; i < cfg.sequence.posts.length; i++) {
    const row = cfg.sequence.posts[i];
    for (const lc of ORDER) {
      if (row[lc] && String(row[lc]) === idStr) return { row, index: i };
    }
  }
  return { row: null, index: -1 };
}

export async function getStaticPaths() {
  const cfg = loadConfig();
  const paths = [];
  for (const row of cfg.sequence.posts) {
    for (const lc of ORDER) {
      if (row[lc]) paths.push({ params: { lang: lc, slug: String(row[lc]) } });
    }
  }
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const cfg = loadConfig();
  const langParam = (params?.lang || '').toLowerCase();
  const slug = String(params?.slug || '');

  const { row: currentRow, index: rowIndex } = findRowById(cfg, slug);
  if (!currentRow) return { notFound: true };

  const actual = bestForRow(currentRow, langParam);
  const actualLang = actual.lc;
  const idStr = actual.id;

  // Récupération WordPress (titre + HTML)
  let title = '';
  let content = '';
  let authorInitials = 'AU';
  try {
    const api = `https://admin.ki-leierbud.lu/wp-json/wp/v2/posts/${idStr}?_embed=1`;
    const res = await fetch(api, { headers: { 'User-Agent': 'json2html-viewer/1.0' } });
    if (res.ok) {
      const data = await res.json();
      title = data?.title?.rendered || `Post ${idStr}`;
      content = data?.content?.rendered || '<p>(empty)</p>';

      const name = data?._embedded?.author?.[0]?.name || data?.yoast_head_json?.author || '';
      if (name) {
        const parts = name.split(/\s+/).filter(Boolean);
        authorInitials = parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || 'AU';
      }
    } else {
      title = `Post ${idStr}`;
      content = `<p><em>Content temporarily unavailable (HTTP ${res.status}).</em></p>`;
    }
  } catch {
    title = `Post ${idStr}`;
    content = `<p><em>Content temporarily unavailable.</em></p>`;
  }

  // Couleurs + couleurs de police depuis config-v4.json
  const colors = {
    header: cfg.color?.header || '#1F1F1F',
    main: cfg.color?.main || '#2E2E2E',
    footer: cfg.color?.footer || '#1A1A1A',
    headerFont: cfg.color?.['header-font'] || '#FFFFFF',
    mainFont: cfg.color?.['main-font'] || '#FFFFFF',
    footerFont: cfg.color?.['footer-font'] || '#FFFFFF',
  };

  // Liens racine (ne PAS prefixer basePath sur URLs http(s) ; seulement assets internes)
  const links = {
    login: cfg.login,
    about: cfg.about,
    welcome: cfg.welcome || cfg.landing,
    search: cfg.search,
    landing: cfg.landing,
    dashboard: cfg.dashboard,
    faq: cfg.faq,
    user: cfg.user,
    author: cfg.author,
  };

  // Assets internes (logo/favicon) → prefixer basePath si chemin commence par '/'
  const logo = withBase('/assets/logo.svg');

  const favicon = cfg.favicon
    ? (cfg.favicon.startsWith('/') ? withBase(cfg.favicon) : cfg.favicon)
    : withBase('/assets/favicon.ico');

  // Prev/Next + position (total constant)
  const total = cfg.sequence.posts.length;
  const pos = `${rowIndex + 1}/${total}`;
  const prevRow = rowIndex > 0 ? cfg.sequence.posts[rowIndex - 1] : null;
  const nextRow = rowIndex < total - 1 ? cfg.sequence.posts[rowIndex + 1] : null;
  const prevPick = prevRow ? bestForRow(prevRow, actualLang) : null;
  const nextPick = nextRow ? bestForRow(nextRow, actualLang) : null;

  const prevHref = prevPick ? withBase(`/${prevPick.lc}/${prevPick.id}/`) : null;
  const nextHref = nextPick ? withBase(`/${nextPick.lc}/${nextPick.id}/`) : null;

  // Langues disponibles pour cette row
  const langOptions = ORDER.filter(lc => !!currentRow[lc]).map(lc => ({
    lc, id: String(currentRow[lc]),
  }));

  return {
    props: {
      title,
      content,
      colors,
      links,
      logo,
      favicon,
      lang: actualLang,
      langOptions,
      prevHref,
      nextHref,
      position: pos,
      authorInitials,
    },
  };
}

function ArticleContent({ html }) {
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}


export default function PostPage(props) {
  const {
    title, content, colors, links, logo, favicon,
    lang, langOptions, prevHref, nextHref, position, authorInitials,
  } = props;

  return (
    <>
      <Head>
        <title>{title || 'Article'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {favicon && <link rel="icon" href={favicon} />}
        <style>{`
          :root{
            --color-header:${colors.header};
            --color-main:${colors.main};
            --color-footer:${colors.footer};
            --text-header:${colors.headerFont};
            --text-main:${colors.mainFont};
            --text-footer:${colors.footerFont};
          }
        `}</style>
      </Head>

      <div className="page-shell">
        <Layout
          colors={colors}
          links={links}
          logo={logo}
          prevHref={prevHref}
          nextHref={nextHref}
          authorInitials={authorInitials}
          position={position}
          langOptions={langOptions}
          currentLang={lang}
        >
          <ArticleContent html={content} />
        </Layout>
      </div>
    </>
  );
}

