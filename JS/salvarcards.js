function adicionarCarta(id, quantidade = 1) {
    const cartas = JSON.parse(localStorage.getItem('cartas')) || {};
    if (!cartas[id]) {
        cartas[id] = { quantidade: 0, nivel: 1 };
    }
    cartas[id].quantidade += quantidade;
    localStorage.setItem('cartas', JSON.stringify(cartas));
}
