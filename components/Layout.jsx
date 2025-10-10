// components/Layout.jsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import Modal from '@/components/Modal';
import TabsInit from '@/components/TabsInit';
import { BP } from '@/lib/config'; 

// --- Helper anti double-préfixe ---
const isAbs = (u = '') => /^https?:\/\//i.test(u);
function withBaseSafe(path = '') {
  if (!path) return path;
  if (isAbs(path)) return path; // URL absolue inchangée
  if (!BP) return path.startsWith('/') ? path : `/${path}`;
  if (path === BP || path.startsWith(`${BP}/`)) return path; // déjà préfixé
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BP}${p}`.replace(/\/{2,}/g, '/');
}

// --- Helpers navigation (évite tout double prefix) ---
const getHref = (selector) => {
  const a = document.querySelector(selector);
  return a ? a.getAttribute('href') || a.href : null;
};
const goto = (selector) => {
  const url = getHref(selector);
  if (url) location.href = url; // utilise l'href déjà présent dans le DOM
};


export default function Layout({
  children,
  colors,
  links,
  logo,
  prevHref,
  nextHref,
  authorInitials,
  position,
  langOptions = [],
  currentLang,
}) {
  // Gestion du modal
  const [modal, setModal] = useState({ open: false, url: '', title: '' });
  const openModal = useCallback((url, title) => {
    if (!url) return;
    setModal({ open: true, url, title: title || 'Preview' });
  }, []);
  const closeModal = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

     const wb = (p) => (p ? withBaseSafe(p) : p);
     // ✅ Source du logo : prend celui passé en prop (déjà absolu ou relatif),
     // sinon fallback sur /assets/logo.svg. wb() gère basePath + anti double-préfixe.
     const logoSrc = wb(logo ?? '/assets/logo.svg');

  useEffect(() => {
    // ✅ Couleurs dynamiques (thème)
    const root = document.documentElement;
    if (colors?.header) root.style.setProperty('--color-header', colors.header);
    if (colors?.main) root.style.setProperty('--color-main', colors.main);
    if (colors?.footer) root.style.setProperty('--color-footer', colors.footer);
    if (colors?.headerFont) root.style.setProperty('--text-header', colors.headerFont);
    if (colors?.mainFont) root.style.setProperty('--text-main', colors.mainFont);
    if (colors?.footerFont) root.style.setProperty('--text-footer', colors.footerFont);

    // ✅ Gestes / clavier Prev / Next
    const main = document.getElementById('content');
    const prevEl = document.querySelector('.nav.prev');
    const nextEl = document.querySelector('.nav.next');
    const hasPrev = prevEl && getComputedStyle(prevEl).visibility !== 'hidden';
    const hasNext = nextEl && getComputedStyle(nextEl).visibility !== 'hidden';
    if (!main || (!hasPrev && !hasNext)) return;

    let sx = 0, sy = 0, sw = false;
    const onStart = (e) => {
      const t = e.changedTouches[0];
      sx = t.clientX;
      sy = t.clientY;
      sw = true;
    };
    const onEnd = (e) => {
      if (!sw) return;
      const t = e.changedTouches[0],
        dx = t.clientX - sx,
        dy = t.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dy) < 40) {
        if (dx < 0 && hasNext) goto('.nav.next');
        if (dx > 0 && hasPrev) goto('.nav.prev');
      }
      sw = false;
    };
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' && hasPrev) goto('.nav.prev');
      if (e.key === 'ArrowRight' && hasNext) goto('.nav.next');
    };

    main.classList.add('swipeable');
    main.addEventListener('touchstart', onStart, { passive: true });
    main.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('keydown', onKey);

    return () => {
      main.classList.remove('swipeable');
      main.removeEventListener('touchstart', onStart);
      main.removeEventListener('touchend', onEnd);
      document.removeEventListener('keydown', onKey);
    };
  }, [colors, prevHref, nextHref]);

  // ✅ Gestion des boutons / modales
  const onLogoClick = (e) => {
    if (!links?.about) return;
    e.preventDefault();
    openModal(links.about, 'About');
  };
  const onSearchClick = (e) => {
    if (!links?.search) return;
    e.preventDefault();
    openModal(links.search, 'Search');
  };
  const onLoginClick = (e) => {
    if (!links?.login) return;
    e.preventDefault();
    openModal(links.login, 'Login');
  };
  const onAuthorClick = (e) => {
    if (!links?.author) return;
    e.preventDefault();
    openModal(links.author, 'Authors');
  };
  const onHomeClick = (e) => {
    const url = links?.welcome || links?.dashboard;
    if (!url) return;
    e.preventDefault();
    openModal(url, 'Home');
  };
  const onTocClick = (e) => {
    if (!links?.dashboard) return;
    e.preventDefault();
    openModal(links.dashboard, 'TOC');
  };
  return (
    <>
      {/* Header */}
      <header className="site-header">
        <div className="left">
          {/* Logo cliquable */}
          <a href={links?.about || '#'} onClick={onLogoClick} aria-label="About">
            <img src={logoSrc} alt="KI-Léierbud" className="logo" />
          </a>
        </div>

        <div className="right">
          {/* Bouton Search */}
          <a className="btn" href={links?.search || '#'} onClick={onSearchClick}>
            Search
          </a>

          {/* Sélecteur langues */}
          <select
            id="lang-select"
            className="lang"
            value={(currentLang || '').toLowerCase()}
            onChange={(e) => {
              const desired = (e.target.value || '').toLowerCase();
              const map = new Map((langOptions || []).map((o) => [o.lc, o.id]));
              const id = map.get(desired);
              if (id) location.href = wb(`/${desired}/${id}/`);
            }}
            aria-label="Change language"
          >
            {(langOptions ?? []).map((opt) => (
              <option key={opt.lc} value={opt.lc}>
                {opt.lc.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Bouton Login */}
          <a className="btn" href={links?.login || '#'} onClick={onLoginClick}>
            Login
          </a>
        </div>
      </header>

      {/* Main */}
      <main id="content" className="site-main">
        {children}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="side">
          <a
            className="author"
            href={links?.author || '#'}
            onClick={onAuthorClick}
            title="Authors"
          >
            {authorInitials}
          </a>

          {/* ✅ Bouton PREV */}
          <a
            className="nav prev"
            style={{ visibility: prevHref ? 'visible' : 'hidden' }}
            href={wb(prevHref) || '#'}
            aria-label="Previous"
         >
            ⟵
          </a>
        </div>

        <div className="center">
          <a className="btn" href={links?.welcome || '#'} onClick={onHomeClick}>
            Home
          </a>
          <span className="pos">{position}</span>
          <a className="btn" href={links?.dashboard || '#'} onClick={onTocClick}>
            TOC
          </a>
        </div>

        <div className="side">
          {/* ✅ Bouton NEXT */}
          <a
            className="nav next"
            style={{ visibility: nextHref ? 'visible' : 'hidden' }}
            href={wb(nextHref) || '#'}
            aria-label="Next"
          >
            ⟶
          </a>
        </div>
      </footer>

      {/* Modal */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.title}
        url={modal.url}
      />

      {/* TabsInit */}
      <TabsInit />
    </>
  );
}
