// ================== INICIALIZAÇÃO =================

const recursos = ['trophy', 'xp', 'timerGratis', 'planet', 'coin', 'gem'];

recursos.forEach(item => {
    if (localStorage.getItem(item) === null) {
        localStorage.setItem(item, item === 'timerGratis' ? Date.now() : 0);
    }
});

for (let i = 1; i <= 4; i++) {
    if (localStorage.getItem(`slot${i}`) === null) {
        localStorage.setItem(`slot${i}`, JSON.stringify({ status: "empty" }));
    }
}

// ================== ELEMENTOS DA ABERTURA ==================

let packImg, flipContainer, gridContainer = null;

window.addEventListener('DOMContentLoaded', () => {
    packImg = document.getElementById('pack-img');
    flipContainer = document.getElementById('card-flip-container');
    gridContainer = document.getElementById('grid-container');
});

// ================== FUNÇÕES GERAIS ==================

function goTo(page) {
    window.location.href = page;
}

// ================== ENVIAR PACOTE PARA SLOT ==================

function enviarParaSlotDisponivel(pacoteId) {
    for (let i = 1; i <= 4; i++) {
        const slot = JSON.parse(localStorage.getItem(`slot${i}`));
        if (slot.status === "empty") {
            localStorage.setItem(`slot${i}`, JSON.stringify({
                id: pacoteId,
                status: "ready"
            }));
            atualizarSlots();
            return true;
        }
    }
    return false;
}

// ================== RECURSOS ==================

function atualizarRecursos() {
    document.getElementById('coin-amount').innerText = localStorage.getItem('coin') || 0;
    document.getElementById('gem-amount').innerText = localStorage.getItem('gem') || 0;
    document.getElementById('trophy-amount').innerText = localStorage.getItem('trophy') || 0;
}

// ================== ARENA ==================

async function carregarArena() {
    const response = await fetch('JSON/arenas.json');
    const arenas = await response.json();

    const trophy = parseInt(localStorage.getItem('trophy')) || 0;

    const arenaAtual = arenas.find(arena =>
        trophy >= arena.trofeusMin && trophy <= arena.trofeusMax
    ) || arenas[0];

    document.getElementById('arena-image').src = `Arenas_Menu/${arenaAtual.imagem}`;
    document.getElementById('arena-name').innerText = arenaAtual.nome;
    document.getElementById('arena-level').innerText = `Arena ${arenaAtual.id}`;
}

// ================== PACOTE GRÁTIS ==================

const tempoRecargaGratis = 3600; // 1 hora

function atualizarTimerGratis() {
    const ultimoResgate = parseInt(localStorage.getItem('timerGratis'));
    const agora = Date.now();
    const diff = Math.floor((tempoRecargaGratis * 1000 - (agora - ultimoResgate)) / 1000);

    const timerElement = document.getElementById('timer-gratis');
    const packGratis = document.getElementById('pack-gratis');

    if (diff <= 0) {
        timerElement.innerText = 'Pacote de suprimentos disponível!';
        packGratis.classList.add('active');
    } else {
        const horas = Math.floor(diff / 3600).toString().padStart(2, '0');
        const minutos = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const segundos = (diff % 60).toString().padStart(2, '0');

        timerElement.innerText = `Disponível em: ${horas}:${minutos}:${segundos}`;
        packGratis.classList.remove('active');
    }
}

function abrirPacoteGratis() {
    const packGratis = document.getElementById('pack-gratis');
    if (packGratis.classList.contains('active')) {

        const sucesso = enviarParaSlotDisponivel(1); // ID do pacote grátis

        if (sucesso) {
            localStorage.setItem('timerGratis', Date.now());
            atualizarTimerGratis();
            abrirPopupAviso('🎁 Pacote de suprimentos coletado e enviado para um slot!');
        } else {
            abrirPopupAviso('❌ Todos os slots estão ocupados. Abra algum pacote antes.');
        }
    }
}

// ================== PACOTE CONQUISTA ==================

function atualizarBarraPlanetas() {
    const planetas = parseInt(localStorage.getItem('planet')) || 0;
    const progresso = Math.min(planetas / 10, 1) * 100;

    const barra = document.getElementById('progress-planets');
    const texto = document.getElementById('planet-count');
    const packConquista = document.getElementById('pack-conquista');

    barra.style.width = `${progresso}%`;
    texto.innerText = `${planetas} / 10 Planetas`;

    if (planetas >= 10) {
        packConquista.classList.add('active');
    } else {
        packConquista.classList.remove('active');
    }
}

function abrirPacoteConquista() {
    const planetas = parseInt(localStorage.getItem('planet')) || 0;
    if (planetas >= 10) {

        const sucesso = enviarParaSlotDisponivel(0); // ID do pacote de conquista

        if (sucesso) {
            localStorage.setItem('planet', 0);
            atualizarBarraPlanetas();
            abrirPopupAviso('🚀 Pacote de conquista coletado e enviado para um slot!');
        } else {
            abrirPopupAviso('❌ Todos os slots estão ocupados. Abra algum pacote antes.');
        }
    }
}


// ================== XP E LEVEL ==================

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

    document.querySelector('.xp-level').innerText = nivelAtual;
    document.querySelector('.xp-bar-fill').style.width = `${porcentagem}%`;
    document.querySelector('.xp-bar-text').innerText = `${xpAtualNoNivel} / ${xpParaProximo}`;
}

// ================== SLOTS ==================

function atualizarSlots() {
    for (let i = 1; i <= 4; i++) {
        const slot = JSON.parse(localStorage.getItem(`slot${i}`));
        const slotDiv = document.getElementById(`slot${i}`);

        if (slot.status === "empty") {
            slotDiv.className = "slot empty";
            slotDiv.innerHTML = "";
        } else if (slot.status === "locked") {
            const tempoRestante = slot.duration - (Date.now() - slot.startTime);
            if (tempoRestante <= 0) {
                slot.status = "ready";
                localStorage.setItem(`slot${i}`, JSON.stringify(slot));
                slotDiv.innerHTML = gerarHtmlPacotePronto(slot.id, i);
            } else {
                slotDiv.innerHTML = gerarHtmlPacoteTempo(slot.id, tempoRestante, i);
            }
        } else if (slot.status === "ready") {
            slotDiv.innerHTML = gerarHtmlPacotePronto(slot.id, i);
        }
    }
}

function gerarHtmlPacoteTempo(id, tempoRestante, slotNum) {
    return `
        <img src="Packs/${id}.png" alt="Pacote">
        <div class="timer">${formatarTempo(tempoRestante)}</div>
        <div class="acelerar" onclick="acelerarPacote(${slotNum})">Acelerar</div>
    `;
}

function gerarHtmlPacotePronto(id, slotNum) {
    return `
        <img src="Packs/${id}.png" alt="Pacote">
        <div class="ready" onclick="abrirAnimacaoPacote(${slotNum})">ABRIR</div>
    `;
}

function formatarTempo(ms) {
    const horas = Math.floor(ms / 3600000);
    const minutos = Math.floor((ms % 3600000) / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

// ================== ACELERAR ==================

let slotAcelerarSelecionado = null;
let custoAcelerar = 0;

function calcularCustoAcelerar(tempoRestanteMs) {
    const minutosRestantes = Math.ceil(tempoRestanteMs / 60000);
    return Math.max(1, Math.ceil(minutosRestantes / 10));
}

function acelerarPacote(slotNum) {
    const slot = JSON.parse(localStorage.getItem(`slot${slotNum}`));
    if (!slot || slot.status !== "locked") return;

    const tempoRestante = slot.duration - (Date.now() - slot.startTime);
    custoAcelerar = calcularCustoAcelerar(tempoRestante);

    const gemas = parseInt(localStorage.getItem('gem')) || 0;

    if (gemas < custoAcelerar) {
        abrirPopupAviso('💎 Você não tem gemas suficientes!');
        return;
    }

    slotAcelerarSelecionado = slotNum;
    document.getElementById('popup-message').innerText =
        `Deseja acelerar por ${custoAcelerar} gemas?`;
    document.getElementById('popup-confirm').style.display = 'flex';
}

function confirmarPopup() {
    const slotNum = slotAcelerarSelecionado;
    const gemas = parseInt(localStorage.getItem('gem')) || 0;

    localStorage.setItem('gem', gemas - custoAcelerar);

    const slot = JSON.parse(localStorage.getItem(`slot${slotNum}`));
    slot.status = "ready";
    localStorage.setItem(`slot${slotNum}`, JSON.stringify(slot));

    fecharPopup();
    atualizarRecursos();
    atualizarSlots();
}

function fecharPopup() {
    document.getElementById('popup-confirm').style.display = 'none';
    slotAcelerarSelecionado = null;
}

function abrirPopupAviso(mensagem) {
    document.getElementById('popup-aviso-message').innerText = mensagem;
    document.getElementById('popup-aviso').style.display = 'flex';
}

function fecharPopupAviso() {
    document.getElementById('popup-aviso').style.display = 'none';
}

// ================== GERADOR DE PRÊMIOS ==================

async function gerarPremios(pacoteID) {
    const packs = await fetch('JSON/cards.json').then(res => res.json());
    const personagens = await fetch('JSON/personagens.json').then(res => res.json());

    const pacote = packs.find(p => p.ID === String(pacoteID));
    if (!pacote) {
        console.error('Pacote não encontrado!');
        return [];
    }

    const premios = [];
    const maxPremios = parseInt(pacote['Máximo De Prêmios']);

    const tipos = [
        { chave: 'Lendario', prob: 'Probabilidade - Lendario', qtd: 'Quantidade - Lendario', limite: 'Limite - Lendario' },
        { chave: 'Ultra Raro', prob: 'Probabilidade - Ultra Raro', qtd: 'Quantidade - Ultra Raro', limite: 'Limite - Ultra Raro' },
        { chave: 'Super Raro', prob: 'Probabilidade - Super Raro', qtd: 'Quantidade - Super Raro', limite: 'Limite - Super Raro' },
        { chave: 'Raro', prob: 'Probabilidade - Raro', qtd: 'Quantidade - Raro', limite: 'Limite - Raro' },
        { chave: 'Normal', prob: 'Probabilidade - Normal', qtd: 'Quantidade - Normal', limite: 'Limite - Normal' },
    ];

    const recursos = [
        { nome: 'Gemas', chave: 'Gemas', imagem: 'assets/gem2.webp' },
        { nome: 'Ouro', chave: 'Ouro', imagem: 'assets/coin2.webp' },
        { nome: 'Esferas', chave: 'Esferas', imagem: 'assets/Shenlong2.webp' },
    ];

    recursos.forEach(r => {
    const limite = parseInt(pacote[`Limite - ${r.nome}`]) || 0;
    const prob = parseFloat(pacote[`Probabilidade - ${r.nome}`]) || 0;

    for (let i = 0; i < limite; i++) {
        const chance = Math.random() * 100;
        if (chance <= prob) {
            const quantidade = randomInt(1, parseInt(pacote[`Quantidade - ${r.nome}`]));
            premios.push({
                tipo: r.nome.toLowerCase(),
                nome: r.nome,
                imagem: r.imagem,
                quantidade
            });
        }
    }
});

    tipos.forEach(tipo => {
        const prob = parseFloat(pacote[`Probabilidade - ${tipo.chave}`]);
        const limite = parseInt(pacote[`Limite - ${tipo.chave}`]) || 0;
        const qtdMaxima = parseInt(pacote[`Quantidade - ${tipo.chave}`]) || 0;

        if (Math.random() * 100 <= prob) {
            const cartas = personagens.filter(p => p.Raridade === tipo.chave);

            for (let i = 0; i < limite; i++) {
                const sorteada = cartas[Math.floor(Math.random() * cartas.length)];
                const quantidade = randomInt(1, qtdMaxima);
                premios.push({
                    tipo: tipo.chave.toLowerCase(),
                    nome: sorteada['Nome Completo'],
                    imagem: `Cards/Slide${sorteada['nº']}.webp`,
                    quantidade
                });
            }
        }
    });

    while (premios.length < maxPremios) {
        const cartas = personagens.filter(p => p.Raridade === 'Normal');
        const sorteada = cartas[Math.floor(Math.random() * cartas.length)];
        const quantidade = randomInt(1, parseInt(pacote['Quantidade - Normal']));

        premios.push({
            tipo: 'normal',
            nome: sorteada['Nome Completo'],
            imagem: `Cards/Slide${sorteada['nº']}.webp`,
            quantidade
        });
    }

    return premios;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ================== ABERTURA DE PACOTES ==================

let currentIndex = 0;
let slotAberto = null;
let aguardandoClique = false;
let premiosAtuais = [];

async function abrirAnimacaoPacote(slotNum) {
    const slot = JSON.parse(localStorage.getItem(`slot${slotNum}`));
    if (!slot || slot.status !== "ready") return;

    premiosAtuais = await gerarPremios(slot.id); // ✅ Aqui gera os prêmios
    slotAberto = slotNum;

    document.getElementById('opening-screen').style.display = 'flex';
    packImg.src = `Packs/${slot.id}.png`;

    flipContainer.innerHTML = '';
    gridContainer.innerHTML = '';
    flipContainer.style.display = 'none';
    gridContainer.style.display = 'none';

    aguardandoClique = false;

    setTimeout(() => {
        packImg.classList.add('pack-explode');
        setTimeout(() => {
            packImg.style.display = 'none';
            mostrarFlip();
        }, 600);
    }, 1200);
}

function mostrarFlip() {
    flipContainer.innerHTML = '';
    flipContainer.style.display = 'flex';

    const premio = premiosAtuais[currentIndex];

    const card = document.createElement('div');
    card.classList.add('card');

    const inner = document.createElement('div');
    inner.classList.add('card-inner');

    // 🔥 Frente da carta
    const front = document.createElement('div');
    front.classList.add('card-front');
    const imgFront = document.createElement('img');
    imgFront.src = 'assets/Back.webp';
    front.appendChild(imgFront);

    // 🔥 Verso da carta
    const back = document.createElement('div');
    back.classList.add('card-back');

    // ✅ Glow apenas para cartas
    if (!['ouro', 'gemas', 'esferas'].includes(premio.tipo)) {
        const glow = document.createElement('div');
        glow.classList.add('glow');

        // 🎨 Define cor de acordo com a raridade
        switch (premio.tipo) {
            case 'normal': glow.style.background = 'brown'; break;
            case 'raro': glow.style.background = 'white'; break;
            case 'super': glow.style.background = 'gold'; break;
            case 'ultra': glow.style.background = 'lime'; break;
            case 'lendario': glow.style.background = 'purple'; break;
        }

        back.appendChild(glow);
    }

    const imgBack = document.createElement('img');
    imgBack.src = premio.imagem;
    back.appendChild(imgBack);

    const contador = document.createElement('div');
    contador.classList.add('contador');
    contador.innerText = `x${premio.quantidade}`;
    back.appendChild(contador);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    flipContainer.appendChild(card);

    aguardandoClique = false;

    card.onclick = () => {
        if (aguardandoClique) return;
        inner.classList.add('flipped');
        aguardandoClique = true;

        setTimeout(() => {
            document.body.onclick = proximaCarta;
        }, 400);
    };
}

function proximaCarta() {
    document.body.onclick = null;
    aguardandoClique = false;
    currentIndex++;

      if (currentIndex < premiosAtuais.length) {
        mostrarFlip();
    } else {
        mostrarGridFinal();
    }
}

function mostrarGridFinal() {
    flipContainer.style.display = 'none';
    gridContainer.style.display = 'flex';

    gridContainer.innerHTML = '';

    premiosAtuais.forEach(item => {
        const container = document.createElement('div');
        container.classList.add('card-grid');

        const img = document.createElement('img');
        img.src = item.imagem;
        container.classList.add('card-grid');

                if (['gemas', 'ouro', 'esferas'].includes(item.tipo)) {
            img.classList.add('recurso');
        } else {
            img.classList.add('carta');
        }

        const contador = document.createElement('div');
        contador.classList.add('contador');
        contador.innerText = `x${item.quantidade}`;

        container.appendChild(img);
        container.appendChild(contador);
        gridContainer.appendChild(container);
    });

    document.body.onclick = fecharAbertura;
}

function fecharAbertura() {
    // Processa os prêmios e aplica ao jogador
    premiosAtuais.forEach(item => {
        if (item.tipo === 'ouro') {
            const coin = parseInt(localStorage.getItem('coin') || 0);
            localStorage.setItem('coin', coin + item.quantidade);
        } 
        else if (item.tipo === 'gemas') {
            const gem = parseInt(localStorage.getItem('gem') || 0);
            localStorage.setItem('gem', gem + item.quantidade);
        } 
        else if (item.tipo === 'esferas') {
            const planet = parseInt(localStorage.getItem('planet') || 0);
            localStorage.setItem('planet', planet + item.quantidade);
        }
    });

    // Limpa slot
    localStorage.setItem(`slot${slotAberto}`, JSON.stringify({ status: "empty" }));
    slotAberto = null;

    // Reset de variáveis e interface
    document.body.onclick = null;
    aguardandoClique = false;
    currentIndex = 0;

    flipContainer.innerHTML = '';
    gridContainer.innerHTML = '';
    packImg.classList.remove('pack-explode');
    packImg.style.display = 'block';
    document.getElementById('opening-screen').style.display = 'none';

    atualizarRecursos(); // Atualiza a HUD de gemas, moedas e planetas
    atualizarSlots();    // Atualiza os slots dos pacotes
}

// 🔒 Bloqueio de menu de contexto (botão direito e toque longo)
document.addEventListener('contextmenu', event => event.preventDefault());


// ================== LOOP ==================

setInterval(atualizarSlots, 1000);
setInterval(atualizarTimerGratis, 1000);
setInterval(atualizarBarraPlanetas, 2000);
setInterval(atualizarRecursos, 2000);
setInterval(carregarXP, 2000);
setInterval(carregarArena, 2000);

// ================== AO INICIAR ==================

atualizarRecursos();
carregarArena();
atualizarBarraPlanetas();
carregarXP();
atualizarTimerGratis();

