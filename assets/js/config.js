// KIB Operations Portal — All-in-one config + API
var GAS_URL = 'https://script.google.com/macros/s/AKfycbxNRekRNtf5AfvZEoLIzMACuP6smQiMpPjLHs_s1XClBMU9wv-To2Id9asyJ5VHeD3FCg/exec';
var SES_KEY = 'kib_ops_session';

// Wipe any old API/AUTH/UTILS declarations to prevent conflicts
if (typeof window !== 'undefined') {
  window.API = {
    _s: function() { try { return JSON.parse(localStorage.getItem(SES_KEY)); } catch(e) { return null; } },
    _t: function() { var s=this._s(); return s?s.session_token:null; },
    get: async function(action, params) {
      var url = new URL(GAS_URL);
      url.searchParams.set('action', action);
      var t=this._t(); if(t) url.searchParams.set('session_token',t);
      Object.keys(params||{}).forEach(function(k){ if(params[k]!=null&&params[k]!=='') url.searchParams.set(k,params[k]); });
      var r=await fetch(url.toString(),{redirect:'follow'});
      var d=await r.json();
      if(!d.success) throw new Error(d.error&&d.error.message?d.error.message:'API error');
      return d.data;
    },
    post: async function(action, body) {
      var p=Object.assign({},body||{},{action:action});
      var t=this._t(); if(t) p.session_token=t;
      var r=await fetch(GAS_URL,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain'},body:JSON.stringify(p)});
      var txt=await r.text();
      var d; try{d=JSON.parse(txt);}catch(e){throw new Error('Invalid response');}
      if(!d.success) throw new Error(d.error&&d.error.message?d.error.message:'API error');
      return d.data;
    }
  };

  window.AUTH = {
    getSession: function() {
      try { var s=JSON.parse(localStorage.getItem(SES_KEY)); return s&&new Date(s.expires_at)>new Date()?s:null; } catch(e){return null;}
    },
    requireAuth: function() { if(!this.getSession()) window.location.href='/cc-task/login.html'; },
    logout: function() { localStorage.removeItem(SES_KEY); window.location.href='/cc-task/login.html'; },
    hasRole: function(r) { var s=this.getSession(); if(!s)return false; return Array.isArray(r)?r.indexOf(s.role)!==-1:s.role===r; },
    canDo: function(a) {
      var s=this.getSession(); if(!s)return false;
      var m={'tasks.create':['HoD','Manager'],'handover.create':['HoD','Manager','TL','AL'],'training.create':['HoD','Manager'],'sales.entry':['HoD','Manager','TL','AL'],'settings.edit':['HoD']};
      return m[a]?m[a].indexOf(s.role)!==-1:true;
    },
    getUserId: function() { var s=this.getSession(); return s?s.user_id:null; },
    getUserName: function() { var s=this.getSession(); return s?s.full_name:''; },
    getRole: function() { var s=this.getSession(); return s?s.role:''; }
  };

  window.UTILS = {
    escapeHtml: function(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); },
    formatDateTime: function(iso) {
      if(!iso) return '—';
      try { var d=new Date(iso); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); } catch(e){return String(iso).slice(0,16);}
    },
    formatDate: function(iso) {
      if(!iso) return '—';
      try { return new Date(iso).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){return String(iso).slice(0,10);}
    },
    todayKuwait: function() { return new Date(Date.now()+3*3600000).toISOString().slice(0,10); },
    timeRemaining: function(iso) {
      if(!iso) return {label:'—',overdue:false,diffMs:0};
      var diff=new Date(iso)-Date.now(), abs=Math.abs(diff);
      var label=abs<3600000?Math.floor(abs/60000)+'m':abs<86400000?Math.floor(abs/3600000)+'h':Math.floor(abs/86400000)+'d';
      return {label:diff<0?label+' over':label+' left',overdue:diff<0,diffMs:diff};
    },
    initials: function(n) { return String(n||'?').split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase(); },
    _avc: [['#dbeafe','#1d4ed8'],['#ede9fe','#6d28d9'],['#dcfce7','#15803d'],['#ffedd5','#c2410c'],['#fce7f3','#be185d'],['#ccfbf1','#0f766e']],
    avatarColors: function(n) { var h=0,s=String(n||''); for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))&0xffff; return this._avc[h%this._avc.length]; },
    avatarHtml: function(n,sz) { sz=sz||28; var c=this.avatarColors(n); return '<div style="width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+c[0]+';color:'+c[1]+';display:flex;align-items:center;justify-content:center;font-size:'+Math.round(sz*.38)+'px;font-weight:700;flex-shrink:0">'+this.initials(n)+'</div>'; },
    showToast: function(msg,type) {
      var c={success:'#0EA472',error:'#E5383B',warning:'#F4A523',info:'#1877C5'};
      var t=document.createElement('div');
      t.style.cssText='position:fixed;bottom:20px;right:20px;background:#0D1B3E;color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;border-left:3px solid '+(c[type]||c.info)+';box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:9999;max-width:340px;font-family:inherit';
      t.textContent=msg; document.body.appendChild(t); setTimeout(function(){t.remove();},3500);
    },
    showEmpty: function(id,title,sub) {
      var el=document.getElementById(id); if(!el)return;
      el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;color:#8A9BB0;text-align:center;gap:8px"><svg width="36" height="36" fill="none" stroke="#B8C5D4" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg><div style="font-size:13px;font-weight:600;color:#4A5568">'+(title||'No data')+'</div>'+(sub?'<div style="font-size:11px">'+sub+'</div>':'')+'</div>';
    },
    showLoader: function(id) {
      var el=document.getElementById(id); if(!el)return;
      el.innerHTML='<div style="padding:24px;display:flex;flex-direction:column;gap:10px"><div style="height:44px;background:linear-gradient(90deg,#F0F4F9 25%,#E4EAF3 50%,#F0F4F9 75%);background-size:200% 100%;animation:shimmer 1.6s infinite;border-radius:8px"></div><div style="height:44px;background:linear-gradient(90deg,#F0F4F9 25%,#E4EAF3 50%,#F0F4F9 75%);background-size:200% 100%;animation:shimmer 1.6s infinite;border-radius:8px"></div></div>';
    },
    setPageUser: function(s) {
      if(!s)return;
      var ini=document.getElementById('avatarInitials'),nm=document.getElementById('sidebarName'),rl=document.getElementById('sidebarRole');
      if(ini)ini.textContent=this.initials(s.full_name);
      if(nm)nm.textContent=s.display_name||s.full_name.split(' ')[0];
      if(rl)rl.textContent=s.role;
      document.querySelectorAll('[data-roles]').forEach(function(el){
        var roles=el.getAttribute('data-roles').split(',').map(function(r){return r.trim();});
        if(roles.indexOf(s.role)===-1)el.style.display='none';
      });
    },
    initSidebarToggle: function() {
      var btn=document.getElementById('sidebarToggle'),sb=document.getElementById('sidebar');
      if(btn&&sb)btn.addEventListener('click',function(){sb.classList.toggle('open');});
    }
  };
}
