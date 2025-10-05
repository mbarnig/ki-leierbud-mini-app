// components/Modal.jsx
'use client';
import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title = 'Preview', url }) {
  const ref = useRef(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open) {
      if (!dlg.open) dlg.showModal();
    } else {
      if (dlg.open) dlg.close();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Fermer si clic sur backdrop
  const onClick = (e) => {
    const dlg = ref.current;
    if (!dlg) return;
    const rect = dlg.getBoundingClientRect();
    const clickedInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!clickedInside) onClose?.();
  };

  return (
    <dialog ref={ref} className="modal" onClick={onClick} aria-label={title}>
      <div className="modal-card" role="document">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {url ? (
            <iframe
              src={url}
              title={title}
              loading="eager"
              referrerPolicy="no-referrer"
              onError={() => {}}
            />
          ) : (
            <p style={{margin:0}}>No URL provided.</p>
          )}
          <noscript>
            <p>JavaScript is required to view this content.</p>
          </noscript>
          <div className="modal-fallback">
            <a href={url || '#'} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}

