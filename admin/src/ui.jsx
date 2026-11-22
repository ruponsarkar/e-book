import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

// ---- data loading --------------------------------------------------------------

export function useLoad(path, deps = []) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      setState({ data: await api(path), error: '', loading: false });
    } catch (e) {
      setState((s) => ({ ...s, error: e.message, loading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);
  useEffect(() => {
    load();
  }, [load]);
  return { ...state, reload: load, setData: (fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })) };
}

// ---- toasts --------------------------------------------------------------------

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((text, kind = 'ok') => {
    const id = Math.random();
    setItems((x) => [...x, { id, text, kind }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---- building blocks -------------------------------------------------------------

export function Page({ title, sub, actions, children }) {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{title}</h1>
          {sub ? <p className="muted">{sub}</p> : null}
        </div>
        {actions ? <div className="row gap">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function Loading({ error, onRetry }) {
  if (error) {
    return (
      <div className="empty">
        <p className="err">{error}</p>
        {onRetry ? (
          <button className="btn" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    );
  }
  return <div className="empty"><div className="spinner" /></div>;
}

export function Empty({ children }) {
  return <div className="empty muted">{children}</div>;
}

export function Badge({ kind = 'grey', children }) {
  return <span className={`badge ${kind}`}>{children}</span>;
}

export function Stat({ label, value, sub, onClick }) {
  return (
    <div className={`card stat ${onClick ? 'click' : ''}`} onClick={onClick}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub ? <div className="stat-sub muted">{sub}</div> : null}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint muted">{hint}</span> : null}
    </label>
  );
}

// Simple vertical bars, e.g. minutes per day.
export function Bars({ data, value, label, format = (v) => v, height = 140 }) {
  const max = Math.max(1, ...data.map(value));
  return (
    <div className="bars" style={{ height }}>
      {data.map((d, i) => {
        const v = value(d);
        return (
          <div key={i} className="bar-col" title={`${label(d)}: ${format(v)}`}>
            <div className="bar-track">
              <div className="bar" style={{ height: `${(v / max) * 100}%` }} />
            </div>
            <div className="bar-x">{label(d)}</div>
          </div>
        );
      })}
    </div>
  );
}

// Runs an async action with a busy state and a toast on error.
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async (fn, success) => {
      setBusy(true);
      try {
        const r = await fn();
        if (success) toast(success);
        return r;
      } catch (e) {
        toast(e.message, 'err');
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [toast]
  );
  return [run, busy];
}
