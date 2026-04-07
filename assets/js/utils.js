// KIB Portal — Utilities
const UTILS = (() => {
  function escapeHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) + ' ' +
             d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
    } catch(e) { return iso.slice(0,16); }
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    } catch(e) { return iso.slice(0,10); }
  }

  function todayKuwait() {
    return new Date(Date.now() + 3*3600000).toISOString().slice(0,10);
  }

  function timeRemaining(iso) {
    if (!iso) return { label: '—', overdue: false, diffMs: 0 };
    const diff = new Date(iso) - Date.now();
    const abs  = Math.abs(diff);
    const hrs  = Math.floor(abs / 3600000);
    const mins = Math.floor((abs % 3600000) / 60000);
    const days = Math.floor(abs / 86400000);
    let label;
    if (abs < 3600000)      label = mins + 'm';
    else if (abs < 86400000) label = hrs  + 'h ' + mins + 'm';
    else                     label = days + 'd';
    const overdue = diff < 0;
    return { label: overdue ? label + ' over' : label + ' left', overdue, diffMs: diff };
  }

  function initials(name) {
    return (name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  }

  const AV_COLORS = [
    ['#dbeafe','#1d4ed8'], ['#ede9fe','#6d28d9'], ['#dcfce7','#15803d'],
    ['#ffedd5','#c2410c'], ['#fce7f3','#be185d'], ['#ccfbf1','#0f766e'],
  ];
  function avatarColors(name) {
    let h = 0;
    for (const c of (name||'')) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
    return AV_COLORS[h % AV_COLORS.length];
  }

  function avatarHtml(name, size = 28) {
    const [bg, fg] = avatarColors(name);
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.38)}px;font-weight:700;flex-shrink:0;">${initials(name)}</div>`;
  }

  function showToast(msg, type = 'info') {
    const colors = { success:'#0EA472', error:'#E5383B', warning:'#F4A523', info:'#1877C5' };
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:20px;right:20px;background:#0D1B3E;color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;font-family:inherit;border-left:3px solid ${colors[type]||colors.info};box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:9999;max-width:340px;animation:slideUp .3s ease`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  function showEmpty(containerId, title = 'No data', sub = '') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;color:#8A9BB0;text-align:center;gap:8px">
      <svg width="36" height="36" fill="none" stroke="#B8C5D4" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
      <div style="font-size:13px;font-weight:600;color:#4A5568">${escapeHtml(title)}</div>
      ${sub ? `<div style="font-size:11px">${escapeHtml(sub)}</div>` : ''}
    </div>`;
  }

  function showLoader(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:10px">
      ${[1,2,3].map(()=>`<div style="height:44px;background:linear-gradient(90deg,#F0F4F9 25%,#E4EAF3 50%,#F0F4F9 75%);background-size:200% 100%;animation:shimmer 1.6s infinite;border-radius:8px"></div>`).join('')}
    </div>`;
  }

  function setPageUser(session) {
    if (!session) return;
    const ini = document.getElementById('avatarInitials');
    const nm  = document.getElementById('sidebarName');
    const rl  = document.getElementById('sidebarRole');
    if (ini) ini.textContent = initials(session.full_name);
    if (nm)  nm.textContent  = session.display_name || session.full_name.split(' ')[0];
    if (rl)  rl.textContent  = session.role;
    // Apply role-based visibility
    document.querySelectorAll('[data-roles]').forEach(el => {
      const roles = el.getAttribute('data-roles').split(',').map(r=>r.trim());
      if (!roles.includes(session.role)) el.style.display = 'none';
    });
  }

  function initSidebarToggle() {
    const btn = document.getElementById('sidebarToggle');
    const sb  = document.getElementById('sidebar');
    if (!btn || !sb) return;
    btn.addEventListener('click', () => sb.classList.toggle('open'));
  }

  return { escapeHtml, formatDateTime, formatDate, todayKuwait, timeRemaining,
           initials, avatarColors, avatarHtml, showToast, showEmpty, showLoader,
           setPageUser, initSidebarToggle };
})();
