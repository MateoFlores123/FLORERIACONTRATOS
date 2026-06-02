/* ═══════════════════════════════════════════
   FLORERÍA SHALOM — app.js
   ═══════════════════════════════════════════ */

let seccionCount = 0;
let firmaDataURL = null; // Base64 de la firma cargada

/* ─── INICIALIZAR ─────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Fecha por defecto: ahora
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('fecha').value =
    `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Cargar firma guardada en localStorage (persiste entre sesiones)
  const firmaSaved = localStorage.getItem('shalom_firma');
  if (firmaSaved) {
    firmaDataURL = firmaSaved;
    mostrarFirmaPreview(firmaSaved);
  }

  // Agregar primera sección por defecto
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

  // Primera fila automática
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
      <input type="text" placeholder="Descripción del arreglo" />
    </td>
    <td class="col-puni">
      <input type="number" min="0" step="0.01" value="0.00"
        onchange="calcularFila('${rowId}')" oninput="calcularFila('${rowId}')" />
    </td>
    <td class="col-ptot">
      <input type="number" min="0" step="0.01" value="0.00" readonly
        style="color: var(--terra-dark); font-weight:700" />
    </td>
    <td class="col-del">
      <button class="btn-remove" onclick="eliminarFila('${rowId}')">✕</button>
    </td>
  `;
  tbody.appendChild(tr);
}

/* ─── CALCULAR FILA ──────────────────────── */
function calcularFila(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const inputs = row.querySelectorAll('input[type="number"]');
  const cant  = parseFloat(inputs[0].value) || 0;
  const puni  = parseFloat(inputs[1].value) || 0;
  const total = cant * puni;
  inputs[2].value = total.toFixed(2);
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

  // Suma todos los precios totales de todas las secciones
  document.querySelectorAll('.items-table tbody tr').forEach(row => {
    const inputs = row.querySelectorAll('input[type="number"]');
    if (inputs.length >= 3) {
      subtotal += parseFloat(inputs[2].value) || 0;
    }
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

/* ─── FIRMA: CARGAR IMAGEN ───────────────── */
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

/* ─── FIRMA: QUITAR ──────────────────────── */
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

/* ─── FORMATEAR FECHA ────────────────────── */
function formatearFecha(val) {
  if (!val) return '';
  const d = new Date(val);
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const hora = d.toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit', hour12: false });
  return `${dia} de ${mes.charAt(0).toUpperCase()+mes.slice(1)} — ${hora}`;
}

/* ─── OBTENER DATOS DE SECCIONES ─────────── */
function obtenerSecciones() {
  const secciones = [];
  document.querySelectorAll('.seccion-arreglo').forEach(sec => {
    const titulo = sec.querySelector('.sec-titulo').value || 'Sin título';
    const filas = [];
    sec.querySelectorAll('tbody tr').forEach(row => {
      const inputs = row.querySelectorAll('input');
      const cant  = inputs[0]?.value || '';
      const desc  = inputs[1]?.value || '';
      const puni  = parseFloat(inputs[2]?.value) || 0;
      const ptot  = parseFloat(inputs[3]?.value) || 0;
      if (desc || cant) {
        filas.push({ cant, desc, puni, ptot });
      }
    });
    if (filas.length) secciones.push({ titulo, filas });
  });
  return secciones;
}

/* ─── ABRIR PREVIEW ──────────────────────── */
function abrirPreview() {
  generarContrato();
  document.getElementById('previewModal').style.display = 'flex';
}

/* ─── CERRAR PREVIEW ─────────────────────── */
function cerrarPreview() {
  document.getElementById('previewModal').style.display = 'none';
}

/* ─── IMPRIMIR ───────────────────────────── */
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

/* ─── GENERAR BLOB PNG DEL CONTRATO ─────── */
async function generarBlob() {
  const el = document.getElementById('contratoImprimible');
  setExportando(true);
  try {
    const canvas = await html2canvas(el, {
      scale: 2,           // alta resolución
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: el.scrollWidth,
    });
    return await new Promise(res => canvas.toBlob(res, 'image/png'));
  } finally {
    setExportando(false);
  }
}

/* ─── DESCARGAR COMO IMAGEN ──────────────── */
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

/* ─── COMPARTIR (WhatsApp, email, etc.) ─── */
async function compartir() {
  const nombre = document.getElementById('nombreCliente').value.trim() || 'cliente';
  const blob   = await generarBlob();
  const file   = new File([blob], `contrato-${nombre.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });

  // Web Share API — disponible en móviles modernos y Chrome/Edge en PC
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Contrato Florería Shalom — ${nombre}`,
        text: `Contrato de arreglos florales para ${nombre}`,
        files: [file],
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return; // usuario canceló
    }
  }

  // Fallback: si el navegador no soporta compartir archivos,
  // abre WhatsApp Web con un mensaje (sin imagen, la imagen se descarga primero)
  const blob2  = await generarBlob();
  const url    = URL.createObjectURL(blob2);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `contrato-${nombre.replace(/\s+/g, '-').toLowerCase()}.png`;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    const msg = encodeURIComponent(`Hola! Te adjunto el contrato de arreglos florales — Florería Shalom`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }, 800);
}

/* ─── GENERAR HTML DEL CONTRATO ──────────── */
function generarContrato() {
  const trato       = document.querySelector('input[name="trato"]:checked')?.value || 'Sr.';
  const nombre      = document.getElementById('nombreCliente').value || '_______________';
  const dni         = document.getElementById('dniCliente').value || '__________';
  const adelanto    = parseFloat(document.getElementById('adelanto').value) || 0;
  const fechaVal    = document.getElementById('fecha').value;
  const colores     = document.getElementById('colores').value || '';
  const transDesc   = document.getElementById('transporteDesc').value;
  const transMonto  = parseFloat(document.getElementById('transporteMonto').value) || 0;
  const descuento   = parseFloat(document.getElementById('descuento').value) || 0;
  const cci         = document.getElementById('cci').value;
  const cuenta      = document.getElementById('cuentaCorriente').value;
  const secciones   = obtenerSecciones();

  // Recalcular
  let subtotal = 0;
  secciones.forEach(s => s.filas.forEach(f => subtotal += f.ptot));
  const totalDeco = subtotal + transMonto - descuento;
  const saldo     = totalDeco - adelanto;

  /* ── Tabla de items por sección ── */
  let tablasHtml = '';
  secciones.forEach(sec => {
    const filasMarcadas = sec.filas.map(f => `
      <tr>
        <td>${f.cant}</td>
        <td>${f.desc}</td>
        <td class="r">S/.${f.puni.toFixed(2)}</td>
        <td class="r">S/.${f.ptot.toFixed(2)}</td>
      </tr>
    `).join('');

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
          ${transMonto > 0 && secciones.indexOf(sec) === secciones.length - 1 ? `
          <tr>
            <td colspan="2">Transporte${transDesc ? ' — ' + transDesc : ''}</td>
            <td class="r"></td>
            <td class="r">S/.${transMonto.toFixed(2)}</td>
          </tr>` : ''}
          ${descuento > 0 && secciones.indexOf(sec) === secciones.length - 1 ? `
          <tr>
            <td colspan="2">Descuento</td>
            <td class="r"></td>
            <td class="r">-S/.${descuento.toFixed(2)}</td>
          </tr>` : ''}
          ${secciones.indexOf(sec) === secciones.length - 1 ? `
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
        <tr>
          <td><strong>TOTAL DECORACIÓN</strong></td>
          <td>S/${totalDeco.toFixed(2)}</td>
        </tr>
        <tr>
          <td><strong>A CUENTA</strong></td>
          <td>S/${adelanto.toFixed(2)}</td>
        </tr>
        <tr class="saldo-row">
          <td><strong>SALDO TOTAL</strong></td>
          <td><strong>S/.${saldo.toFixed(2)}</strong></td>
        </tr>
        <tr class="cuenta-row">
          <td>N° CCI "BCP"</td>
          <td><strong>${cci}</strong></td>
        </tr>
        <tr class="cuenta-row">
          <td>N° CUENTA CORRIENTE "BCP"</td>
          <td><strong>${cuenta}</strong></td>
        </tr>
      </tbody>
    </table>
  `;

  /* ── HTML completo del contrato ── */
  const html = `
    <div class="cp-header">
      <span class="cp-flowers">✿ ✾ ✿ ✾ ✿ ✾ ✿ ✾ ✿ ✾ ✿</span>
      <div class="cp-nombre-floreria">FLORERÍA <em>"SHALOM"</em></div>
      <div class="cp-contact">De: Martin Flores Ramos &nbsp;|&nbsp; N° Telef. 993708614</div>
    </div>

    <p class="cp-title">CONTRATO</p>

    <p class="cp-meta"><strong>FECHA:</strong> ${formatearFecha(fechaVal)}</p>
    ${colores ? `<p class="cp-meta"><strong>COLORES:</strong> ${colores}</p>` : ''}

    <p class="cp-narrativa">
      *Yo Martin Mario Flores Ramos con DNI 80625301 recibí de ${trato} <strong>${nombre}</strong>
      identificado(a) con DNI <strong>${dni}</strong> la cantidad de
      <strong>${adelanto.toFixed(2)} soles</strong> por concepto de adelanto de los arreglos florales
      que se entregarán en la fecha indicada. A continuación describimos el total de arreglos florales:
    </p>

    ${tablasHtml}

    ${resumenHtml}

    <div class="cp-firma">
      <div class="cp-firma-box">
        ${firmaDataURL
          ? `<img class="cp-firma-img" src="${firmaDataURL}" alt="Firma" />`
          : '<br/><br/>'
        }
        <div class="cp-firma-linea"></div>
        <div class="cp-firma-nombre">Martin Flores Ramos</div>
        <div class="cp-firma-dni">DNI 80625301</div>
      </div>
    </div>

    <div class="cp-footer-deco">✿ ✾ ✿ ✾ ✿ ✾ ✿</div>
  `;

  document.getElementById('contratoImprimible').innerHTML = html;
}

/* ─── CERRAR MODAL AL HACER CLICK FUERA ─── */
document.addEventListener('click', e => {
  const modal = document.getElementById('previewModal');
  if (e.target === modal) cerrarPreview();
});