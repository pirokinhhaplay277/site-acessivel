document.addEventListener('DOMContentLoaded', () => {
  // ===== Acessibilidade =====
  let tamanhoFonte = 1.0;
  const btnMais = document.getElementById('aumentar-fonte');
  const btnMenos = document.getElementById('diminuir-fonte');
  const btnContraste = document.getElementById('contraste');

  if(btnMais) btnMais.addEventListener('click', () => {
    tamanhoFonte = Math.min(1.6, +(tamanhoFonte + 0.1).toFixed(2));
    document.documentElement.style.fontSize = tamanhoFonte + 'rem';
  });
  if(btnMenos) btnMenos.addEventListener('click', () => {
    tamanhoFonte = Math.max(.8, +(tamanhoFonte - 0.1).toFixed(2));
    document.documentElement.style.fontSize = tamanhoFonte + 'rem';
  });
  if(btnContraste) btnContraste.addEventListener('click', () => {
    document.body.classList.toggle('alto-contraste');
    const pressed = btnContraste.getAttribute('aria-pressed') === 'true';
    btnContraste.setAttribute('aria-pressed', (!pressed).toString());
  });

  // ===== Ano rodapé =====
  const ano = document.getElementById('ano');
  if(ano) ano.textContent = new Date().getFullYear();

  // ===== Validação contato =====
  document.querySelectorAll('.needs-validation').forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        e.preventDefault();
        alert('Mensagem enviada!');
        form.reset();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // ===== Produtos e carrinho =====
  const produtosDestaque = Array.from(document.querySelectorAll('.produto.destaque'));
  const grid = document.getElementById('grid-produtos');
  const badge = document.getElementById('badge-carrinho');
  const lista = document.getElementById('itens-carrinho');
  const totalEl = document.getElementById('total');
  const filtro = document.getElementById('filtro-categoria');
  const ordenar = document.getElementById('ordenar');
  const busca = document.getElementById('busca');
  const btnBusca = document.getElementById('btn-busca');

  // Clona destaques para preencher a grade (8 itens)
  const base = produtosDestaque.map(el => ({
    id: el.dataset.id,
    nome: el.dataset.nome,
    preco: parseFloat(el.dataset.preco),
    categoria: el.dataset.categoria,
    img: el.dataset.img
  }));

  // se tiver menos que 6, repete variações
  const catalogo = [];
  const nomesExtra = ['Pro Flex', 'Urban Flow', 'Run Max', 'Cloud Step', 'All Court'];
  for(let i=0;i<8;i++){
    const b = base[i % base.length];
    const variacao = i >= base.length ? ` ${nomesExtra[i % nomesExtra.length]}` : '';
    catalogo.push({
      id: b.id + '-' + i,
      nome: b.nome + variacao,
      preco: +(b.preco + (i%3)*20).toFixed(2),
      categoria: b.categoria,
      img: b.img
    });
  }

  function cardProduto(p){
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-3';
    col.innerHTML = `
      <article class="card h-100 produto" data-id="${p.id}" data-nome="${p.nome}" data-preco="${p.preco}" data-categoria="${p.categoria}" data-img="${p.img}">
        <img class="card-img-top" alt="Tênis ${p.nome}" src="${p.img}">
        <div class="card-body d-flex flex-column">
          <h3 class="card-title h6 mb-1">${p.nome}</h3>
          <p class="preco mb-3">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" data-action="detalhes">Detalhes</button>
            <button class="btn btn-primary btn-sm btn-add" aria-label="Adicionar ${p.nome} ao carrinho">Comprar</button>
          </div>
        </div>
      </article>`;
    return col;
  }

  function render(catalogoFiltrado){
    grid.innerHTML = '';
    catalogoFiltrado.forEach(p => grid.appendChild(cardProduto(p)));
  }

  function aplicaFiltros(){
    let lista = [...catalogo];
    const termo = (busca?.value || '').trim().toLowerCase();
    if(termo) lista = lista.filter(p => p.nome.toLowerCase().includes(termo));
    const cat = filtro?.value || '';
    if(cat) lista = lista.filter(p => p.categoria === cat);
    const ord = ordenar?.value || '';
    if(ord === 'menor-preco') lista.sort((a,b)=> a.preco - b.preco);
    if(ord === 'maior-preco') lista.sort((a,b)=> b.preco - a.preco);
    if(ord === 'az') lista.sort((a,b)=> a.nome.localeCompare(b.nome));
    if(ord === 'za') lista.sort((a,b)=> b.nome.localeCompare(a.nome));
    render(lista);
  }

  if(btnBusca) btnBusca.addEventListener('click', aplicaFiltros);
  if(busca) busca.addEventListener('keydown', (e)=> { if(e.key==='Enter'){ e.preventDefault(); aplicaFiltros(); } });
  if(filtro) filtro.addEventListener('change', aplicaFiltros);
  if(ordenar) ordenar.addEventListener('change', aplicaFiltros);

  render(catalogo); // inicial

  // ===== Carrinho =====
  let carrinho = JSON.parse(localStorage.getItem('carrinho-sneakx') || '[]');

  function salvarCarrinho(){
    localStorage.setItem('carrinho-sneakx', JSON.stringify(carrinho));
  }

  function atualizarBadge(){
    const qtd = carrinho.reduce((s,i)=> s + i.qtd, 0);
    badge.textContent = qtd;
    badge.style.display = qtd ? '' : 'none';
  }

  function formatar(v){ return 'R$ ' + v.toFixed(2).replace('.', ','); }

  function desenharCarrinho(){
    lista.innerHTML = '';
    let total = 0;
    carrinho.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center justify-content-between gap-2';
      total += item.preco * item.qtd;
      li.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <img src="${item.img}" alt="${item.nome}" width="48" height="48" style="object-fit:cover;border-radius:8px">
          <div>
            <div class="fw-semibold">${item.nome}</div>
            <div class="small text-body-secondary">${formatar(item.preco)}</div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-idx="${idx}" data-action="menos" aria-label="Diminuir quantidade">-</button>
          <span aria-live="polite" aria-atomic="true">${item.qtd}</span>
          <button class="btn btn-sm btn-outline-secondary" data-idx="${idx}" data-action="mais" aria-label="Aumentar quantidade">+</button>
          <button class="btn btn-sm btn-outline-danger" data-idx="${idx}" data-action="remover" aria-label="Remover do carrinho"><i class="bi bi-trash"></i></button>
        </div>`;
      lista.appendChild(li);
    });
    totalEl.textContent = formatar(total);
    atualizarBadge();
    salvarCarrinho();
  }

  function adicionarAoCarrinho(prod){
    const existente = carrinho.find(i => i.id === prod.id);
    if(existente){ existente.qtd += 1; }
    else { carrinho.push({ ...prod, qtd: 1 }); }
    desenharCarrinho();
  }

  // Delegação de eventos para "Comprar"
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-add');
    if(addBtn){
      const card = addBtn.closest('.produto');
      const prod = {
        id: card.dataset.id,
        nome: card.dataset.nome,
        preco: parseFloat(card.dataset.preco),
        img: card.dataset.img
      };
      adicionarAoCarrinho(prod);
    }

    const acao = e.target.closest('[data-action]');
    if(acao && acao.dataset.action){
      const idx = +acao.dataset.idx;
      const action = acao.dataset.action;
      if(action === 'mais'){ carrinho[idx].qtd += 1; }
      if(action === 'menos'){ carrinho[idx].qtd = Math.max(1, carrinho[idx].qtd - 1); }
      if(action === 'remover'){ carrinho.splice(idx,1); }
      desenharCarrinho();
    }
  });

  desenharCarrinho();

  // Finalizar
  const finalizar = document.getElementById('finalizar');
  if(finalizar) finalizar.addEventListener('click', () => {
    if(!carrinho.length){ alert('Seu carrinho está vazio.'); return; }
    alert('Compra simulada! Obrigado por comprar na SneakX.');
    carrinho = [];
    desenharCarrinho();
  });

  // ===== ScrollReveal (efeitinhos) =====
  if(window.ScrollReveal){
    ScrollReveal().reveal('.hero', { distance: '40px', origin: 'bottom', duration: 600 });
    ScrollReveal().reveal('.card', { interval: 80, distance: '20px', origin: 'bottom', duration: 500 });
  }
});
