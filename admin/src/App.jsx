import React, { useEffect, useState } from 'react';
import { api, auth, setSignedOutHandler } from './api';
import { ToastProvider } from './ui';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Student from './pages/Student';
import Books from './pages/Books';
import Book from './pages/Book';
import SectionEditor from './pages/SectionEditor';
import Queries from './pages/Queries';
import Activity from './pages/Activity';
import Notifications from './pages/Notifications';

// Hash routes: #/students/abc → ['students', 'abc']
function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

const NAV = [
  ['', 'Dashboard', '◧'],
  ['students', 'Students', '◎'],
  ['books', 'Books & questions', '▤'],
  ['queries', 'Queries', '✉'],
  ['activity', 'Activity', '◷'],
  ['notifications', 'Notifications', '◔'],
];

function Shell({ me, onLogout }) {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const [openQueries, setOpenQueries] = useState(0);
  const [section, id, sub, key] = route;

  useEffect(() => {
    api('/admin/queries?status=open')
      .then((d) => setOpenQueries(d.counts.open || 0))
      .catch(() => {});
  }, [section]);

  let page;
  switch (section) {
    case 'students':
      page = id ? <Student id={id} /> : <Students />;
      break;
    case 'books':
      if (id && sub === 'sections' && key) page = <SectionEditor slug={id} sectionKey={key} />;
      else if (id && sub === 'new') page = <SectionEditor slug={id} />;
      else page = id ? <Book slug={id} /> : <Books />;
      break;
    case 'queries':
      page = <Queries selected={id} />;
      break;
    case 'activity':
      page = <Activity />;
      break;
    case 'notifications':
      page = <Notifications />;
      break;
    default:
      page = <Dashboard />;
  }

  return (
    <div className="shell">
      <aside className={`side ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">EB</div>
          <div>
            <div className="brand-name">Exam Books</div>
            <div className="brand-sub">Admin</div>
          </div>
        </div>
        <nav>
          {NAV.map(([path, label, icon]) => (
            <a
              key={path}
              href={`#/${path}`}
              className={(section || '') === path ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon" aria-hidden>
                {icon}
              </span>
              {label}
              {path === 'queries' && openQueries ? <span className="nav-count">{openQueries}</span> : null}
            </a>
          ))}
        </nav>
        <div className="side-foot">
          <div className="muted small ellipsis">{me.email}</div>
          <button className="link" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>
      {open ? <div className="side-scrim" onClick={() => setOpen(false)} /> : null}
      <main className="main">
        <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Menu">
          ☰
        </button>
        {page}
      </main>
    </div>
  );
}

export default function App() {
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(Boolean(auth.token));
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setSignedOutHandler((message) => {
      setMe(null);
      setNotice(message || 'Please sign in again.');
    });
    if (!auth.token) return;
    api('/auth/me')
      .then((d) => setMe(d.user))
      .catch(() => auth.set(null))
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    auth.set(null);
    setMe(null);
  };

  return (
    <ToastProvider>
      {checking ? (
        <div className="center-screen">
          <div className="spinner" />
        </div>
      ) : me ? (
        <Shell me={me} onLogout={logout} />
      ) : (
        <Login
          notice={notice}
          onDone={(user) => {
            setNotice('');
            setMe(user);
          }}
        />
      )}
    </ToastProvider>
  );
}
