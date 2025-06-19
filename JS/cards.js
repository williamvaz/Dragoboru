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
let cartasLevel = []; // 🔥 Vai carregar cartas.json

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

    const cartasResponse = await fetch('JSON/cartas.json');
    cartasLevel = await cartasResponse.json();

    // 🔥 Se não existe localStorage de cartas, criar
    if (!localStorage.getItem('cartas')) {
        const cartas = {};
        personagens.forEach(p => {
            let nivelInicial = nivelInicialPorRaridade(p.Raridade);
            cartas[p["nº"]] = { quantidade: 0, nivel: nivelInicial };
        });
        localStorage.setItem('cartas', JSON.stringify(cartas));
    }
}

// ================== FUNÇÕES DE CARTAS ==================

function nivelInicialPorRaridade(raridade) {
    switch (raridade) {
        case 'Raro': return 3;
        case 'Super Raro': return 5;
        case 'Ultra Raro': return 7;
        case 'Lendario': return 9;
        default: return 1;
    }
}

function calcularCartasNecessarias(nivel) {
    const nivelData = cartasLevel.find(n => n.Nivel === nivel);
    return nivelData ? nivelData.Cartas : 999;
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
            img.src = `Cards/Slide${deck[i]["nº"]}.webp`;
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

// ================== GERAR CARTAS ==================

function gerarCards() {
    const container = document.getElementById('cards-grid');
    container.innerHTML = '';

    const cartasSalvas = JSON.parse(localStorage.getItem('cartas')) || {};

    personagens.forEach(carta => {
        const card = document.createElement('div');
        card.className = 'card-item';

        const dadosCarta = cartasSalvas[carta["nº"]] || { quantidade: 0, nivel: nivelInicialPorRaridade(carta.Raridade) };

        const img = document.createElement('img');
        img.src = `Cards/Slide${carta["nº"]}.webp`;
        card.appendChild(img);

        const borda = document.createElement('div');
        borda.className = 'rarity-border';
        borda.style.borderColor = corPorRaridade(carta.Raridade);
        card.appendChild(borda);

        const label = document.createElement('div');
        label.className = 'label';
        label.innerText = carta["Nome Completo"];
        card.appendChild(label);

        const qtdAtual = dadosCarta.quantidade;
        const qtdNecessaria = calcularCartasNecessarias(dadosCarta.nivel);

        const contador = document.createElement('div');
        contador.className = 'card-count';
        contador.innerText = `${qtdAtual} / ${qtdNecessaria}`;
        card.appendChild(contador);

        card.onclick = () => adicionarNoDeck(carta, true);

        container.appendChild(card);
    });
}

// ================== RARIDADE ==================

function corPorRaridade(r) {
    switch (r) {
        case 'Normal': return '#9E9E9E';
        case 'Raro': return '#2196F3';
        case 'Super Raro': return '#FF3300';
        case 'Ultra Raro': return '#FFD700';
        case 'Lendario': return '#FF00FF';
        default: return 'white';
    }
}

function nivelInicialPorRaridade(raridade) {
    switch (raridade) {
        case 'Normal': return 1;
        case 'Raro': return 3;
        case 'Super Raro': return 5;
        case 'Ultra Raro': return 7;
        case 'Lendario': return 9;
        default: return 1;
    }
}

// ================== ADICIONAR NO DECK ==================

function mostrarPopupAviso(mensagem) {
    document.getElementById('popup-aviso-message').innerText = mensagem;
    document.getElementById('popup-aviso').style.display = 'flex';
}

function fecharPopupAviso() {
    document.getElementById('popup-aviso').style.display = 'none';
}

function adicionarNoDeck(carta, desbloqueado) {
    if (!desbloqueado) return;

    if (deck.length < 8) {
        deck.push(carta);
        gerarDeck();
        salvarDeck();
    } else {
        mostrarPopupAviso('Deck cheio! Clique em uma carta do deck para remover.');
    }
}
