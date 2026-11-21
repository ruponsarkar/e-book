// Checks a running server: npm run health            (uses http://localhost:PORT)
//                         npm run health -- https://api.example.com
require('dotenv').config();

const base = (process.argv[2] || `http://localhost:${process.env.PORT || 4000}`).replace(/\/+$/, '');

(async () => {
  const t0 = Date.now();
  try {
    const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(10000) });
    const body = await res.json().catch(() => ({}));
    const ms = Date.now() - t0;
    if (res.ok && body.ok) {
      console.log(`✔ ${base} is working (${ms} ms)`);
      if (body.database) {
        console.log(`  version ${body.version} · up ${body.uptimeSeconds}s · database ${body.database.status} (${body.database.pingMs} ms)`);
      } else {
        console.log('  (old server code: restart it to see database status)');
      }
      process.exit(0);
    }
    console.error(`✘ ${base} answered ${res.status}: database ${body.database?.status || 'unknown'}`);
  } catch (e) {
    console.error(`✘ Can't reach ${base}: ${e.cause?.code || e.name || e.message}`);
    console.error('  Is the server running? Start it with: npm run dev');
  }
  process.exit(1);
})();
