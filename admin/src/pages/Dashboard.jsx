import React from 'react';
import { go } from '../nav';
import { ago, describe, minutes } from '../format';
import { Bars, Empty, Loading, Page, Stat, useLoad } from '../ui';

export default function Dashboard() {
  const { data, error, reload } = useLoad('/admin/stats');
  if (!data) return <Page title="Dashboard"><Loading error={error} onRetry={reload} /></Page>;
  const { students } = data;
  const dayLabel = (d) => new Date(d.day + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <Page title="Dashboard" sub={`Today in ${data.timeZone.replace('_', ' ')}`}>
      <div className="stats">
        <Stat label="Students" value={students.total} sub={students.disabled ? `${students.disabled} disabled` : 'all active'} onClick={() => go('students')} />
        <Stat label="Active today" value={students.activeToday} sub={`${students.activeWeek} this week`} onClick={() => go('activity')} />
        <Stat label="Time in app today" value={minutes(data.minutesToday)} sub={`${data.testsToday} test${data.testsToday === 1 ? '' : 's'} submitted`} />
        <Stat label="Open queries" value={data.openQueries} sub={data.openQueries ? 'waiting for a reply' : 'all answered'} onClick={() => go('queries')} />
      </div>
      <div className="stats">
        <Stat label="Logins to send" value={data.registrations.todo} sub={data.registrations.todo ? 'paid, waiting for account' : 'all sent'} onClick={() => go('registrations')} />
        <Stat label="Paid today" value={data.registrations.paidToday} onClick={() => go('registrations')} />
        <Stat label="Paid registrations" value={data.registrations.paid} />
        <Stat label="Revenue" value={`₹${data.registrations.revenue.toLocaleString('en-IN')}`} sub="before Razorpay fees" />
      </div>

      <div className="grid2">
        <section className="card">
          <h3>Active students · last 14 days</h3>
          <Bars data={data.daily} value={(d) => d.users} label={dayLabel} format={(v) => `${v} students`} />
        </section>
        <section className="card">
          <h3>Minutes in the app · last 14 days</h3>
          <Bars data={data.daily} value={(d) => d.minutes} label={dayLabel} format={minutes} />
        </section>
      </div>

      <section className="card">
        <div className="row between">
          <h3>Latest activity</h3>
          <a href="#/activity" className="link">See all</a>
        </div>
        {data.recent.length === 0 ? <Empty>No activity yet. It appears once students use the updated app.</Empty> : null}
        <ul className="feed">
          {data.recent.map((e) => (
            <li key={e.id}>
              <a href={`#/students/${e.userId}`} className="strong">{e.userName || e.userEmail}</a>
              <span>{describe(e)}</span>
              <span className="muted small nowrap">{ago(e.at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
