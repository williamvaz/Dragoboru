// JS - loja.js

// Navegação entre telas
function goTo(page) {
  window.location.href = page;
}

// Atualiza valores visuais de recursos (moeda, gemas, xp)
function atualizarRecursos() {
  document.getElementById('coin').innerText = localStorage.getItem('coin') || 0;
  document.getElementById('gem').innerText = localStorage.getItem('gem') || 0;
  document.getElementById('xp').innerText = localStorage.getItem('xp') || 0;
}

// Processa a compra
function processarCompra(preco, tipo, botao) {
  if (tipo === 'free') {
    botao.disabled = true;
    botao.innerText = 'Resgatado!';
    botao.classList.add('desativado');
    // Aqui você pode chamar uma função para adicionar carta aleatória
    return;
  }

  let saldo = parseInt(localStorage.getItem(tipo) || '0');
  if (saldo >= preco) {
    saldo -= preco;
    localStorage.setItem(tipo, saldo);
    atualizarRecursos();
    botao.innerText = 'Comprado!';
    botao.disabled = true;
    botao.classList.add('desativado');
    // Aqui você pode chamar uma função para abrir pacote
  } else {
    alert('Saldo insuficiente.');
  }
}

// Evento ao carregar
window.addEventListener('DOMContentLoaded', () => {
  atualizarRecursos();

  document.querySelectorAll('.comprar').forEach(botao => {
    botao.addEventListener('click', () => {
      const preco = parseInt(botao.dataset.preco);
      const tipo = botao.dataset.tipo;
      processarCompra(preco, tipo, botao);
    });
  });
});
