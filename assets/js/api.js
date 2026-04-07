// KIB Portal — GAS API Layer
window.API = {
  _session: function() {
    try { return JSON.parse(localStorage.getItem(window.SES_KEY)); } catch(e) { return null; }
  },
  _token: function() {
    var s = this._session(); return s ? s.session_token : null;
  },
  get: async function(action, params) {
    var url = new URL(window.GAS_URL);
    url.searchParams.set('action', action);
    var t = this._token();
    if (t) url.searchParams.set('session_token', t);
    Object.keys(params || {}).forEach(function(k) {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '')
        url.searchParams.set(k, params[k]);
    });
    var res  = await fetch(url.toString(), { redirect: 'follow' });
    var data = await res.json();
    if (!data.success) throw new Error(data.error && data.error.message ? data.error.message : 'API error');
    return data.data;
  },
  post: async function(action, body) {
    var t = this._token();
    var payload = Object.assign({}, body || {}, { action: action });
    if (t) payload.session_token = t;
    var res = await fetch(window.GAS_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    var text = await res.text();
    var data;
    try { data = JSON.parse(text); } catch(e) { throw new Error('Invalid server response'); }
    if (!data.success) throw new Error(data.error && data.error.message ? data.error.message : 'API error');
    return data.data;
  }
};
