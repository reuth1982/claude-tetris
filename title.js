// Dibuja el título "TETRIS" con bloques, usando los colores de las piezas.
(function () {
  const LETTERS = {
    T: ['111', '010', '010', '010', '010'],
    E: ['111', '100', '110', '100', '111'],
    R: ['110', '101', '110', '101', '101'],
    I: ['111', '010', '010', '010', '111'],
    S: ['011', '100', '010', '001', '110'],
  };
  const COLORS = ['#e57373', '#ffb74d', '#ffd54f', '#81c784', '#4dd0e1', '#ba68c8'];

  const title = document.getElementById('title');
  'TETRIS'.split('').forEach((ch, i) => {
    const letter = document.createElement('div');
    letter.className = 'title-letter';
    letter.setAttribute('aria-hidden', 'true');
    LETTERS[ch].join('').split('').forEach((cell) => {
      const block = document.createElement('span');
      if (cell === '1') {
        block.className = 'title-block';
        block.style.background = COLORS[i];
      }
      letter.appendChild(block);
    });
    title.appendChild(letter);
  });
})();
