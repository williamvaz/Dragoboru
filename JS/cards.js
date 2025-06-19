// ================== INICIALIZAÇÃO ==================

window.addEventListener('DOMContentLoaded', async () => {
    await carregarPersonagens();
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

// Carregar JSON dos personagens
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

            // Remover carta do deck ao clicar no slot
            slot.onclick = () => {
                deck.splice(i, 1);
                gerarDeck();
            };
        } else {
            slot.classList.add('empty');
        }

        container.appendChild(slot);
    }
}

// ================== CARTAS ==================

function gerarCards() {
    const container = document.getElementById('cards-grid');
    container.innerHTML = '';

    personagens.forEach(carta => {
        const card = document.createElement('div');
        card.className = 'card-item';

        // Simular desbloqueio — trocar por sua lógica real depois
        const desbloqueado = true; // ou false para testar

        if (!desbloqueado) card.classList.add('locked');

        const img = document.createElement('img');
        img.src = `Cards/Slide${carta["nº"]}.PNG`;
        card.appendChild(img);

        const borda = document.createElement('div');
        borda.className = 'rarity-border';
        borda.style.borderColor = corPorRaridade(carta.Raridade);
        card.appendChild(borda);

        const label = document.createElement('div');
        label.className = 'label';
        label.innerText = desbloqueado ? carta["Nome Completo"] : 'Bloqueada';
        card.appendChild(label);

        card.onclick = () => adicionarNoDeck(carta, desbloqueado);

        container.appendChild(card);
    });
}

function corPorRaridade(r) {
    switch (r) {
        case 'Normal': return 'gray';
        case 'Raro': return 'green';
        case 'Super Raro': return 'gold';
        case 'Ultra Raro': return 'purple';
        case 'Lendario': return 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)';
        default: return 'white';
    }
}

function adicionarNoDeck(carta, desbloqueado) {
    if (!desbloqueado) return;

    if (deck.length < 8) {
        deck.push(carta);
        gerarDeck();
    } else {
        alert('Deck cheio! Clique em uma carta do deck para remover.');
    }
}
