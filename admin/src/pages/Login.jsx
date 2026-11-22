import React, { useState } from 'react';
import { api, auth } from '../api';

export default function Login({ onDone, notice }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const d = await api('/auth/admin-login', { method: 'POST', body: { email, password } });
      auth.set(d.token);
      onDone(d.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center-screen login-bg">
      <form className="card login" onSubmit={submit}>
        <div className="brand big">
          <div className="brand-mark">EB</div>
          <div>
            <div className="brand-name">Exam Books</div>
            <div className="brand-sub">Admin panel</div>
          </div>
        </div>
        {notice ? <p className="note">{notice}</p> : null}
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error ? <p className="err">{error}</p> : null}
        <button className="btn primary block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="muted small center">Admin accounts only. Signing in here doesn’t sign you out of the app.</p>
      </form>
    </div>
  );
}
