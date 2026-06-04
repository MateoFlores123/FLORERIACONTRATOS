/* ═══════════════════════════════════════════
   FLORERIASHALON4 — app.js
   ═══════════════════════════════════════════ */

let seccionCount = 0;
let firmaDataURL = null;

/* ─── INICIALIZAR ─────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Fecha del contrato: ahora
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('fecha').value =
    `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Fecha del evento por defecto
  document.getElementById('fechaEvento').value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;

  // Cargar firma guardada
  const firmaSaved = localStorage.getItem('shalom_firma');
  if (firmaSaved) {
    firmaDataURL = firmaSaved;
    mostrarFirmaPreview(firmaSaved);
  }

  // Primera sección por defecto
  agregarSeccion('Local');
});

/* ─── AGREGAR SECCIÓN ────────────────────── */
function agregarSeccion(nombre) {
  seccionCount++;
  const id = `sec-${seccionCount}`;
  const titulo = nombre || `Sección ${seccionCount}`;

  const wrap = document.getElementById('secciones-wrap');
  const div = document.createElement('div');
  div.className = 'seccion-arreglo';
  div.id = id;
  div.innerHTML = `
    <div class="seccion-header">
      <input type="text" class="sec-titulo" value="${titulo}" placeholder="Nombre de sección (ej: Local, Iglesia…)" />
      <button class="btn-remove" onclick="eliminarSeccion('${id}')">✕ Quitar</button>
    </div>
    <div class="seccion-body">
      <div style="overflow-x:auto">
        <table class="items-table">
          <thead>
            <tr>
              <th class="col-cant">Cant.</th>
              <th class="col-desc">Descripción</th>
              <th class="col-puni">P. Unit. (S/.)</th>
              <th class="col-ptot">P. Total (S/.)</th>
              <th class="col-del"></th>
            </tr>
          </thead>
          <tbody id="body-${id}"></tbody>
        </table>
      </div>
      <button class="btn btn-add-row" onclick="agregarFila('${id}')">＋ Fila</button>
    </div>
  `;
  wrap.appendChild(div);
  agregarFila(id);
  recalcular();
}

/* ─── ELIMINAR SECCIÓN ───────────────────── */
function eliminarSeccion(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  recalcular();
}

/* ─── AGREGAR FILA ───────────────────────── */
function agregarFila(secId) {
  const tbody = document.getElementById(`body-${secId}`);
  const rowId = `row-${secId}-${Date.now()}`;
  const tr = document.createElement('tr');
  tr.id = rowId;
  tr.innerHTML = `
    <td class="col-cant">
      <input type="number" min="0" step="1" value="1"
        onchange="calcularFila('${rowId}')" oninput="calcularFila('${rowId}')" />
    </td>
    <td class="col-desc">
      <div class="desc-wrap" id="dwrap-${rowId}">
        <div class="desc-main-row">
          <input type="text" class="desc-principal" placeholder="Descripción del arreglo" />
          <button class="btn-add-sub" title="Agregar sub-ítem (guión)" onclick="agregarSubItem('${rowId}')">＋ —</button>
        </div>
        <div class="sub-items" id="subs-${rowId}"></div>
      </div>
    </td>
    <td class="col-puni">
      <input type="number" min="0" step="0.01" placeholder=""
        onchange="calcularFila('${rowId}')" oninput="calcularFila('${rowId}')" />
    </td>
    <td class="col-ptot">
      <input type="number" min="0" step="0.01" value="" readonly
        style="color: var(--terra-dark); font-weight:700" />
    </td>
    <td class="col-del">
      <button class="btn-remove" onclick="eliminarFila('${rowId}')">✕</button>
    </td>
  `;
  tbody.appendChild(tr);
}

/* ─── AGREGAR SUB-ÍTEM ───────────────────── */
function agregarSubItem(rowId) {
  const subsDiv = document.getElementById(`subs-${rowId}`);
  const subId = `sub-${rowId}-${Date.now()}`;
  const div = document.createElement('div');
  div.className = 'sub-item-row';
  div.id = subId;
  div.innerHTML = `
    <span class="sub-guion">—</span>
    <input type="text" class="sub-desc" placeholder="sub-ítem…" />
    <button class="btn-remove-sub" onclick="document.getElementById('${subId}').remove()" title="Quitar">✕</button>
  `;
  subsDiv.appendChild(div);
  div.querySelector('input').focus();
}

/* ─── CALCULAR FILA ──────────────────────── */
function calcularFila(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const inputs = row.querySelectorAll('td.col-cant input, td.col-puni input, td.col-ptot input');
  const cant  = parseFloat(inputs[0].value) || 0;
  const puni  = parseFloat(inputs[1].value) || 0;
  const total = cant * puni;
  inputs[2].value = (total > 0) ? total.toFixed(2) : '';
  recalcular();
}

/* ─── ELIMINAR FILA ──────────────────────── */
function eliminarFila(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
  recalcular();
}

/* ─── RECALCULAR TOTALES ─────────────────── */
function recalcular() {
  let subtotal = 0;
  document.querySelectorAll('.items-table tbody tr').forEach(row => {
    const ptot = row.querySelector('td.col-ptot input');
    if (ptot) subtotal += parseFloat(ptot.value) || 0;
  });

  const transporte = parseFloat(document.getElementById('transporteMonto').value) || 0;
  const descuento  = parseFloat(document.getElementById('descuento').value) || 0;
  const adelanto   = parseFloat(document.getElementById('adelanto').value) || 0;

  const totalDeco = subtotal + transporte - descuento;
  const saldo     = totalDeco - adelanto;

  document.getElementById('rTotal').textContent  = `S/. ${totalDeco.toFixed(2)}`;
  document.getElementById('rCuenta').textContent = `S/. ${adelanto.toFixed(2)}`;
  document.getElementById('rSaldo').innerHTML    = `<strong>S/. ${saldo.toFixed(2)}</strong>`;
}

/* ─── FIRMA: CARGAR ──────────────────────── */
function cargarFirma(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    firmaDataURL = e.target.result;
    localStorage.setItem('shalom_firma', firmaDataURL);
    mostrarFirmaPreview(firmaDataURL);
  };
  reader.readAsDataURL(file);
}

function mostrarFirmaPreview(dataURL) {
  const img = document.getElementById('firmaImg');
  const placeholder = document.getElementById('firmaPlaceholder');
  const box = document.getElementById('firmaPreviewBox');
  const btnQuitar = document.getElementById('btnQuitarFirma');
  img.src = dataURL;
  img.style.display = 'block';
  placeholder.style.display = 'none';
  box.classList.add('tiene-firma');
  btnQuitar.style.display = 'inline-flex';
}

function quitarFirma() {
  firmaDataURL = null;
  localStorage.removeItem('shalom_firma');
  const img = document.getElementById('firmaImg');
  const placeholder = document.getElementById('firmaPlaceholder');
  const box = document.getElementById('firmaPreviewBox');
  const btnQuitar = document.getElementById('btnQuitarFirma');
  const input = document.getElementById('firmaInput');
  img.src = '';
  img.style.display = 'none';
  placeholder.style.display = 'block';
  box.classList.remove('tiene-firma');
  btnQuitar.style.display = 'none';
  input.value = '';
}

/* ─── FORMATEAR FECHA EVENTO ─────────────── */
function formatearFechaEvento(val) {
  if (!val) return '';
  const [y, m, d] = val.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(d)} de ${meses[parseInt(m)-1].charAt(0).toUpperCase() + meses[parseInt(m)-1].slice(1)} de ${y}`;
}

/* ─── FORMATEAR FECHA CONTRATO ───────────── */
function formatearFecha(val) {
  if (!val) return '';
  const d = new Date(val);
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const hora = d.toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit', hour12: false });
  return `${dia} de ${mes.charAt(0).toUpperCase()+mes.slice(1)} de ${d.getFullYear()} — ${hora}`;
}

/* ─── OBTENER DATOS DE SECCIONES ─────────── */
function obtenerSecciones() {
  const secciones = [];
  document.querySelectorAll('.seccion-arreglo').forEach(sec => {
    const titulo = sec.querySelector('.sec-titulo').value || 'Sin título';
    const filas = [];
    sec.querySelectorAll('tbody tr').forEach(row => {
      const cantInput = row.querySelector('td.col-cant input');
      const descInput = row.querySelector('.desc-principal');
      const puniInput = row.querySelector('td.col-puni input');
      const ptotInput = row.querySelector('td.col-ptot input');

      const cant  = cantInput?.value || '';
      const desc  = descInput?.value || '';
      const puni  = parseFloat(puniInput?.value) || 0;
      const ptot  = parseFloat(ptotInput?.value) || 0;

      // Sub-ítems
      const subs = [];
      row.querySelectorAll('.sub-item-row .sub-desc').forEach(si => {
        if (si.value.trim()) subs.push(si.value.trim());
      });

      if (desc || cant) {
        filas.push({ cant, desc, puni, ptot, subs });
      }
    });
    if (filas.length) secciones.push({ titulo, filas });
  });
  return secciones;
}

/* ─── BASE DE DATOS LOCAL ────────────────── */
function obtenerTodosContratos() {
  try {
    return JSON.parse(localStorage.getItem('shalom_contratos') || '[]');
  } catch { return []; }
}

function guardarContratos(lista) {
  localStorage.setItem('shalom_contratos', JSON.stringify(lista));
}

function recopilarFormulario() {
  return {
    trato:          document.querySelector('input[name="trato"]:checked')?.value || 'Sr.',
    nombre:         document.getElementById('nombreCliente').value,
    dni:            document.getElementById('dniCliente').value,
    celular:        document.getElementById('celularCliente').value,
    adelanto:       document.getElementById('adelanto').value,
    fecha:          document.getElementById('fecha').value,
    fechaEvento:    document.getElementById('fechaEvento').value,
    horaEntrega:    document.getElementById('horaEntrega').value,
    colores:        document.getElementById('colores').value,
    lugarEvento:    document.getElementById('lugarEvento').value,
    localEvento:    document.getElementById('localEvento').value,
    transporteDesc: document.getElementById('transporteDesc').value,
    transporteMonto:document.getElementById('transporteMonto').value,
    descuento:      document.getElementById('descuento').value,
    cci:            document.getElementById('cci').value,
    cuentaCorriente:document.getElementById('cuentaCorriente').value,
    secciones:      obtenerSecciones(),
  };
}

function guardarContrato() {
  const datos = recopilarFormulario();
  const lista = obtenerTodosContratos();
  let id = document.getElementById('contratoId').value;

  if (id) {
    // Actualizar existente
    const idx = lista.findIndex(c => c.id === id);
    if (idx >= 0) {
      lista[idx] = { ...datos, id, updatedAt: new Date().toISOString() };
    } else {
      id = Date.now().toString();
      lista.push({ ...datos, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      document.getElementById('contratoId').value = id;
    }
  } else {
    id = Date.now().toString();
    document.getElementById('contratoId').value = id;
    lista.push({ ...datos, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  guardarContratos(lista);

  const msg = document.getElementById('saveMsg');
  msg.style.display = 'inline';
  setTimeout(() => msg.style.display = 'none', 2500);
}

function cargarContrato(id) {
  const lista = obtenerTodosContratos();
  const c = lista.find(x => x.id === id);
  if (!c) return;

  // Limpiar secciones actuales
  document.getElementById('secciones-wrap').innerHTML = '';
  seccionCount = 0;

  document.getElementById('contratoId').value = c.id;
  document.querySelector(`input[name="trato"][value="${c.trato}"]`).checked = true;
  document.getElementById('nombreCliente').value   = c.nombre || '';
  document.getElementById('dniCliente').value      = c.dni || '';
  document.getElementById('celularCliente').value  = c.celular || '';
  document.getElementById('adelanto').value        = c.adelanto || '';
  document.getElementById('fecha').value           = c.fecha || '';
  document.getElementById('fechaEvento').value     = c.fechaEvento || '';
  document.getElementById('horaEntrega').value     = c.horaEntrega || '';
  document.getElementById('colores').value         = c.colores || '';
  document.getElementById('lugarEvento').value     = c.lugarEvento || '';
  document.getElementById('localEvento').value     = c.localEvento || '';
  document.getElementById('transporteDesc').value  = c.transporteDesc || '';
  document.getElementById('transporteMonto').value = c.transporteMonto || '';
  document.getElementById('descuento').value       = c.descuento || '';
  document.getElementById('cci').value             = c.cci || '';
  document.getElementById('cuentaCorriente').value = c.cuentaCorriente || '';

  // Reconstruir secciones
  (c.secciones || []).forEach(sec => {
    seccionCount++;
    const id2 = `sec-${seccionCount}`;
    const wrap = document.getElementById('secciones-wrap');
    const div = document.createElement('div');
    div.className = 'seccion-arreglo';
    div.id = id2;
    div.innerHTML = `
      <div class="seccion-header">
        <input type="text" class="sec-titulo" value="${sec.titulo}" placeholder="Nombre de sección" />
        <button class="btn-remove" onclick="eliminarSeccion('${id2}')">✕ Quitar</button>
      </div>
      <div class="seccion-body">
        <div style="overflow-x:auto">
          <table class="items-table">
            <thead>
              <tr>
                <th class="col-cant">Cant.</th>
                <th class="col-desc">Descripción</th>
                <th class="col-puni">P. Unit. (S/.)</th>
                <th class="col-ptot">P. Total (S/.)</th>
                <th class="col-del"></th>
              </tr>
            </thead>
            <tbody id="body-${id2}"></tbody>
          </table>
        </div>
        <button class="btn btn-add-row" onclick="agregarFila('${id2}')">＋ Fila</button>
      </div>
    `;
    wrap.appendChild(div);

    // Restaurar filas
    sec.filas.forEach(fila => {
      const tbody = document.getElementById(`body-${id2}`);
      const rowId = `row-${id2}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const tr = document.createElement('tr');
      tr.id = rowId;
      tr.innerHTML = `
        <td class="col-cant">
          <input type="number" min="0" step="1" value="${fila.cant}"
            onchange="calcularFila('${rowId}')" oninput="calcularFila('${rowId}')" />
        </td>
        <td class="col-desc">
          <div class="desc-wrap" id="dwrap-${rowId}">
            <div class="desc-main-row">
              <input type="text" class="desc-principal" value="${fila.desc}" placeholder="Descripción del arreglo" />
              <button class="btn-add-sub" title="Agregar sub-ítem" onclick="agregarSubItem('${rowId}')">＋ —</button>
            </div>
            <div class="sub-items" id="subs-${rowId}">
              ${(fila.subs || []).map(s => `
                <div class="sub-item-row" id="sub-${Date.now()}-${Math.random().toString(36).slice(2)}">
                  <span class="sub-guion">—</span>
                  <input type="text" class="sub-desc" value="${s}" placeholder="sub-ítem…" />
                  <button class="btn-remove-sub" onclick="this.closest('.sub-item-row').remove()" title="Quitar">✕</button>
                </div>
              `).join('')}
            </div>
          </div>
        </td>
        <td class="col-puni">
          <input type="number" min="0" step="0.01" value="${fila.puni || ''}" placeholder=""
            onchange="calcularFila('${rowId}')" oninput="calcularFila('${rowId}')" />
        </td>
        <td class="col-ptot">
          <input type="number" min="0" step="0.01" value="${fila.ptot || ''}" readonly
            style="color: var(--terra-dark); font-weight:700" />
        </td>
        <td class="col-del">
          <button class="btn-remove" onclick="eliminarFila('${rowId}')">✕</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });

  recalcular();
  cerrarBD();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const msg = document.getElementById('saveMsg');
  msg.textContent = '✓ Contrato cargado';
  msg.style.display = 'inline';
  setTimeout(() => { msg.style.display = 'none'; msg.textContent = '✓ Guardado'; }, 2500);
}

function eliminarContratoGuardado(id) {
  if (!confirm('¿Eliminar este contrato de los guardados?')) return;
  const lista = obtenerTodosContratos().filter(c => c.id !== id);
  guardarContratos(lista);
  renderizarBD();
}

function nuevoContrato() {
  if (!confirm('¿Crear un contrato nuevo? Los datos no guardados se perderán.')) return;
  document.getElementById('secciones-wrap').innerHTML = '';
  seccionCount = 0;
  document.getElementById('contratoId').value = '';
  document.getElementById('nombreCliente').value = '';
  document.getElementById('dniCliente').value = '';
  document.getElementById('celularCliente').value = '';
  document.getElementById('adelanto').value = '';
  document.getElementById('colores').value = '';
  document.getElementById('lugarEvento').value = '';
  document.getElementById('localEvento').value = '';
  document.getElementById('horaEntrega').value = '';
  document.getElementById('transporteDesc').value = '';
  document.getElementById('transporteMonto').value = '';
  document.getElementById('descuento').value = '';
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('fecha').value =
    `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  document.getElementById('fechaEvento').value =
    `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  agregarSeccion('Local');
  recalcular();
}

/* ─── ABRIR / CERRAR BD MODAL ────────────── */
function abrirBD() {
  renderizarBD();
  document.getElementById('bdModal').style.display = 'flex';
}

function cerrarBD() {
  document.getElementById('bdModal').style.display = 'none';
}

function renderizarBD() {
  const lista = obtenerTodosContratos();
  const div = document.getElementById('bdLista');

  if (lista.length === 0) {
    div.innerHTML = `<p style="padding:1.5rem; color:var(--ink-mid); text-align:center;">No hay contratos guardados aún.<br><small>Usa el botón <strong>💾 Guardar contrato</strong> para guardar.</small></p>`;
    return;
  }

  div.innerHTML = `
    <div style="padding:0.75rem 1.25rem; border-bottom:1px solid var(--cream-dark); display:flex; justify-content:flex-end;">
      <button class="btn btn-add-section" onclick="nuevoContrato(); cerrarBD();" style="font-size:0.78rem; padding:0.4rem 0.9rem;">＋ Nuevo contrato</button>
    </div>
    ${lista.slice().reverse().map(c => {
      const fecha = c.updatedAt ? new Date(c.updatedAt).toLocaleString('es-PE') : '';
      const nombre = c.nombre || '(sin nombre)';
      const total  = (c.secciones || []).reduce((acc, sec) =>
        acc + (sec.filas || []).reduce((a2, f) => a2 + (f.ptot || 0), 0), 0);
      return `
        <div class="bd-item">
          <div class="bd-item-info">
            <strong>${nombre}</strong>
            <span class="bd-item-meta">DNI: ${c.dni || '—'} | Tel: ${c.celular || '—'}</span>
            <span class="bd-item-meta">Evento: ${c.fechaEvento ? formatearFechaEvento(c.fechaEvento) : '—'}</span>
            <span class="bd-item-meta">Total: S/. ${total.toFixed(2)} | Adelanto: S/. ${parseFloat(c.adelanto||0).toFixed(2)}</span>
            <span class="bd-item-meta" style="font-size:0.72rem; color:var(--ink-mid);">Guardado: ${fecha}</span>
          </div>
          <div class="bd-item-btns">
            <button class="btn btn-print" style="font-size:0.78rem; padding:0.4rem 0.9rem;" onclick="cargarContrato('${c.id}')">✏️ Editar</button>
            <button class="btn-remove" onclick="eliminarContratoGuardado('${c.id}')">🗑 Eliminar</button>
          </div>
        </div>
      `;
    }).join('')}
  `;
}

/* ─── ABRIR / CERRAR PREVIEW ─────────────── */
function abrirPreview() {
  generarContrato();
  document.getElementById('previewModal').style.display = 'flex';
}

function cerrarPreview() {
  document.getElementById('previewModal').style.display = 'none';
}

function imprimirContrato() {
  window.print();
}

/* ─── HELPERS DE UI ──────────────────────── */
function setExportando(activo) {
  const status  = document.getElementById('exportStatus');
  const btnImg  = document.getElementById('btnImg');
  const btnShr  = document.getElementById('btnShare');
  const btnPrt  = document.querySelector('.btn-print');
  status.style.display = activo ? 'flex' : 'none';
  [btnImg, btnShr, btnPrt].forEach(b => b && (b.disabled = activo));
}

/* ─── GENERAR BLOB PNG ───────────────────── */
async function generarBlob() {
  const original = document.getElementById('contratoImprimible');
  setExportando(true);

  const A4_W = 794;
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${A4_W}px;
    background: #ffffff;
    font-family: 'Lato', sans-serif;
    padding: 60px 80px;
    box-sizing: border-box;
  `;
  wrapper.innerHTML = original.innerHTML;
  document.body.appendChild(wrapper);

  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 300));

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: A4_W,
      windowWidth: A4_W,
    });
    return await new Promise(res => canvas.toBlob(res, 'image/png'));
  } finally {
    document.body.removeChild(wrapper);
    setExportando(false);
  }
}

async function descargarImagen() {
  const nombre  = document.getElementById('nombreCliente').value.trim() || 'cliente';
  const blob    = await generarBlob();
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href        = url;
  a.download    = `contrato-${nombre.replace(/\s+/g, '-').toLowerCase()}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function compartir() {
  const nombre = document.getElementById('nombreCliente').value.trim() || 'cliente';
  const blob   = await generarBlob();
  const file   = new File([blob], `contrato-${nombre.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Contrato FLORERIASHALON4 — ${nombre}`,
        text: `Contrato de arreglos florales para ${nombre}`,
        files: [file],
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }

  const blob2 = await generarBlob();
  const url   = URL.createObjectURL(blob2);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `contrato-${nombre.replace(/\s+/g, '-').toLowerCase()}.png`;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    const msg = encodeURIComponent(`Hola! Te adjunto el contrato de arreglos florales — FLORERIASHALON4`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }, 800);
}

/* ─── GENERAR HTML DEL CONTRATO ──────────── */
function generarContrato() {
  const trato         = document.querySelector('input[name="trato"]:checked')?.value || 'Sr.';
  const nombre        = document.getElementById('nombreCliente').value || '_______________';
  const dni           = document.getElementById('dniCliente').value || '__________';
  const celular       = document.getElementById('celularCliente').value || '';
  const adelanto      = parseFloat(document.getElementById('adelanto').value) || 0;
  const fechaVal      = document.getElementById('fecha').value;
  const fechaEvento   = document.getElementById('fechaEvento').value;
  const horaEntrega   = document.getElementById('horaEntrega').value || '___';
  const colores       = document.getElementById('colores').value || '';
  const lugarEvento   = document.getElementById('lugarEvento').value || '';
  const localEvento   = document.getElementById('localEvento').value || '';
  const transDesc     = document.getElementById('transporteDesc').value;
  const transMonto    = parseFloat(document.getElementById('transporteMonto').value) || 0;
  const descuento     = parseFloat(document.getElementById('descuento').value) || 0;
  const cci           = document.getElementById('cci').value;
  const cuenta        = document.getElementById('cuentaCorriente').value;
  const secciones     = obtenerSecciones();

  let subtotal = 0;
  secciones.forEach(s => s.filas.forEach(f => subtotal += f.ptot));
  const totalDeco = subtotal + transMonto - descuento;
  const saldo     = totalDeco - adelanto;

  /* ── Tabla de items ── */
  let tablasHtml = '';
  secciones.forEach((sec, secIdx) => {
    const isLast = secIdx === secciones.length - 1;

    const filasMarcadas = sec.filas.map(f => {
      const subsHtml = (f.subs && f.subs.length > 0)
        ? `<div style="margin-top:3px; padding-left:8px; font-size:0.76rem; color:#555;">
            ${f.subs.map(s => `<div>— ${s}</div>`).join('')}
           </div>`
        : '';
      return `
        <tr>
          <td>${f.cant}</td>
          <td>${f.desc}${subsHtml}</td>
          <td class="r">S/.${f.puni.toFixed(2)}</td>
          <td class="r">S/.${f.ptot.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    tablasHtml += `
      ${secciones.length > 1 ? `<p class="cp-seccion-titulo">${sec.titulo}</p>` : ''}
      <table class="cp-tabla">
        <thead>
          <tr>
            <th style="width:60px">CANT.</th>
            <th>DESCRIPCIÓN</th>
            <th class="r" style="width:100px">P.UNI</th>
            <th class="r" style="width:100px">P TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${filasMarcadas}
          ${transMonto > 0 && isLast ? `
          <tr>
            <td colspan="2">Transporte${transDesc ? ' — ' + transDesc : ''}</td>
            <td class="r"></td>
            <td class="r">S/.${transMonto.toFixed(2)}</td>
          </tr>` : ''}
          ${descuento > 0 && isLast ? `
          <tr>
            <td colspan="2">Descuento</td>
            <td class="r"></td>
            <td class="r">-S/.${descuento.toFixed(2)}</td>
          </tr>` : ''}
          ${isLast ? `
          <tr class="total-row">
            <td colspan="3" style="text-align:right"><strong>TOTAL</strong></td>
            <td class="r"><strong>S/.${totalDeco.toFixed(2)}</strong></td>
          </tr>` : ''}
        </tbody>
      </table>
    `;
  });

  /* ── Tabla resumen ── */
  const resumenHtml = `
    <table class="cp-resumen">
      <tbody>
        <tr><td><strong>TOTAL DECORACIÓN</strong></td><td>S/${totalDeco.toFixed(2)}</td></tr>
        <tr><td><strong>A CUENTA</strong></td><td>S/${adelanto.toFixed(2)}</td></tr>
        <tr class="saldo-row"><td><strong>SALDO TOTAL</strong></td><td><strong>S/.${saldo.toFixed(2)}</strong></td></tr>
        <tr class="cuenta-row"><td>N° CCI "BCP"</td><td><strong>${cci}</strong></td></tr>
        <tr class="cuenta-row"><td>N° CUENTA CORRIENTE "BCP"</td><td><strong>${cuenta}</strong></td></tr>
      </tbody>
    </table>
  `;

  /* ── HTML completo ── */
  const html = `
    <div class="cp-header">
      <span class="cp-flowers">✿ ✾ ✿ ✾ ✿ ✾ ✿ ✾ ✿ ✾ ✿</span>
      <div class="cp-nombre-floreria">FLORERIASHALON4</div>
      <div class="cp-contact">De: Martin Flores Ramos &nbsp;|&nbsp; N° Telef. 993708614</div>
    </div>

    <p class="cp-title">CONTRATO</p>

    <table class="cp-info-evento">
      <tbody>
        <tr>
          <td><strong>FECHA DEL EVENTO:</strong></td>
          <td>${fechaEvento ? formatearFechaEvento(fechaEvento) : '_______________'}</td>
          <td><strong>HORA DE ENTREGA:</strong></td>
          <td>${horaEntrega}</td>
        </tr>
        ${colores ? `<tr><td><strong>COLORES:</strong></td><td colspan="3">${colores}</td></tr>` : ''}
        ${lugarEvento ? `<tr><td><strong>LUGAR DEL EVENTO:</strong></td><td colspan="3">${lugarEvento}</td></tr>` : ''}
        ${localEvento ? `<tr><td><strong>LOCAL DEL EVENTO:</strong></td><td colspan="3">${localEvento}</td></tr>` : ''}
      </tbody>
    </table>

    <p class="cp-narrativa">
      Conste por el presente contrato que celebran de una parte el Sr. <strong>Martin Flores Ramos</strong>
      con DNI <strong>80625301</strong> representante de la <strong>FLORERIASHALON4</strong>
      en su calidad de <strong>VENDEDOR</strong>, y el ${trato} <strong>${nombre}</strong>
      con DNI <strong>${dni}</strong>${celular ? `, celular <strong>${celular}</strong>` : ''}
      en su calidad de <strong>COMPRADOR</strong>.<br/><br/>
      El <strong>COMPRADOR</strong> dio como concepto de adelanto la cantidad de
      <strong>S/. ${adelanto.toFixed(2)} soles</strong>
      y acuerda comprar los siguientes artículos o conceptos descritos a continuación:
    </p>

    ${tablasHtml}
    ${resumenHtml}

    <div class="cp-firma">
      <div class="cp-firma-box">
        ${firmaDataURL ? `<img class="cp-firma-img" src="${firmaDataURL}" alt="Firma" />` : '<br/><br/>'}
        <div class="cp-firma-linea"></div>
        <div class="cp-firma-nombre">Martin Flores Ramos</div>
        <div class="cp-firma-dni">DNI 80625301</div>
      </div>
    </div>

    <div class="cp-footer-deco">✿ ✾ ✿ ✾ ✿ ✾ ✿</div>
    ${fechaVal ? `<p style="text-align:center; font-size:0.72rem; color:#999; margin-top:0.5rem;">Contrato generado el ${formatearFecha(fechaVal)}</p>` : ''}
  `;

  document.getElementById('contratoImprimible').innerHTML = html;
}

/* ─── CERRAR MODALES AL CLICK FUERA ─────── */
document.addEventListener('click', e => {
  const previewModal = document.getElementById('previewModal');
  const bdModal = document.getElementById('bdModal');
  if (e.target === previewModal) cerrarPreview();
  if (e.target === bdModal) cerrarBD();
});