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

// Carregar JSON dos personagens
async function carregarPersonagens() {
    const response = await fetch('JSON/personagens.json');
    personagens = await response.json();
}

// ================== DECK ==================

// Gerar deck na tela
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
                salvarDeck();
            };
        } else {
            slot.classList.add('empty');
        }

        container.appendChild(slot);
    }
}

// Salvar deck no localStorage
function salvarDeck() {
    localStorage.setItem('deck', JSON.stringify(deck));
}

// Carregar deck salvo
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

        // 🔥 Desbloqueio simulado (sempre desbloqueado por enquanto)
        const desbloqueado = true;

        if (!desbloqueado) card.classList.add('locked');

        const img = document.createElement('img');
        img.src = `Cards/Slide${carta["nº"]}.PNG`;
        card.appendChild(img);

        const borda = document.createElement('div');
        borda.className = 'rarity-border';

        if (corPorRaridade(carta.Raridade) === 'gradient') {
            borda.classList.add('rainbow-border');
        } else {
            borda.style.borderColor = corPorRaridade(carta.Raridade);
        }

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
        case 'Lendario': return 'gradient'; // Tratado via classe CSS
        default: return '#FF00FF';
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