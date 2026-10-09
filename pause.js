'use strict';

// ---- Menú de pausa ----
const pauseMenu = document.getElementById('pause-menu');
const pauseMain = document.getElementById('pause-main');
const pauseControls = document.getElementById('pause-controls');
const pauseLevel = document.getElementById('pause-level');
const pauseResume = document.getElementById('pause-resume');
const pauseRestart = document.getElementById('pause-restart');
const pauseControlsBtn = document.getElementById('pause-controls-btn');
const pauseBack = document.getElementById('pause-back');

for (let n = 1; n <= 10; n++) {
  const opt = document.createElement('option');
  opt.value = n;
  opt.textContent = n;
  pauseLevel.appendChild(opt);
}

function showPauseView(controls) {
  pauseMain.classList.toggle('hidden', controls);
  pauseControls.classList.toggle('hidden', !controls);
  (controls ? pauseBack : pauseResume).focus();
}

function openPauseMenu() {
  pauseLevel.value = startLevel;
  pauseMenu.classList.remove('hidden');
  showPauseView(false);
}

function closePauseMenu() {
  if (pauseMenu.classList.contains('hidden')) return;
  pauseMenu.classList.add('hidden');
  if (document.activeElement && pauseMenu.contains(document.activeElement)) document.activeElement.blur();
}

pauseResume.addEventListener('click', togglePause);
pauseRestart.addEventListener('click', init);
pauseControlsBtn.addEventListener('click', () => showPauseView(true));
pauseBack.addEventListener('click', () => showPauseView(false));
pauseLevel.addEventListener('change', () => { startLevel = Number(pauseLevel.value); });

// Atrapa el foco dentro del menú mientras está abierto
pauseMenu.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    // Esc en "Ver controles" vuelve al menú; en el selector solo cierra el desplegable
    if (!pauseControls.classList.contains('hidden')) { e.stopPropagation(); showPauseView(false); }
    else if (e.target === pauseLevel) e.stopPropagation();
    return;
  }
  if (e.code !== 'Tab') return;
  const items = [...pauseMenu.querySelectorAll('button, select')].filter(el => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
