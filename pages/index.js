// pages/index.js
import Head from 'next/head';
import { loadConfig } from '@/lib/config-loader';
import { withBase } from '@/lib/config';

const LANGS = ['en','fr','de','pt','lb'];

export async function getStaticProps() {
  const cfg = loadConfig();
  let lang = 'en', id = null;
  outer: for (const row of cfg.sequence.posts) {
    for (const lc of LANGS) if (row[lc]) { lang = lc; id = row[lc]; break outer; }
  }
  const target = id ? withBase(`/${lang}/${id}/`) : withBase('/404/');
  return { props: { target } };
}

export default function Home({ target }) {
  return (
    <>
      <Head>
        <title>Redirect…</title>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
      </Head>
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(target)});` }} />
      <p>Redirecting to <a href={target}>{target}</a>…</p>
    </>
  );
}

