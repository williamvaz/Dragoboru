fetch('JSON/arenas.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Arquivo arenas.json não encontrado');
        }
        return response.json();
    })
    .then(data => {
        const container = document.getElementById('arenas');
        data.forEach(arena => {
            const div = document.createElement('div');
            div.className = 'arena-card';

            div.innerHTML = `
                <div class="arena-info">
                    <span>${arena.nome}</span>
                    <div class="trophy">
                        <img src="assets/trophy.png" alt="Troféu">
                        <span>${arena.trofeusMin}+</span>
                    </div>
                </div>
                <img src="Arenas_Menu/${arena.imagem}" alt="${arena.nome}">
            `;
            
            container.appendChild(div);
        });
    })
    .catch(err => console.error('Erro ao carregar arenas:', err));
