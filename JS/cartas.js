if (!localStorage.getItem('cartas')) {
    const cartas = {};
    personagens.forEach(p => {
        let nivelInicial = 1;
        switch (p.Raridade) {
            case 'Raro': nivelInicial = 3; break;
            case 'Super Raro': nivelInicial = 5; break;
            case 'Ultra Raro': nivelInicial = 7; break;
            case 'Lendario': nivelInicial = 9; break;
        }
        cartas[p["nº"]] = { quantidade: 0, nivel: nivelInicial };
    });
    localStorage.setItem('cartas', JSON.stringify(cartas));
}
