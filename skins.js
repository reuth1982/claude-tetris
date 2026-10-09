'use strict';

// Skins visuales. Cada skin = { colors, bg, grid, drawBlock }.
// Se carga antes de game.js; game.js delega en `activeSkin`.

const SKIN_KEY = 'tetris.skin';

// Dibuja un rectángulo con esquinas redondeadas
function skinRoundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

const SKINS = {
  retro: {
    label: 'Retro',
    colors: [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#7986cb', '#ffb74d'],
    bg: '#1a1a25',
    grid: '#22222e',
    drawBlock(context, x, y, color, size) {
      context.fillStyle = color;
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
    },
  },

  neon: {
    label: 'Neon',
    colors: [null, '#00f0ff', '#fff200', '#d400ff', '#39ff14', '#ff1744', '#4d6bff', '#ff9100'],
    bg: '#000000',
    grid: '#14141c',
    drawBlock(context, x, y, color, size) {
      context.shadowColor = color;
      context.shadowBlur = 12;
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.fillStyle = color + '59'; // relleno a ~35% sin tocar globalAlpha
      context.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      // el llamador restablece globalAlpha; aquí se limpia el glow
      context.shadowBlur = 0;
      context.shadowColor = 'transparent';
    },
  },

  pastel: {
    label: 'Pastel',
    colors: [null, '#a8e6ef', '#fff1b8', '#e0c3f0', '#c5eccb', '#f7c4c4', '#c5cbf2', '#fcd9b0'],
    bg: '#fdf6f0',
    grid: '#eadfd6',
    drawBlock(context, x, y, color, size) {
      context.fillStyle = color;
      skinRoundRect(context, x * size + 2, y * size + 2, size - 4, size - 4, 8);
      context.fill();
      context.fillStyle = 'rgba(255,255,255,0.45)';
      skinRoundRect(context, x * size + 6, y * size + 5, size - 12, 4, 2);
      context.fill();
    },
  },

  pixel: {
    label: 'Pixel art',
    colors: [null, '#29b6f6', '#fbc02d', '#8e44ad', '#43a047', '#e53935', '#3949ab', '#fb8c00'],
    bg: '#101820',
    grid: '#1a2530',
    drawBlock(context, x, y, color, size) {
      const px = x * size, py = y * size, u = size / 6;
      context.fillStyle = '#000';
      context.fillRect(px, py, size, size);
      context.fillStyle = color;
      context.fillRect(px + 2, py + 2, size - 4, size - 4);
      // textura: damero de "píxeles" claros y oscuros
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if ((i + j) % 2) continue;
          context.fillStyle = (i + j) % 4 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)';
          context.fillRect(px + 2 + i * (u - 0.4), py + 2 + j * (u - 0.4), u - 0.4, u - 0.4);
        }
      }
    },
  },
};

let activeSkin = SKINS.retro;

function loadSkinName() {
  try {
    const n = localStorage.getItem(SKIN_KEY);
    if (n && SKINS[n]) return n;
  } catch (e) { /* localStorage no disponible */ }
  return 'retro';
}

// Aplica la skin: fondo de canvas, atributo data-skin y redibujado en caliente
function applySkin(name, persist) {
  if (!SKINS[name]) name = 'retro';
  activeSkin = SKINS[name];
  document.body.setAttribute('data-skin', name);
  const sel = document.getElementById('skin-select');
  if (sel) sel.value = name;
  const bgCanvas = [document.getElementById('board'), document.getElementById('next-canvas')];
  bgCanvas.forEach(c => { if (c) c.style.background = activeSkin.bg; });
  if (persist) {
    try { localStorage.setItem(SKIN_KEY, name); } catch (e) { /* ignorar */ }
  }
  // game.js aún no cargado en la primera llamada
  if (typeof draw === 'function' && typeof current !== 'undefined' && current) {
    draw();
    drawNext();
  }
}

(function () {
  const sel = document.getElementById('skin-select');
  if (sel) {
    sel.addEventListener('change', () => {
      applySkin(sel.value, true);
      sel.blur(); // evita que flechas/Space sigan cambiando el selector
    });
    // Si el selector conserva el foco (p. ej. se cerró sin cambiar), lo soltamos
    // antes de que la tecla actúe sobre él; el keydown del juego sigue funcionando.
    document.addEventListener('keydown', () => {
      if (document.activeElement === sel) sel.blur();
    }, true);
  }
  applySkin(loadSkinName(), false);
})();
