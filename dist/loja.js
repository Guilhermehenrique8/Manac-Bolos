"use strict";

const $ = (id) => document.getElementById(id);
const icone = (nome) => '<svg class="ic" aria-hidden="true"><use href="#i-' + nome + '"/></svg>';
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const valor = (centavos) => moeda.format((centavos ?? 0) / 100);
const produtos = new Map(PRODUTOS.map((produto) => [produto.id, produto]));
const chaveLocal = "manaca.carrinho.v1";
const contato = "https://wa.me/" + LOJA.whatsapp;
const modal = $("produto-modal");
const gaveta = $("carrinho");
const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
let carrinho = lerCarrinho();
let selecao;
let avisoTimer;
let focoOrigem;

function imagem(produto, extra = "") {
  if (produto.foto) {
    return '<span class="media"><img class="photo" loading="lazy" alt="" src="assets/' + produto.foto + '.webp">' + extra + '</span>';
  }
  return '<span class="media placeholder"><img src="assets/marca.png" alt=""><small>Foto em breve</small>' + extra + '</span>';
}

function mostrarProdutos(filtro, animar = false) {
  const lista = PRODUTOS.filter((p) => filtro === "Todos" || p.categoria === filtro);
  $("resultado").textContent = lista.length + " bolos";
  $("produtos").innerHTML = lista.map((p) => {
    const precos = p.opcoes.map((o) => o.preco);
    const inicial = Math.min(...precos.filter((preco) => preco !== null));
    const consulta = !Number.isFinite(inicial);
    const prefixo = new Set(precos).size > 1 ? "<small>A partir de</small>" : "";
    return '<button type="button" class="card" data-produto="' + p.id + '" aria-haspopup="dialog">' +
      imagem(p, '<span class="add-mark">' + icone("plus") + '</span>') +
      '<span class="card-body"><span class="category">' + p.categoria + '</span><span class="card-name">' + p.nome +
      '</span><span class="card-price">' + prefixo + valor(consulta ? 0 : inicial) + (consulta ? ' <small>· Sob consulta</small>' : '') + '</span></span></button>';
  }).join("");
  document.querySelectorAll("[data-filtro]").forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.filtro === filtro)));
  if (animar) {
    $("produtos").classList.remove("refresh");
    void $("produtos").offsetWidth;
    $("produtos").classList.add("refresh");
  }
}

function obterOpcao(id, variante) {
  return produtos.get(id)?.opcoes.find((o) => o.id === variante);
}

function lerCarrinho() {
  try {
    const salvo = JSON.parse(localStorage.getItem(chaveLocal) || "[]");
    if (!Array.isArray(salvo)) return [];
    return salvo.filter((item) => item && obterOpcao(item.id, item.variante) && Number.isSafeInteger(item.qtd) && item.qtd > 0);
  } catch {
    return [];
  }
}

function guardar() {
  try { localStorage.setItem(chaveLocal, JSON.stringify(carrinho)); } catch {}
  atualizarCarrinho();
}

function abrir(dialogo) {
  if (dialogo.open) return;
  focoOrigem = document.activeElement;
  dialogo.classList.remove("closing");
  document.body.classList.add("lock");
  dialogo.showModal();
  dialogo.scrollTop = 0;
}

function fechar(dialogo, depois) {
  if (!dialogo.open || dialogo.classList.contains("closing")) return;
  dialogo.classList.add("closing");
  const concluir = () => {
    dialogo.close();
    dialogo.classList.remove("closing");
    document.body.classList.remove("lock");
    if (focoOrigem?.isConnected) focoOrigem.focus({ preventScroll: true });
    depois?.();
  };
  if (movimentoReduzido.matches) concluir();
  else window.setTimeout(concluir, 180);
}

function mostrarProduto(id) {
  const p = produtos.get(id);
  selecao = { id, variante: p.opcoes[0].id, qtd: 1 };
  const opcoes = p.escolha ? '<fieldset><legend>' + p.escolha + '</legend><div class="options">' + p.opcoes.map((o,i) =>
    '<label class="option"><input type="radio" name="variante" value="' + o.id + '"' + (i === 0 ? " checked" : "") +
    '><span>' + o.nome + '</span></label>').join("") + '</div></fieldset>' : '';
  $("detalhe").innerHTML = '<div class="detail-grid">' + imagem(p) + '<div class="details"><span class="category">' + p.categoria +
    '</span><h2 id="detalhe-nome">' + p.nome + '</h2><p class="description">' + p.descricao + '</p>' + opcoes +
    '<p class="variant-note" id="nota-opcao" aria-live="polite"></p><div class="quantity-price"><div><p class="quantity-label">Quantidade</p>' +
    '<div class="stepper"><button aria-label="Diminuir quantidade" data-qtd="-1">' + icone("minus") + '</button><output id="qtd">1</output>' +
    '<button aria-label="Aumentar quantidade" data-qtd="1">' + icone("plus") + '</button></div></div>' +
    '<strong class="unit-price" id="preco-opcao" aria-live="polite"></strong></div>' +
    '<button class="btn primary wide" id="adicionar">' + icone("bag") + 'Adicionar ao carrinho</button></div></div>';
  atualizarSelecao();
  abrir(modal);
}

function atualizarSelecao() {
  const o = obterOpcao(selecao.id, selecao.variante);
  $("nota-opcao").textContent = o.detalhe || (o.preco === null ? "Preço sob consulta. A loja confirmará o valor pelo WhatsApp." : "");
  $("nota-opcao").hidden = !$("nota-opcao").textContent;
  $("preco-opcao").textContent = valor(o.preco * selecao.qtd);
  $("qtd").textContent = selecao.qtd;
  modal.querySelector('[data-qtd="-1"]').disabled = selecao.qtd === 1;
}

function avisar() {
  window.clearTimeout(avisoTimer);
  const aviso = $("aviso");
  aviso.innerHTML = icone("check") + 'Adicionado ao carrinho <button type="button">Ver carrinho</button>';
  aviso.classList.add("show");
  avisoTimer = window.setTimeout(limparAviso, 3600);
}

function limparAviso() {
  $("aviso").classList.remove("show");
  $("aviso").replaceChildren();
}

function adicionar() {
  const existente = carrinho.find((i) => i.id === selecao.id && i.variante === selecao.variante);
  if (existente) existente.qtd += selecao.qtd;
  else carrinho.push({ ...selecao });
  guardar();
  fechar(modal, avisar);
}

function totais() {
  let unidades = 0, subtotal = 0, consulta = false;
  for (const item of carrinho) {
    const o = obterOpcao(item.id, item.variante);
    unidades += item.qtd;
    subtotal += (o.preco ?? 0) * item.qtd;
    if (o.preco === null) consulta = true;
  }
  return { unidades, subtotal, consulta };
}

function mensagemPedido() {
  const linhas = ["Olá, Manacá Bolos! Gostaria de fazer este pedido:", ""];
  carrinho.forEach((item, i) => {
    const p = produtos.get(item.id);
    const o = obterOpcao(item.id, item.variante);
    linhas.push((i+1) + ". " + item.qtd + " × " + p.nome + " (" + p.categoria + ")");
    if (p.escolha) linhas.push("   " + p.escolha + ": " + o.nome);
    linhas.push(o.preco === null ? "   Valor: sob consulta" : "   " + valor(o.preco) + " por unidade · " + valor(o.preco * item.qtd));
  });
  const total = totais();
  linhas.push("", (total.consulta ? "Subtotal dos itens com preço: " : "Total: ") + valor(total.subtotal));
  if (total.consulta) linhas.push("Há itens com preço a confirmar.");
  linhas.push("", "Podem confirmar a disponibilidade e combinar a entrega ou retirada?");
  return linhas.join("\n");
}

function atualizarCarrinho() {
  const total = totais();
  $("contador").textContent = total.unidades;
  $("abrir-carrinho").setAttribute("aria-label", "Abrir carrinho, " + total.unidades + (total.unidades === 1 ? " item" : " itens"));
  if (!carrinho.length) {
    $("itens").innerHTML = '<div class="empty">' + icone("bag") + '<h3>Seu carrinho está vazio</h3><p>Escolha um bolo para começar seu pedido.</p>' +
      '<button class="btn primary" data-cardapio>Ver cardápio</button></div>';
    $("resumo").replaceChildren();
    return;
  }
  $("itens").innerHTML = carrinho.map((item,i) => {
    const p = produtos.get(item.id);
    const o = obterOpcao(item.id, item.variante);
    return '<div class="cart-row" data-item="' + i + '">' + imagem(p) + '<div><h3>' + p.nome + '</h3><p>' + p.categoria +
      (p.escolha ? ' · ' + o.nome : '') + '</p><div class="stepper"><button data-mudar="-1" aria-label="Diminuir quantidade de ' + p.nome + '">' +
      icone("minus") + '</button><output>' + item.qtd + '</output><button data-mudar="1" aria-label="Aumentar quantidade de ' + p.nome + '">' +
      icone("plus") + '</button></div></div><div class="row-end"><strong>' + (o.preco === null ? "Sob consulta" : valor(o.preco*item.qtd)) +
      '</strong><button class="remove" data-remover aria-label="Remover ' + p.nome + '">' + icone("trash") + '</button></div></div>';
  }).join("");
  $("resumo").innerHTML = '<div class="total"><span>' + (total.consulta ? "Subtotal conhecido" : "Total do pedido") +
    '</span><span class="price">' + valor(total.subtotal) + '</span></div>' +
    (total.consulta ? '<p>O valor dos itens sob consulta será confirmado pela loja.</p>' : '') +
    '<a id="finalizar" class="btn primary wide" target="_blank" rel="noopener">' + icone("wa") + 'Finalizar pedido</a>';
  $("finalizar").href = contato + "?text=" + encodeURIComponent(mensagemPedido());
}

document.querySelectorAll("[data-contato]").forEach((a) => a.href = contato);
document.querySelectorAll("[data-filtro]").forEach((btn) => btn.addEventListener("click", () => mostrarProdutos(btn.dataset.filtro, true)));
$("produtos").addEventListener("click", (event) => {
  const card = event.target.closest("[data-produto]");
  if (card) mostrarProduto(card.dataset.produto);
});
modal.addEventListener("change", (event) => {
  if (event.target.name === "variante") { selecao.variante = event.target.value; atualizarSelecao(); }
});
modal.addEventListener("click", (event) => {
  if (modal.classList.contains("closing")) return;
  const btn = event.target.closest("[data-qtd]");
  if (btn) { selecao.qtd = Math.max(1, selecao.qtd + Number(btn.dataset.qtd)); atualizarSelecao(); }
  if (event.target.closest("#adicionar")) adicionar();
});
for (const dialogo of [gaveta,modal]) {
  dialogo.addEventListener("cancel", (event) => { event.preventDefault(); fechar(dialogo); });
  dialogo.addEventListener("click", (event) => {
    if (event.target.closest("[data-fechar]")) return fechar(dialogo);
    if (event.target !== dialogo) return;
    const r = dialogo.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) fechar(dialogo);
  });
}
function abrirCarrinho() { limparAviso(); abrir(gaveta); }
$("abrir-carrinho").addEventListener("click", abrirCarrinho);
$("aviso").addEventListener("click", (event) => { if (event.target.closest("button")) abrirCarrinho(); });
gaveta.addEventListener("click", (event) => {
  if (event.target.closest("[data-cardapio]")) return fechar(gaveta, () => $("cardapio").scrollIntoView());
  const btn = event.target.closest("[data-mudar],[data-remover]");
  if (!btn) return;
  const i = Number(btn.closest("[data-item]").dataset.item);
  const mudar = btn.dataset.mudar;
  if (mudar) carrinho[i].qtd += Number(mudar);
  if (!mudar || carrinho[i].qtd <= 0) carrinho.splice(i,1);
  guardar();
  const destino = gaveta.querySelector('[data-item="' + Math.min(i, carrinho.length-1) + '"] ' + (mudar ? '[data-mudar="' + mudar + '"]' : '[data-remover]')) || gaveta.querySelector("[data-cardapio]");
  destino?.focus({ preventScroll: true });
});
window.addEventListener("storage", (event) => {
  if (event.key === chaveLocal || event.key === null) { carrinho = lerCarrinho(); atualizarCarrinho(); }
});
const hero = document.querySelector(".hero");
let quadro = false;
function rolar() {
  const progresso = movimentoReduzido.matches ? 0 : Math.min(1, Math.max(0,window.scrollY / hero.offsetHeight));
  hero.style.setProperty("--hero-opacity", String(1 - progresso * .92));
  hero.style.setProperty("--hero-offset", (progresso * 35) + "px");
  hero.style.setProperty("--art-offset", (progresso * 22) + "px");
  quadro = false;
}
window.addEventListener("scroll", () => { if (!quadro) { quadro = true; requestAnimationFrame(rolar); } }, { passive: true });
movimentoReduzido.addEventListener("change", rolar);
mostrarProdutos("Todos");
atualizarCarrinho();
rolar();
