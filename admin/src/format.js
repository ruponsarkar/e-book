export function ago(d) {
  if (!d) return 'never';
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date(d);
}

export const date = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const dateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '';

export function minutes(m) {
  if (!m) return '0 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h${m % 60 ? ` ${m % 60} min` : ''}`;
}

export const duration = (sec) => minutes(Math.max(1, Math.round(sec / 60)));

export const shortTitle = (t) => String(t || '').split(/\s+[—–]\s+/)[0];

export const EVENT_LABEL = {
  login: 'Logged in',
  logout: 'Logged out',
  session: 'Used the app',
  read: 'Read',
  test_submit: 'Submitted a test',
  query: 'Sent a query',
  screenshot: 'Screenshot attempt',
};

export function describe(e) {
  const where = [e.section, e.book && !e.section ? e.book : ''].filter(Boolean).join('');
  switch (e.type) {
    case 'session':
      return `Used the app for ${duration(e.durationSec)}`;
    case 'read':
      return `Read ${where || 'a section'} for ${duration(e.durationSec)}`;
    case 'test_submit':
      return `Submitted ${where || 'a test'}${e.detail ? ` · ${e.detail}` : ''}`;
    case 'query':
      return `Sent a query: ${e.detail}`;
    case 'login':
      return `Logged in${e.detail ? ` on ${e.detail}` : ''}`;
    case 'screenshot':
      return `Tried a screenshot${where ? ` in ${where}` : ''}`;
    default:
      return EVENT_LABEL[e.type] || e.type;
  }
}
