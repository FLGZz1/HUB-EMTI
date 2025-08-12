const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const q = document.getElementById('q');
const turma = document.getElementById('turma');

let alunos = [];
let filtrados = [];

async function carregar() {
  try {
    const res = await fetch('data/alunos.json', { cache: 'no-store' });
    alunos = await res.json();
    filtrados = alunos.slice();
    render();
  } catch (e) {
    grid.innerHTML = '<p>Erro ao carregar a lista.</p>';
  }
}

function normalizar(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function aplicaFiltros() {
  const termo = normalizar(q.value);
  const fTurma = turma.value;

  filtrados = alunos.filter(a => {
    const texto = normalizar(`${a.nome} ${a.turma} ${a.descricao} ${(a.tags||[]).join(' ')}`);
    const passaBusca = termo ? texto.includes(termo) : true;
    const passaTurma = fTurma ? a.turma === fTurma : true;
    return passaBusca && passaTurma;
  });
}

function render() {
  grid.innerHTML = '';
  if (!filtrados.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const frag = document.createDocumentFragment();
  filtrados.forEach(a => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${a.nome}</h3>
      <div class="meta">Turma ${a.turma}</div>
      ${a.descricao ? `<p>${a.descricao}</p>` : ''}
      ${(a.tags && a.tags.length) ? `
        <div class="tags">
          ${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>` : ''
      }
      <div class="actions">
        <a class="btn" href="${a.site}" target="_blank" rel="noopener noreferrer">Visitar site</a>
        ${a.github ? `<a class="btn ghost" href="${a.github}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
      </div>
    `;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

q.addEventListener('input', () => { aplicaFiltros(); render(); });
turma.addEventListener('change', () => { aplicaFiltros(); render(); });

const btnToggle = document.getElementById('toggle-theme');
const body = document.body;

const temaSalvo = localStorage.getItem('tema');
if (temaSalvo === 'light') {
  body.classList.add('light-theme');
  btnToggle.textContent = '🌙';
} else {
  btnToggle.textContent = '☀️';
}

btnToggle.addEventListener('click', () => {
  body.classList.toggle('light-theme');

  if (body.classList.contains('light-theme')) {
    btnToggle.textContent = '🌙';
    localStorage.setItem('tema', 'light');
  } else {
    btnToggle.textContent = '☀️';
    localStorage.setItem('tema', 'dark');
  }
});

carregar();