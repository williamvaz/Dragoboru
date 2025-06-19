function adicionarCarta(id, quantidade = 1) {
    const cartas = JSON.parse(localStorage.getItem('cartas')) || {};

    if (!cartas[id]) {
        const personagem = personagens.find(p => p["nº"] == id);
        const nivelInicial = personagem ? nivelInicialPorRaridade(personagem.Raridade) : 1;
        cartas[id] = { quantidade: 0, nivel: nivelInicial };
    }

    cartas[id].quantidade += quantidade;
    localStorage.setItem('cartas', JSON.stringify(cartas));
}
