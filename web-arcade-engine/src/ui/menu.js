
// Modern card-grid menu
export function buildMenu(games) {
  const root = document.createElement('div');
  root.className = 'container';

  const header = document.createElement('div');
  header.className = 'header';
  header.innerHTML = `
    <div class="brand">
      <div class="logo"></div>
      <div>
        <h1>Web Arcade</h1>
        <div class="subtitle">Fast little games. One shared engine.</div>
      </div>
    </div>
  `;

  const menu = document.createElement('div');
  menu.className = 'menu';
  const grid = document.createElement('div');
  grid.className = 'grid';

  games.forEach(g => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${g.name}</h3>
      <p>${g.desc || ''}</p>
      <div class="meta">
        <span class="badge ${g.ready ? '' : 'dim'}">${g.ready ? 'Playable' : 'Coming soon'}</span>
        <span style="font-size:12px;color:#93acc2">${g.length || ''}</span>
      </div>
      <button ${g.ready ? '' : 'disabled style="opacity:.7;cursor:not-allowed"'} data-game="${g.id}">${g.ready ? 'Play' : 'Unavailable'}</button>
    `;
    grid.appendChild(card);
  });

  menu.appendChild(grid);

  const footer = document.createElement('div');
  footer.className = 'footer';
  footer.textContent = 'Powered by web-arcade-engine';

  root.appendChild(header);
  root.appendChild(menu);
  root.appendChild(footer);
  document.body.appendChild(root);

  return new Promise(resolve => {
    root.querySelectorAll('button[data-game]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(root);
        resolve(btn.dataset.game);
      });
    });
  });
}
