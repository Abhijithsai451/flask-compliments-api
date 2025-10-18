const spinBtn = document.getElementById('spin-btn');
const submitBtn = document.getElementById('submit-btn');
const inputEl = document.getElementById('compliment-input');
const msgEl = document.getElementById('msg');
const randomEl = document.getElementById('random-text');
const countEl = document.getElementById('count');
const recentList = document.getElementById('recent-list');

async function getJSON(url) {
  const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (r.status === 204) return null;
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

async function postJSON(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    try { const e = await r.json(); throw new Error(e.error || 'Request failed'); }
    catch { throw new Error('Request failed'); }
  }
  return await r.json();
}

async function del(url) {
  const r = await fetch(url, { method: 'DELETE' });
  if (!r.ok && r.status !== 204) throw new Error('Delete failed');
}

async function refresh() {
  const [stats, recent] = await Promise.all([
    getJSON('/api/stats'),
    getJSON('/api/compliments?limit=10')
  ]);
  countEl.textContent = stats.count;
  renderRecent(recent || []);
}

function renderRecent(items) {
  recentList.innerHTML = '';
  for (const c of items) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = c.text;
    span.className = 'text';
    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    btn.className = 'del';
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await del(`/api/compliments/${c.id}`);
        await refresh();
        msg('Deleted.');
      } catch (e) {
        msg('Delete failed.');
      } finally {
        btn.disabled = false;
      }
    });
    li.appendChild(span);
    li.appendChild(btn);
    recentList.appendChild(li);
  }
}

function msg(text) {
  msgEl.textContent = text;
}

spinBtn.addEventListener('click', async () => {
  spinBtn.disabled = true;
  msg('');
  try {
    const data = await getJSON('/api/compliments/random');
    if (!data) {
      randomEl.textContent = 'No compliments yet — add one below!';
    } else {
      randomEl.textContent = data.text;
    }
  } catch (e) {
    msg('Failed to fetch a compliment.');
  } finally {
    spinBtn.disabled = false;
  }
});

submitBtn.addEventListener('click', async () => {
  const text = (inputEl.value || '').trim();
  if (!text) { msg('Please enter something.'); return; }
  if (text.length > 140) { msg('Max 140 characters.'); return; }
  submitBtn.disabled = true;
  try {
    await postJSON('/api/compliments', { text });
    inputEl.value = '';
    msg('Thanks! Added.');
    await refresh();
  } catch (e) {
    msg(e.message || 'Failed to submit.');
  } finally {
    submitBtn.disabled = false;
  }
});

window.addEventListener('DOMContentLoaded', refresh);
