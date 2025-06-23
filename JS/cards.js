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
let cartasLevel = [];
let filtroRaridade = 'Todas';
let filtroSaga = 'Todas';
let filtroStatus = 'todos';
let ordenacao = 'id';

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

function calcularCartasNecessarias(nivel, raridade) {
    const nivelBase = nivelInicialPorRaridade(raridade);
    if (nivel === nivelBase) {
        const dadosBase = cartasLevel.find(n => n.Nivel === 1);
        return dadosBase ? dadosBase.Cartas : 999;
    } else {
        const dados = cartasLevel.find(n => n.Nivel === nivel);
        return dados ? dados.Cartas : 999;
    }
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

// ================== GERAR CARDS ==================

function gerarCards() {
    const container = document.getElementById('cards-grid');
    container.innerHTML = '';

    const cartasSalvas = JSON.parse(localStorage.getItem('cartas')) || {};
    let lista = personagens.slice();

    lista = lista.filter(carta => {
        const dados = cartasSalvas[carta["nº"]] || { quantidade: 0, nivel: nivelInicialPorRaridade(carta.Raridade) };
        const desbloqueado = dados.quantidade > 0;

        if (filtroRaridade !== 'Todas' && carta.Raridade !== filtroRaridade) return false;
        if (filtroSaga !== 'Todas' && carta.Saga !== filtroSaga) return false;
        if (filtroStatus === 'desbloqueados' && !desbloqueado) return false;
        if (filtroStatus === 'bloqueados' && desbloqueado) return false;
        return true;
    });

    lista.sort((a, b) => {
        const dadosA = cartasSalvas[a["nº"]] || { quantidade: 0, nivel: nivelInicialPorRaridade(a.Raridade) };
        const dadosB = cartasSalvas[b["nº"]] || { quantidade: 0, nivel: nivelInicialPorRaridade(b.Raridade) };

        switch (ordenacao) {
            case 'id': return parseInt(a["nº"]) - parseInt(b["nº"]);
            case 'nome': return a["Nome Completo"].localeCompare(b["Nome Completo"]);
            case 'nivel': return dadosB.nivel - dadosA.nivel;
            case 'hp': return b.HP - a.HP;
            case 'atk': return b.ATK - a.ATK;
            case 'custo': return b.CUSTO - a.CUSTO;
            default: return 0;
        }
    });

    lista.forEach(carta => {
        const card = document.createElement('div');
        card.className = 'card-item';

        const dados = cartasSalvas[carta["nº"]] || { quantidade: 0, nivel: nivelInicialPorRaridade(carta.Raridade) };
        const desbloqueado = dados.quantidade > 0;
        const corRaridade = corPorRaridade(carta.Raridade);

        const img = document.createElement('img');
        img.src = `Cards/Slide${carta["nº"]}.webp`;
        if (!desbloqueado) img.style.filter = 'grayscale(100%) brightness(0.4)';
        card.appendChild(img);

        const borda = document.createElement('div');
        borda.className = 'rarity-border';
        borda.style.borderColor = corRaridade;
        card.appendChild(borda);

        const nivelLabel = document.createElement('div');
        nivelLabel.className = 'card-nivel';
        nivelLabel.innerText = desbloqueado ? `Nível ${dados.nivel}` : 'Bloqueado';
        nivelLabel.style.color = corRaridade;
        card.appendChild(nivelLabel);

        const qtdAtual = dados.quantidade;
        const qtdNecessaria = calcularCartasNecessarias(dados.nivel, carta.Raridade);
        const porcentagem = Math.min((qtdAtual / qtdNecessaria) * 100, 100);

        const progressContainer = document.createElement('div');
        progressContainer.className = 'card-progress-container';

        const progressFill = document.createElement('div');
        progressFill.className = 'card-progress-fill';
        progressFill.style.width = `${porcentagem}%`;

        const progressText = document.createElement('div');
        progressText.className = 'card-progress-text';
        progressText.innerText = `${qtdAtual} / ${qtdNecessaria}`;

        progressContainer.appendChild(progressFill);
        progressContainer.appendChild(progressText);
        card.appendChild(progressContainer);

        card.onclick = () => adicionarNoDeck(carta, desbloqueado);

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

// ================== DECK ==================

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

// ================== DROPDOWN ==================

function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    const isOpen = dropdown.style.display === 'block';

    // Fecha todos os dropdowns
    document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');

    // Se não estava aberto, abre
    if (!isOpen) {
        dropdown.style.display = 'block';
    }
}

// Fecha dropdowns ao clicar fora
window.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown button')) {
        document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
    }
});


// ================== FILTROS E ORDENAÇÃO ==================

function filtrarPorRaridade(raridade) {
    filtroRaridade = raridade;
    gerarCards();
}

function filtrarPorSaga(saga) {
    filtroSaga = saga;
    gerarCards();
}

function filtrarPorStatus(status) {
    filtroStatus = status;
    gerarCards();
}

function ordenarPor(tipo) {
    ordenacao = tipo;
    gerarCards();
}
