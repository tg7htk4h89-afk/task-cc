// KIB Portal — Auth & Session
const AUTH = (() => {
  function getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(SES_KEY));
      return s && new Date(s.expires_at) > new Date() ? s : null;
    } catch(e) { return null; }
  }

  function requireAuth() {
    if (!getSession()) { window.location.href = '/cc-task/login.html'; }
  }

  function logout() {
    localStorage.removeItem(SES_KEY);
    window.location.href = '/cc-task/login.html';
  }

  function hasRole(role) {
    const s = getSession();
    if (!s) return false;
    if (Array.isArray(role)) return role.includes(s.role);
    return s.role === role;
  }

  function canDo(action) {
    const s = getSession();
    if (!s) return false;
    const r = s.role;
    const map = {
      'tasks.create':    ['HoD','Manager'],
      'tasks.assign':    ['HoD','Manager'],
      'handover.create': ['HoD','Manager','TL','AL'],
      'training.create': ['HoD','Manager'],
      'sales.entry':     ['HoD','Manager','TL','AL'],
      'settings.edit':   ['HoD'],
      'scores.view_all': ['HoD','Manager'],
    };
    return map[action] ? map[action].includes(r) : true;
  }

  function getUserId()   { const s = getSession(); return s?.user_id; }
  function getUserName() { const s = getSession(); return s?.full_name || s?.display_name || ''; }
  function getRole()     { const s = getSession(); return s?.role || ''; }

  return { getSession, requireAuth, logout, hasRole, canDo, getUserId, getUserName, getRole };
})();
