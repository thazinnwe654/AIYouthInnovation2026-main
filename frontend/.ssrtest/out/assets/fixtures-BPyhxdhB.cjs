'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

// Fixtures captured from the live API so the SSR harness renders the real shapes.

const base = 'http://127.0.0.1:8022/api/v1';

async function login(email, password) {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }).toString(),
  });
  const data = await res.json();
  return data.access_token
}

async function loadFixtures(email = 'judge1@sti.edu.mm', password = 'judge123') {
  const token = await login(email, password);
  const h = { Authorization: `Bearer ${token}` };
  const get = async (p) => {
    const r = await fetch(`${base}${p}`, { headers: h });
    if (!r.ok) throw new Error(`${p} -> ${r.status} ${await r.text()}`)
    return r.json()
  };
  return {
    assignments: await get('/judges/my-assignments'),
    criteria: await get('/judges/evaluations/criteria'),
    submittedTeams: await get('/judges/submitted-teams'),
    submissions: await get('/judges/submissions'),
    evaluations: await get('/judges/evaluations'),
  }
}

exports.loadFixtures = loadFixtures;
