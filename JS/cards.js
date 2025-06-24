// ================== INICIALIZAÇÃO ==================
window.addEventListener('DOMContentLoaded', async () => {
    await carregarPersonagens();
    await carregarClasses();
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
let classeStats = [];
let filtroRaridade = 'Todas';
let filtroSaga = 'Todas';
let filtroStatus = 'todos';
let ordenacao = 'id';

// ================== FUNÇÕES ==================

// Navegação
function goTo(page) {
    window.location.href = page;
}

// Info das cards
async function carregarAtaques() {
    const response = await fetch('JSON/ataques.json');
    return await response.json();
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

// ================== CARREGAMENTO ==================

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

async function carregarClasses() {
    const response = await fetch('JSON/classe.json');
    classeStats = await response.json();
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
        // Sempre usa o requisito de nível 1
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

// ================== CARREGAR ATAQUES ==================
async function carregarAtaques() {
    const response = await fetch('JSON/ataques.json');
    return await response.json();
}

async function abrirPopupDetalhes(carta) {
    const ataques = await carregarAtaques();

    const cartasSalvas = JSON.parse(localStorage.getItem('cartas')) || {};
    const dados = cartasSalvas[carta["nº"]] || { quantidade: 0, nivel: nivelInicialPorRaridade(carta.Raridade) };
    const atk = carta.ATK;
    const raridade = carta.Raridade;
    const nivel = dados.nivel;
    const custo = carta.CUSTO;
    const hp = carta.HP;

    document.getElementById('popup-detalhes').style.display = 'flex';
    document.getElementById('popup-detalhes-img').src = `Cards/Slide${carta["nº"]}.webp`;
    document.getElementById('popup-detalhes-nome').innerText = carta["Nome Completo"];
    document.getElementById('popup-detalhes-logo').src = `Logos/${carta.Saga}.png`;

    const statSpans = document.querySelectorAll('.popup-detalhes-direita .stat-box span');
    statSpans[0].innerText = custo;
    statSpans[1].innerText = hp;
    statSpans[2].innerText = nivel;

    const overlayImg = document.getElementById('popup-overlay-img');
    const overlayText = document.getElementById('popup-overlay-text');

    if (ordenacao === 'atk') {
        overlayImg.src = 'assets/DANO.png';
        overlayText.innerText = buscarClasse(carta.ATK);
    } else if (ordenacao === 'hp') {
        overlayImg.src = 'assets/HP.png';
        overlayText.innerText = buscarClasse(carta.HP);
    } else if (ordenacao === 'nivel') {
        overlayImg.src = 'assets/NIVEL.png';
        overlayText.innerText = `${nivel}`;
    } else {
        overlayImg.src = 'assets/CUSTO.png';
        overlayText.innerText = custo;
    }

    ataques.forEach((atkObj, index) => {
        const mult = parseFloat(atkObj[raridade].replace(',', '.'));
        const valor = Math.round(atk * mult);
        document.getElementById(`atk-${index + 1}`).innerText = valor;
    });
}

    // Usar
    const btnUsar = document.getElementById('popup-detalhes-usar');
    const noDeck = deck.find(c => c["nº"] === carta["nº"]);
    if (desbloqueado) {
        btnUsar.disabled = false;
        btnUsar.classList.remove('disabled');
        btnUsar.innerText = noDeck ? 'Remover' : 'Usar';
        btnUsar.onclick = () => {
            if (noDeck) {
                const index = deck.findIndex(c => c["nº"] === carta["nº"]);
                deck.splice(index, 1);
            } else {
                if (deck.length < 8) {
                    deck.push(carta);
                } else {
                    mostrarPopupAviso('Deck cheio!');
                }
            }
            gerarDeck();
            fecharPopupDetalhes();
        };
    } else {
        btnUsar.disabled = true;
        btnUsar.classList.add('disabled');
        btnUsar.innerText = 'Usar';
    }

    // Evoluir
    const btnEvoluir = document.getElementById('popup-detalhes-evoluir');
    const qtdNecessaria = calcularCartasNecessarias(dados.nivel, carta.Raridade);
    const podeEvoluir = dados.quantidade >= qtdNecessaria && dados.nivel < 10;

    if (podeEvoluir) {
        btnEvoluir.disabled = false;
        btnEvoluir.classList.remove('disabled');
        btnEvoluir.onclick = () => {
            dados.quantidade -= qtdNecessaria;
            dados.nivel += 1;
            localStorage.setItem('cartas', JSON.stringify(cartasSalvas));
            gerarCards();
            fecharPopupDetalhes();
        };
    } else {
        btnEvoluir.disabled = true;
        btnEvoluir.classList.add('disabled');
    }

function fecharPopupDetalhes() {
    document.getElementById('popup-detalhes').style.display = 'none';
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

        // 🔥 Sobreposição
        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';

        const overlayImg = document.createElement('img');
        const overlayText = document.createElement('span');

        if (ordenacao === 'atk') {
            overlayImg.src = 'assets/DANO.png';
            overlayText.innerText = buscarClasse(carta.ATK);
        } else if (ordenacao === 'hp') {
            overlayImg.src = 'assets/HP.png';
            overlayText.innerText = buscarClasse(carta.HP);
        } else if (ordenacao === 'nivel') {
            overlayImg.src = 'assets/NIVEL.png';
            overlayText.innerText = `${dados.nivel}`;
        } else {
            overlayImg.src = 'assets/CUSTO.png';
            overlayText.innerText = carta.CUSTO;
        }

        overlay.appendChild(overlayImg);
        overlay.appendChild(overlayText);
        card.appendChild(overlay);

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

card.onclick = (event) => {
    const cartasSalvas = JSON.parse(localStorage.getItem('cartas')) || {};
    const dados = cartasSalvas[carta["nº"]] || { quantidade: 0, nivel: nivelInicialPorRaridade(carta.Raridade) };
    const desbloqueado = dados.quantidade > 0;

    abrirMenuCarta(event, carta, desbloqueado);
};


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


// ================== CLASSE (HP, ATK) ==================

function buscarClasse(valor) {
    const classe = classeStats.find(c => valor >= c.min && valor <= c.max);
    return classe ? classe.Classe : '?';
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

    document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');

    if (!isOpen) {
        dropdown.style.display = 'block';
    }
}

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

// ================== INFORMAÇÕES ==================

let menuAberto = null;

function abrirMenuCarta(event, carta, desbloqueado) {
    fecharMenuCarta();

    const cardElement = event.currentTarget;
    const rect = cardElement.getBoundingClientRect();

    const menu = document.createElement('div');
    menu.className = 'card-menu';

    // 🔹 Botão Detalhes
const btnDetalhes = document.createElement('button');
btnDetalhes.innerText = 'Detalhes';
btnDetalhes.onclick = (e) => {
    e.stopPropagation();
    abrirPopupDetalhes(carta);
    fecharMenuCarta();
};
menu.appendChild(btnDetalhes);


    // 🔸 Botão Usar/Remover (mesmo bloqueado aparece, mas desativado)
    const noDeck = deck.find(c => c["nº"] === carta["nº"]);
    const btnAcao = document.createElement('button');
    btnAcao.innerText = noDeck ? 'Remover' : 'Usar';

    if (desbloqueado) {
        btnAcao.onclick = (e) => {
            e.stopPropagation();
            if (noDeck) {
                const index = deck.findIndex(c => c["nº"] === carta["nº"]);
                deck.splice(index, 1);
            } else {
                if (deck.length < 8) {
                    deck.push(carta);
                } else {
                    mostrarPopupAviso('Deck cheio!');
                }
            }
            gerarDeck();
            fecharMenuCarta();
        };
    } else {
        btnAcao.disabled = true;
        btnAcao.classList.add('botao-desativado');
    }

    menu.appendChild(btnAcao);

    document.body.appendChild(menu);

    // 🔥 Calcula posição
    const menuWidth = 120;
    const left = rect.left + window.scrollX;
    const top = rect.bottom + window.scrollY;

    menu.style.left = `${Math.min(left, window.innerWidth - menuWidth - 10)}px`;
    menu.style.top = `${top}px`;

    menuAberto = menu;

    event.stopPropagation();
}

function fecharMenuCarta() {
    if (menuAberto) {
        menuAberto.remove();
        menuAberto = null;
    }
}

window.addEventListener('click', () => {
    fecharMenuCarta();
});

