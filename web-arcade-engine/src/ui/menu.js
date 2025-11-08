// ============================================================
// ui/menu.js - game selection menu
// ============================================================

export function buildMenu(games) {
  const menu = document.createElement('div');
  menu.className = 'menu';
  menu.innerHTML = `
    <h1>🎮 Web Arcade</h1>
    <ul>
      ${games.map(g => `<li><button data-game="${g.id}">${g.name}</button></li>`).join('')}
    </ul>
  `;
  document.body.appendChild(menu);

  return new Promise(resolve => {
    menu.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        menu.remove();
        resolve(btn.dataset.game);
      });
    });
  });
}
