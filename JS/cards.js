// ================== INICIALIZAÇÃO ==================

window.addEventListener('DOMContentLoaded', async () => {
    await carregarPersonagens();
    carregarDeck();
    atualizarRecursos();
    carregarXP();
    gerarDeck();
    gerarCards();
});

// ================== VARIÁVEIS ==================

let personagens = [];
const deck = [];

// ================== FUNÇÕES ==================

// Navegação
function goTo(page) {
    window.location.href = page;
}

// Recursos
function atualizarRecursos() {
    document.getElementById('coin-amount').innerText = localStorage.getItem('coin') || 0;
    document.getElementById('gem-amount').innerText = localStorage.getItem('gem') || 0;
}

// XP
async function carregarXP() {
    const response = await fetch('JSON/level.json');
    const levels = await response.json();

    const xpAtual = parseInt(localStorage.getItem('xp')) || 0;

    let nivelAtual = 1;
    let xpBase = 0;
    let xpProximo = 0;

    for (let i = 0; i < levels.length; i++) {
        if (xpAtual >= levels[i].XP) {
            nivelAtual = levels[i].Nivel;
            xpBase = levels[i].XP;
            xpProximo = levels[i + 1] ? levels[i + 1].XP : xpBase + 1000;
        } else {
            break;
        }
    }

    const xpParaProximo = xpProximo > xpBase ? xpProximo - xpBase : 20;
    const xpAtualNoNivel = xpAtual - xpBase;
    const porcentagem = Math.min((xpAtualNoNivel / xpParaProximo) * 100, 100);

    document.getElementById('xp-level').innerText = nivelAtual;
    document.getElementById('xp-bar-fill').style.width = `${porcentagem}%`;
    document.getElementById('xp-bar-text').innerText = `${xpAtualNoNivel} / ${xpParaProximo}`;
}

// ================== PERSONAGENS ==================

async function carregarPersonagens() {
    const response = await fetch('JSON/personagens.json');
    personagens = await response.json();
}

// ================== DECK ==================

function gerarDeck() {
    const container = document.getElementById('deck-slots');
    container.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'deck-slot';

        if (deck[i]) {
            const img = document.createElement('img');
            img.src = `Cards/Slide${deck[i]["nº"]}.PNG`;
            slot.appendChild(img);

            slot.onclick = () => {
                deck.splice(i, 1);
                gerarDeck();
                salvarDeck();
            };
        } else {
            slot.classList.add('empty');
        }

        container.appendChild(slot);
    }
}

function salvarDeck() {
    localStorage.setItem('deck', JSON.stringify(deck));
}

function carregarDeck() {
    const deckSalvo = JSON.parse(localStorage.getItem('deck')) || [];
    deck.push(...deckSalvo);
}

// ================== CARTAS ==================

function gerarCards() {
    const container = document.getElementById('cards-grid');
    container.innerHTML = '';

    personagens.forEach(carta => {
        const card = document.createElement('div');
        card.className = 'card-item';

        const desbloqueado = true;

        if (!desbloqueado) card.classList.add('locked');

        const img = document.createElement('img');
        img.src = `Cards/Slide${carta["nº"]}.PNG`;

        // 🔥 Borda de raridade
        const borda = document.createElement('div');
        borda.className = 'rarity-border';

        if (corPorRaridade(carta.Raridade) === 'gradient') {
            borda.classList.add('rainbow-border');
        } else {
            borda.style.borderColor = corPorRaridade(carta.Raridade);
        }

        // 🔥 Montagem do card
        card.appendChild(img);
        card.appendChild(borda);

        const label = document.createElement('div');
        label.className = 'label';
        label.innerText = desbloqueado ? carta["Nome Completo"] : 'Bloqueada';
        card.appendChild(label);

        card.onclick = () => adicionarNoDeck(carta, desbloqueado);

        container.appendChild(card);
    });
}

// ================== RARIDADE ==================

function corPorRaridade(r) {
    switch (r) {
        case 'Normal': return '#9E9E9E'; // Cinza
        case 'Raro': return '#2196F3'; // Azul
        case 'Super Raro': return '#FF3300'; // Vermelho
        case 'Ultra Raro': return '#FFD700'; // Dourado
       case 'Lendario': return '#FF00FF'; // Rosa
    }
}

// ================== ADICIONAR NO DECK ==================

function adicionarNoDeck(carta, desbloqueado) {
    if (!desbloqueado) return;

    if (deck.length < 8) {
        deck.push(carta);
        gerarDeck();
        salvarDeck();
    } else {
        alert('Deck cheio! Clique em uma carta do deck para remover.');
    }
}