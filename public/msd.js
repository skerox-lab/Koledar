// Montaža Škerjanec Digital – povezava prototipa s strežnikom.
// Prototip je podatke hranil v brskalniku (localStorage »msd-vzorec2«, IndexedDB »msd-files«).
// Ta datoteka to zamenja s strežnikom; app.js (koda prototipa) jo kliče prek objekta MSD.
// Seznam vseh popravkov app.js je v docs/POPRAVKI-PROTOTIPA.md.
'use strict';
window.MSD = (function () {
  const M = { dev: false, loggedIn: false, me: null, role: null, user: null, name: null, state: null, rparch: null };
  const DATAK = ['SIT', 'DOD', 'PREV', 'PAID', 'MONTHS', 'SITST', 'IZM', 'KOOP', 'MAIL', 'DOBA', 'RAZNO'];
  const NOSEND = new Set(['OBJ', ...DATAK]);
  let vers = { keys: {}, objs: {} };   // verzije zapisov na strežniku (za zaznavo hkratnih sprememb)
  let last = { keys: {}, objs: {} };   // zadnje shranjeno stanje (JSON), pošiljamo samo spremembe
  let provided = null;                 // ključi, ki jih je strežnik poslal temu uporabniku
  let pending = null, inflight = false, retryT = null, warned = false, stopped = false;

  const api = async (url, opt) => {
    opt = opt || {};
    const r = await fetch(url, Object.assign({ credentials: 'same-origin' }, opt, {
      headers: Object.assign(opt.body && !(opt.body instanceof Uint8Array) ? { 'Content-Type': 'application/json' } : {}, opt.headers || {})
    }));
    let j = null;
    try { j = await r.json(); } catch (x) { }
    return { ok: r.ok, status: r.status, j: j || {} };
  };
  const post = (url, body) => api(url, { method: 'POST', body: JSON.stringify(body || {}) });
  const ask = (m, o) => (typeof uiAsk === 'function' ? uiAsk(m, o) : Promise.resolve(window.confirm(m)));
  const say = m => (typeof toast === 'function' ? toast(m) : null);

  // ---------------------------------------------------------------- kdo je prijavljen
  M.who = function () {
    if (M.dev) return ({ nejc: 'Nejc', direktor: 'direktor', racun: 'računovodstvo', admin: 'Nejc (admin)' }[S.role]);
    return M.name || M.user || '';
  };

  // ---------------------------------------------------------------- shranjevanje
  function snapOf(o) { const d = {}; DATAK.forEach(k => { d[k] = o[k]; }); return d; }
  function objOf(o, id) { return id === o.CUR ? Object.assign({}, o.OBJ[id], { d: snapOf(o) }) : o.OBJ[id]; }
  function initLast(st) {
    last = { keys: {}, objs: {} };
    if (!st) return;
    Object.keys(st).forEach(k => { if (!NOSEND.has(k) && k[0] !== '_') last.keys[k] = JSON.stringify(st[k]); });
    Object.keys(st.OBJ || {}).forEach(id => { last.objs[id] = JSON.stringify(objOf(st, id)); });
  }
  function diff(o) {
    const keys = {}, objs = {}, del = {}, sk = {}, so = {};
    let n = 0;
    Object.keys(o).forEach(k => {
      if (NOSEND.has(k) || o[k] === undefined) return;
      if (!M.dev && k === 'AUDIT') return;                 // sled sprememb piše strežnik
      if (provided && !provided.has(k)) return;            // ključ, ki ga ta uporabnik ne dobi
      const s = JSON.stringify(o[k]);
      if (s !== last.keys[k]) { keys[k] = { v: JSON.parse(s), base: vers.keys[k] || 0 }; sk[k] = s; n++; }
    });
    Object.keys(o.OBJ || {}).forEach(id => {
      const s = JSON.stringify(objOf(o, id));
      if (s !== last.objs[id]) { objs[id] = { v: JSON.parse(s), base: vers.objs[id] || 0 }; so[id] = s; n++; }
    });
    Object.keys(last.objs).forEach(id => { if (!(o.OBJ || {})[id]) { del[id] = vers.objs[id] || 0; n++; } });
    return { n, body: { seed: !M.state, keys, objs, del }, sk, so };
  }
  M.save = function (o) {
    if (!M.loggedIn || stopped) return;
    pending = o;
    if (!inflight) setTimeout(flush, 0);
  };
  M.dirty = () => !stopped && (!!pending || inflight); // po ustavitvi (napaka, osvežitev) ni več česa shraniti
  async function flush() {
    if (inflight || !pending || stopped) return;
    const o = pending; pending = null;
    let d;
    try { d = diff(o); } catch (x) { console.error(x); return; }
    if (!d.n) return;
    inflight = true;
    let r;
    try { r = await api('api/state', { method: 'PUT', body: JSON.stringify(d.body) }); }
    catch (x) { r = null; }
    inflight = false;
    if (!r || r.status >= 500) {                          // strežnik ni dosegljiv: poskusi znova
      if (!pending) pending = o;
      if (!warned) { warned = true; say('Strežnik ni dosegljiv. Spremembe bodo shranjene, ko bo povezava spet delovala.'); }
      clearTimeout(retryT); retryT = setTimeout(flush, 3000);
      return;
    }
    if (r.ok) {
      if (warned) { warned = false; say('Povezava s strežnikom spet deluje, spremembe so shranjene.'); }
      Object.assign(last.keys, d.sk); Object.assign(last.objs, d.so);
      Object.keys(d.body.del).forEach(id => { delete last.objs[id]; delete vers.objs[id]; });
      Object.assign(vers.keys, r.j.vers.keys); Object.assign(vers.objs, r.j.vers.objs);
      if (!M.state) { M.state = { _full: true }; provided = null; }
      if (r.j.users && Array.isArray(window.USERS)) {
        window.USERS.splice(0, window.USERS.length, ...r.j.users);
        last.keys.USERS = JSON.stringify(window.USERS);
      }
      if (r.j.temp && r.j.temp.length) {
        await ask(r.j.temp.map(t => 'Začasno geslo za ' + t.name + ' (' + t.username + '):\n' + t.temp).join('\n\n') +
          '\n\nSporoči ga uporabniku. Ob prvi prijavi ga mora zamenjati.');
      }
      if (pending) flush();
      return;
    }
    stopped = true;
    if (r.status === 401) { await ask('Seja je potekla. Prijavi se znova.'); location.reload(); return; }
    if (r.status === 409) {
      await ask('Te podatke je medtem spremenil drug uporabnik (' + (r.j.who || 'neznano') + ').\n\nStran se bo osvežila z zadnjimi podatki. Tvoja zadnja sprememba ni shranjena, vnesi jo znova.');
      location.reload(); return;
    }
    await ask((r.j.error || 'Sprememba ni bila shranjena.') + '\n\nStran se bo osvežila.');
    location.reload();
  }
  window.addEventListener('beforeunload', ev => {
    if (pending && !inflight) flush();
    if (M.dirty()) { ev.preventDefault(); ev.returnValue = ''; }
  });

  // ---------------------------------------------------------------- sled sprememb
  M.audit = function (where, what) {
    if (!M.loggedIn) return;
    try { fetch('api/audit', { method: 'POST', credentials: 'same-origin', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ where, what }) }); } catch (x) { }
  };

  // ---------------------------------------------------------------- datoteke
  M.fPut = async function (id, data) {
    const r = await fetch('api/files/' + encodeURIComponent(id), { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/octet-stream' }, body: data });
    if (!r.ok) throw new Error('Datoteka ni shranjena (' + r.status + ')');
  };
  M.fGet = async function (id) {
    const r = await fetch('api/files/' + encodeURIComponent(id), { credentials: 'same-origin' });
    if (r.status === 404) return undefined;
    if (!r.ok) throw new Error(String(r.status));
    return new Uint8Array(await r.arrayBuffer());
  };
  M.fDel = async function (id) {
    await fetch('api/files/' + encodeURIComponent(id), { method: 'DELETE', credentials: 'same-origin' });
  };
  M.download = async function (name, data) {
    const blob = data instanceof Blob ? data : new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
  };

  // ---------------------------------------------------------------- prijava, odjava, gesla
  M.login = async function (u, p) {
    const r = await post('api/login', { username: u, password: p });
    if (!r.ok) { say(r.j.error || 'Prijava ni uspela'); return; }
    try { sessionStorage.setItem('msd-justlogged', '1'); } catch (x) { }
    location.reload();
  };
  M.logout = async function () {
    if (M.dirty()) await new Promise(res => { const t = setInterval(() => { if (!M.dirty()) { clearInterval(t); res(); } }, 100); setTimeout(() => { clearInterval(t); res(); }, 5000); });
    await post('api/logout');
    location.reload();
  };
  M.reset = async function () {
    if (!M.dev) { say('Ponastavitev vzorca je mogoča samo v razvojnem načinu'); return; }
    stopped = true;
    await post('api/dev/reset');
    location.reload();
  };
  const uid = i => (window.USERS && window.USERS[i] && window.USERS[i][5]) || null;
  M.pwReset = async function (i) {
    const r0 = window.USERS[i];
    if (!uid(i)) { say('Najprej shrani uporabnika'); return; }
    if (!await ask('Ponastavim geslo za ' + r0[0] + '?\n\nUporabnik dobi začasno geslo in ga ob prvi prijavi zamenja. Trenutne prijave se odjavijo.')) return;
    const r = await post('api/users/' + uid(i) + '/reset');
    if (!r.ok) { say(r.j.error || 'Ponastavitev ni uspela'); return; }
    log('Uporabniki', r0[0] + ': geslo ponastavljeno');
    await ask('Začasno geslo za ' + r0[0] + ' (' + r0[1] + '):\n' + r.j.temp + '\n\nSporoči ga uporabniku. Ob prvi prijavi ga mora zamenjati.');
  };
  M.pwSet = async function (i) {
    const r0 = window.USERS[i];
    if (!uid(i)) { say('Najprej shrani uporabnika'); return; }
    const p = await ask('Novo geslo za ' + r0[0] + ' (najmanj 8 znakov):', { input: true, def: '' });
    if (p == null) return;
    if (p.length < 8) { say('Geslo mora imeti najmanj 8 znakov'); return; }
    const mc = await ask('Naj uporabnik ob prvi prijavi zamenja to geslo?\n\nV redu = da, Prekliči = ne');
    const r = await post('api/users/' + uid(i) + '/password', { password: p, mustChange: !!mc });
    if (!r.ok) { say(r.j.error || 'Geslo ni nastavljeno'); return; }
    log('Uporabniki', r0[0] + ': geslo nastavil administrator' + (mc ? ', ob prijavi ga zamenja' : ''));
    say('Geslo za ' + r0[0] + ' je nastavljeno');
  };

  // ---------------------------------------------------------------- okna pred zagonom (prvi zagon, menjava gesla)
  function screen(title, fields, btn, note, onsubmit) {
    const lg = (document.querySelector('.brand .lgl') || {}).src || '';
    document.querySelector('.app').style.display = 'none';
    const el = document.createElement('div'); el.id = 'login'; document.body.appendChild(el);
    el.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px"><form class="panel" style="max-width:380px;width:100%;padding:28px"><div style="text-align:center"><img src="${lg}" alt="Montaža Škerjanec" style="width:200px;background:#fff;border-radius:6px;padding:6px"><div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:17px;letter-spacing:.14em;text-transform:uppercase;color:#1F91D8;margin:6px 0 20px">digital</div></div>
 <h2 style="text-align:center">${title}</h2>
 ${fields.map(f => `<label class="small muted" for="${f[0]}">${f[1]}</label><input id="${f[0]}" type="${f[2]}" autocomplete="${f[3]}" style="width:100%;margin:4px 0 10px;padding:8px">`).join('')}
 <div id="msderr" class="small badline" style="min-height:18px;margin-bottom:6px"></div>
 <button class="pri" type="submit" style="width:100%;padding:10px">${btn}</button>
 <div class="small muted" style="margin-top:12px;line-height:1.5;text-align:center">${note}</div></form></div>`;
    const v = id => (document.getElementById(id) || {}).value || '';
    el.querySelector('form').onsubmit = async ev => {
      ev.preventDefault();
      const err = await onsubmit(v);
      if (err) document.getElementById('msderr').textContent = err; else location.reload();
    };
    setTimeout(() => { const f = el.querySelector('input'); if (f) f.focus(); }, 50);
  }
  function setupScreen() {
    screen('Prvi zagon', [['su_n', 'Ime in priimek', 'text', 'name'], ['su_u', 'Uporabniško ime (službeni e-naslov)', 'email', 'username'], ['su_p', 'Geslo (najmanj 8 znakov)', 'password', 'new-password'], ['su_p2', 'Ponovi geslo', 'password', 'new-password']],
      'Ustvari administratorja', 'Prvi uporabnik je administrator. Ostale uporabnike dodaš v Administraciji › Uporabniki in vloge.',
      async v => {
        if (!v('su_n').trim()) return 'Vpiši ime in priimek';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('su_u').trim())) return 'Uporabniško ime mora biti službeni e-naslov';
        if (v('su_p').length < 8) return 'Geslo mora imeti najmanj 8 znakov';
        if (v('su_p') !== v('su_p2')) return 'Gesli se ne ujemata';
        const r = await post('api/setup', { name: v('su_n').trim(), username: v('su_u').trim(), password: v('su_p') });
        return r.ok ? null : (r.j.error || 'Napaka');
      });
  }
  function pwScreen(u) {
    screen('Nastavi novo geslo', [['pw_p', 'Novo geslo (najmanj 8 znakov)', 'password', 'new-password'], ['pw_p2', 'Ponovi novo geslo', 'password', 'new-password']],
      'Shrani geslo', 'Prijavljen si kot ' + u.username + ' z začasnim geslom. Pred nadaljevanjem nastavi svoje geslo.',
      async v => {
        if (v('pw_p').length < 8) return 'Geslo mora imeti najmanj 8 znakov';
        if (v('pw_p') !== v('pw_p2')) return 'Gesli se ne ujemata';
        const r = await post('api/password', { password: v('pw_p') });
        return r.ok ? null : (r.j.error || 'Napaka');
      });
  }

  // ---------------------------------------------------------------- zagon
  function loadApp() {
    const s = document.createElement('script');
    s.src = 'app.js';
    s.onload = () => {
      let just = false;
      try { just = sessionStorage.getItem('msd-justlogged') === '1'; sessionStorage.removeItem('msd-justlogged'); } catch (x) { }
      if (just && M.loggedIn) toast('Prijavljen kot ' + M.user + (OUTLOOK ? ' · Outlook povezan' : ' · Outlook ni povezan'));
    };
    document.body.appendChild(s);
  }
  async function boot() {
    let s;
    try { s = await api('api/session'); } catch (x) { s = null; }
    if (!s || !s.ok) {
      document.body.innerHTML = '<div style="padding:40px;font:15px system-ui">Strežnik Montaža Škerjanec Digital ni dosegljiv. Poskusi znova čez nekaj minut.</div>';
      return;
    }
    s = s.j;
    M.dev = !!s.dev;
    if (!M.dev) { // namesto spustnega seznama za menjavo vloge (samo razvojni način) ime prijavljenega
      const sel = document.getElementById('role');
      if (sel) { sel.style.display = 'none'; if (s.user) { const n = document.createElement('span'); n.className = 'small'; n.style.fontWeight = '500'; n.textContent = s.user.name; sel.after(n); } }
    }
    if (s.setup) { setupScreen(); return; }
    if (s.user) {
      if (s.user.mustChange) { pwScreen(s.user); return; }
      M.loggedIn = true; M.user = s.user.username; M.name = s.user.name; window._user = s.user.username;
      if (!M.dev) { M.me = s.user.name; M.role = s.user.role; }
      const st = await api('api/state');
      if (!st.ok) {
        document.body.innerHTML = '<div style="padding:40px;font:15px system-ui">' + (st.j.error || 'Podatkov ni bilo mogoče naložiti.') + ' <a href="#" onclick="MSD.logout();return false">Odjava</a></div>';
        return;
      }
      M.state = st.j.state; M.rparch = st.j.rparch || null;
      vers = st.j.vers || { keys: {}, objs: {} };
      provided = M.state && M.state._full ? new Set(Object.keys(M.state)) : null; // prvi zagon: shrani vse
      initLast(M.state);
    }
    loadApp();
  }
  boot();
  return M;
})();
