'use strict';

// ---- Tabla de records local (localStorage) ----
const RECORDS_KEY = 'tetris.records';
const RECORDS_MAX = 5;
const NOMBRE_MAX = 12;

const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const recordsStartEl = document.getElementById('records-start');
const recordsOverEl = document.getElementById('records-over');

// Partida pendiente de guardar nombre: { score, lines, index } o null
let pendienteRecord = null;

function recordsVacios() {
  return { top: [], bestCombo: 0, maxLines: 0 };
}

function cargarRecords() {
  try {
    const data = JSON.parse(localStorage.getItem(RECORDS_KEY));
    if (!data || !Array.isArray(data.top)) return recordsVacios();
    return {
      top: data.top.filter(r => r && typeof r.name === 'string' && Number.isFinite(r.score) && Number.isFinite(r.lines)).slice(0, RECORDS_MAX),
      bestCombo: Number(data.bestCombo) || 0,
      maxLines: Number(data.maxLines) || 0,
    };
  } catch (e) {
    return recordsVacios();
  }
}

function guardarRecords(rec) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(rec));
  } catch (e) { /* localStorage no disponible: se ignora */ }
}

// Posición (0-based) que ocuparía la puntuación en el top, o -1 si no entra
function posicionEnTop(rec, puntos) {
  if (puntos <= 0) return -1;
  let i = rec.top.findIndex(r => puntos > r.score);
  if (i === -1) i = rec.top.length;
  return i < RECORDS_MAX ? i : -1;
}

function celda(texto, clase) {
  const td = document.createElement('td');
  td.textContent = texto;
  if (clase) td.className = clase;
  return td;
}

// Dibuja la tabla, estadísticas y botón de reset dentro de `cont`.
// `resaltar`: índice de la fila de la partida actual; `entrada`: si es true,
// esa fila contiene el campo de nombre en lugar de un nombre guardado.
function renderRecords(cont, rec, resaltar, entrada) {
  cont.textContent = '';
  const tabla = document.createElement('table');
  tabla.className = 'records-table';
  const filas = rec.top.slice();
  if (entrada && resaltar >= 0) filas.splice(resaltar, 0, null);
  const total = Math.min(RECORDS_MAX, filas.length);
  if (!total) {
    const tr = document.createElement('tr');
    const td = celda('Sin records todavía', 'records-vacio');
    td.colSpan = 4;
    tr.appendChild(td);
    tabla.appendChild(tr);
  }
  for (let i = 0; i < total; i++) {
    const tr = document.createElement('tr');
    if (i === resaltar) tr.className = 'records-actual';
    const r = filas[i];
    tr.appendChild(celda(i + 1 + '.', 'records-pos'));
    if (r) {
      tr.appendChild(celda(r.name));
      tr.appendChild(celda(r.score.toLocaleString(), 'records-num'));
      tr.appendChild(celda(r.lines + ' L', 'records-num'));
    } else {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'name-input';
      input.maxLength = NOMBRE_MAX;
      input.placeholder = 'Tu nombre';
      input.autocomplete = 'off';
      td.appendChild(input);
      tr.appendChild(td);
      tr.appendChild(celda(pendienteRecord.score.toLocaleString(), 'records-num'));
      tr.appendChild(celda(pendienteRecord.lines + ' L', 'records-num'));
    }
    tabla.appendChild(tr);
  }
  cont.appendChild(tabla);

  const stats = document.createElement('p');
  stats.className = 'records-stats';
  stats.textContent = `Mejor combo: ${rec.bestCombo} · Líneas máx.: ${rec.maxLines}`;
  cont.appendChild(stats);

  if (entrada) {
    const guardar = document.createElement('button');
    guardar.className = 'records-btn';
    guardar.textContent = 'Guardar';
    guardar.addEventListener('click', confirmarNombre);
    cont.appendChild(guardar);
  }

  cont.appendChild(crearReset(cont));
}

// Botón "Resetear records" con confirmación inline (sin confirm())
function crearReset(cont) {
  const caja = document.createElement('div');
  caja.className = 'records-reset';
  const btn = document.createElement('button');
  btn.className = 'records-btn records-btn-sec';
  btn.textContent = 'Resetear records';
  btn.addEventListener('click', () => {
    caja.textContent = '';
    const msg = document.createElement('span');
    msg.textContent = '¿Seguro? ';
    const si = document.createElement('button');
    si.className = 'records-btn records-btn-peligro';
    si.textContent = 'Sí';
    si.addEventListener('click', () => {
      try { localStorage.removeItem(RECORDS_KEY); } catch (e) { /* ignorar */ }
      pendienteRecord = null;
      refrescarRecords();
    });
    const no = document.createElement('button');
    no.className = 'records-btn records-btn-sec';
    no.textContent = 'No';
    no.addEventListener('click', () => {
      caja.textContent = '';
      caja.appendChild(btn);
    });
    caja.append(msg, si, no);
  });
  caja.appendChild(btn);
  return caja;
}

// Vuelve a pintar los bloques visibles tras un reset
function refrescarRecords() {
  const rec = cargarRecords();
  renderRecords(recordsStartEl, rec, -1, false);
  if (typeof gameOver !== 'undefined' && gameOver) mostrarRecordsFin(rec, -1);
}

function mostrarRecordsFin(rec, resaltar) {
  renderRecords(recordsOverEl, rec, resaltar, false);
}

// Guarda el nombre escrito (o "Anónimo") en la posición pendiente
function confirmarNombre() {
  if (!pendienteRecord) return;
  const input = document.getElementById('name-input');
  const name = (input && input.value.trim().slice(0, NOMBRE_MAX)) || 'Anónimo';
  const rec = cargarRecords();
  const pos = posicionEnTop(rec, pendienteRecord.score);
  if (pos === -1) { // otra pestaña llenó el top: ya no entra
    pendienteRecord = null;
    renderRecords(recordsOverEl, rec, -1, false);
    return;
  }
  const i = pos;
  rec.top.splice(i, 0, {
    name,
    score: pendienteRecord.score,
    lines: pendienteRecord.lines,
    date: new Date().toISOString().slice(0, 10),
  });
  rec.top = rec.top.slice(0, RECORDS_MAX);
  guardarRecords(rec);
  pendienteRecord = null;
  renderRecords(recordsOverEl, rec, i < RECORDS_MAX ? i : -1, false);
}

// Hook de game.js: se llama desde endGame()
function registrarFinPartida(puntos, lineas, comboMax) {
  document.getElementById('overlay').classList.add('fin');
  const rec = cargarRecords();
  rec.bestCombo = Math.max(rec.bestCombo, comboMax);
  rec.maxLines = Math.max(rec.maxLines, lineas);
  guardarRecords(rec);
  const pos = posicionEnTop(rec, puntos);
  if (pos >= 0) {
    pendienteRecord = { score: puntos, lines: lineas };
    renderRecords(recordsOverEl, rec, pos, true);
    const input = document.getElementById('name-input');
    if (input) input.focus();
  } else {
    pendienteRecord = null;
    renderRecords(recordsOverEl, rec, -1, false);
  }
}

// Hook de game.js: se llama desde init() con la partida ya en marcha
function ocultarInicio() {
  startOverlay.classList.add('hidden');
  document.getElementById('overlay').classList.remove('fin');
}

function mostrarInicio() {
  renderRecords(recordsStartEl, cargarRecords(), -1, false);
  startOverlay.classList.remove('hidden');
  startBtn.focus();
}

// Si se reinicia sin pulsar Guardar, se guarda con nombre por defecto
document.getElementById('restart-btn').addEventListener('click', confirmarNombre);

startBtn.addEventListener('click', () => { if (typeof init === 'function') init(); });

document.addEventListener('keydown', e => {
  if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    if (e.target && e.target.id === 'name-input') {
      e.preventDefault();
      confirmarNombre();
    } else if (!startOverlay.classList.contains('hidden') && e.target === document.body) {
      e.preventDefault();
      init();
    }
  }
});
