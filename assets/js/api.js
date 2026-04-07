window.API = {
  _s: function() { try { return JSON.parse(localStorage.getItem(window.SES_KEY)); } catch(e) { return null; } },
  _t: function() { var s=this._s(); return s?s.session_token:null; },
  get: async function(action, params) {
    var url = new URL(window.GAS_URL);
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
    var r=await fetch(window.GAS_URL,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain'},body:JSON.stringify(p)});
    var d=await r.json();
    if(!d.success) throw new Error(d.error&&d.error.message?d.error.message:'API error');
    return d.data;
  }
};
