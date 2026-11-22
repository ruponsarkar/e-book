import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { dateTime, describe, EVENT_LABEL } from '../format';
import { Badge, Empty, Loading, Page, useLoad } from '../ui';

const KIND = { login: 'green', logout: 'grey', session: 'blue', read: 'gold', test_submit: 'blue', query: 'red', screenshot: 'red' };

export default function Activity() {
  const users = useLoad('/admin/users');
  const [type, setType] = useState('');
  const [userId, setUserId] = useState('');
  const [events, setEvents] = useState(null);
  const [more, setMore] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (before) => {
    setLoading(true);
    const q = new URLSearchParams({ limit: '100' });
    if (type) q.set('type', type);
    if (userId) q.set('userId', userId);
    if (before) q.set('before', before);
    try {
      const d = await api(`/admin/activity?${q}`);
      setEvents((e) => (before ? [...(e || []), ...d.events] : d.events));
      setMore(d.more);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEvents(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, userId]);

  return (
    <Page title="Activity" sub="Logins, time in the app, reading, tests and queries. Times in the app are sent when the phone is online.">
      <div className="toolbar">
        <div className="row gap wrap">
          <select value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">All students</option>
            {(users.data?.users || []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ? `${u.name} (${u.email})` : u.email}
              </option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Everything</option>
            {Object.entries(EVENT_LABEL).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <button className="btn" onClick={() => load()} disabled={loading}>Refresh</button>
      </div>

      {!events ? (
        <Loading error={error} onRetry={() => load()} />
      ) : events.length === 0 ? (
        <Empty>No activity matches.</Empty>
      ) : (
        <div className="card flush">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Student</th>
                <th>Type</th>
                <th>What</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="nowrap small">{dateTime(e.at)}</td>
                  <td>
                    <a href={`#/students/${e.userId}`}>{e.userName || e.userEmail}</a>
                  </td>
                  <td>
                    <Badge kind={KIND[e.type]}>{EVENT_LABEL[e.type] || e.type}</Badge>
                  </td>
                  <td>{describe(e)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {more ? (
        <div className="center mt">
          <button className="btn" disabled={loading} onClick={() => load(events[events.length - 1].at)}>
            {loading ? 'Loading…' : 'Load older'}
          </button>
        </div>
      ) : null}
    </Page>
  );
}
