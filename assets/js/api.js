// KIB Portal — GAS API Layer
// GET  → fetch(GAS_URL + '?action=...')
// POST → fetch(GAS_URL, { method:'POST', headers:{'Content-Type':'text/plain'}, body: JSON.stringify({action, ...}) })

const API = (() => {
  function session() {
    try { return JSON.parse(localStorage.getItem(SES_KEY)); } catch(e) { return null; }
  }

  function token() {
    const s = session(); return s ? s.session_token : null;
  }

  async function get(action, params = {}) {
    const url = new URL(GAS_URL);
    url.searchParams.set('action', action);
    const t = token();
    if (t) url.searchParams.set('session_token', t);
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '')
        url.searchParams.set(k, params[k]);
    });
    const res  = await fetch(url.toString(), { redirect: 'follow' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'API error');
    return data.data;
  }

  async function post(action, body = {}) {
    const t = token();
    const payload = Object.assign({}, body, { action });
    if (t) payload.session_token = t;
    const res = await fetch(GAS_URL, {
      method:   'POST',
      redirect: 'follow',
      headers:  { 'Content-Type': 'text/plain' },
      body:     JSON.stringify(payload)
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { throw new Error('Invalid server response'); }
    if (!data.success) throw new Error(data.error?.message || 'API error');
    return data.data;
  }

  return { get, post };
})();
