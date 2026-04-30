// src/modules/guardias.js
// Aquí va TODO el código de guardias que está en index.html

let gvGuardias = [];
let gvEditId   = null;

export async function gvInit() {
  const esAdmin  = loginType === 'admin';
  const esRemoto = loginType === 'remoto';

  document.getElementById('gv-tabs').style.display        = esAdmin ? 'flex' : 'none';
  document.getElementById('gv-admin-toolbar').style.display = esAdmin ? 'flex' : 'none';

  if (esAdmin)  gvCargarAdmin();
  if (esRemoto) gvCargarRemoto();
}

export async function gvCargarRemoto() {
  try {
    const res  = await fetch('/api/guardias?vista=remoto');
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    gvRenderVacantesRemoto(json.data);
  } catch (e) {
    console.error('[GV] Error:', e);
  }
}

export async function gvCargarAdmin() {
  try {
    const res  = await fetch('/api/guardias?vista=admin');
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    gvGuardias = json.data;
    gvRenderVacantesAdmin();
    gvRenderTabla();
  } catch (e) {
    console.error('[GV] Error admin:', e);
  }
}

// ... el resto de funciones de guardias que cortas del index.html
