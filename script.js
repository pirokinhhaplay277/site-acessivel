// Acessibilidade: Aumentar ou diminuir a fonte
let tamanhoFonte = 100;

document.getElementById('aumentar-fonte').addEventListener('click', () => {
    if (tamanhoFonte < 150) {
        tamanhoFonte += 10;
        document.body.style.fontSize = `${tamanhoFonte}%`;
    }
});

document.getElementById('diminuir-fonte').addEventListener('click', () => {
    if (tamanhoFonte > 80) {
        tamanhoFonte -= 10;
        document.body.style.fontSize = `${tamanhoFonte}%`;
    }
});
