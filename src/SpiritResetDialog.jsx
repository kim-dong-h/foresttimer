import React, { useEffect, useRef } from 'react';
import { t } from './i18n.js';

export default function SpiritResetDialog({ language, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    cancelRef.current.focus();
    return () => {
      dialog.close();
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog ref={dialogRef} className="spirit-reset-dialog" aria-labelledby="spirit-reset-title" aria-describedby="spirit-reset-description" onCancel={event => { event.preventDefault(); onCancel(); }}>
      <h2 id="spirit-reset-title">{t(language, 'spiritResetTitle')}</h2>
      <p id="spirit-reset-description">{t(language, 'spiritResetDescription')}</p>
      <div className="spirit-reset-actions">
        <button ref={cancelRef} type="button" onClick={onCancel}>{t(language, 'cancel')}</button>
        <button type="button" onClick={onConfirm}>{t(language, 'spiritResetConfirm')}</button>
      </div>
    </dialog>
  );
}
