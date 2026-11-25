// Preços em centavos. Use null enquanto o valor estiver sob consulta.
// As fotos ficam na pasta assets. Sem foto, o catálogo usa a marca da loja.
const LOJA = { nome: "Manacá Bolos", whatsapp: "5584996187906" };

const tamanhosCaseiros = [
  { id: "medio", nome: "Médio", preco: 2000 },
  { id: "grande", nome: "Grande", preco: 2500 }
];

function caseirinho(id, nome, descricao, foto = null, opcoes = tamanhosCaseiros) {
  return { id, nome, descricao, foto, categoria: "Caseirinhos", escolha: "Tamanho", opcoes };
}

function recheado(id, nome, descricao, foto) {
  return { id, nome, descricao, foto, categoria: "Recheados", opcoes: [{ id: "padrao", preco: null }] };
}

const PRODUTOS = [
  caseirinho("milho", "Bolo de milho", "Douradinho por fora, com o sabor marcante do milho. Um caseirinho para acompanhar o café da tarde.", "milho"),
  {
    id: "mini-vulcao", nome: "Mini vulcão", categoria: "Recheados", foto: "mini-vulcao",
    descricao: "Um bolinho individual com uma calda cremosa que escorre pelas laterais. Escolha sua combinação de massa e calda.",
    escolha: "Sabor", opcoes: [
      { id: "chocolatudo", nome: "Chocolatudo", detalhe: "Massa de chocolate com calda de chocolate.", preco: 1000 },
      { id: "choco-ninho", nome: "Choco-ninho", detalhe: "Massa de chocolate com calda de Ninho.", preco: 1000 },
      { id: "classico", nome: "Clássico", detalhe: "Massa amanteigada com calda de chocolate.", preco: 1000 },
      { id: "sonho-de-ninho", nome: "Sonho de Ninho", detalhe: "Massa amanteigada com calda de Ninho.", preco: 1000 }
    ]
  },
  caseirinho("amanteigado", "Bolo amanteigado", "Um clássico de sabor suave e delicadamente amanteigado, para o café da manhã ou da tarde.", "amanteigado"),
  recheado("chantilly-decorado", "Chantilly decorado", "Bolo recheado com acabamento em chantilly e detalhes decorativos para a sua celebração.", "chantilly-decorado"),
  recheado("chocolate-recheado", "Bolo de chocolate", "Bolo recheado com cobertura cremosa de chocolate e acabamento de granulado.", "chocolate-recheado"),
  caseirinho("laranja", "Bolo de laranja", "Bolo caseiro de laranja, disponível nos tamanhos médio e grande."),
  caseirinho("leite", "Bolo de leite", "Bolo caseiro de leite para dividir à mesa. Escolha entre os tamanhos médio e grande."),
  recheado("chantilly", "Chantilly", "Um clássico com acabamento delicado em chantilly para compartilhar nas comemorações.", "chantilly"),
  caseirinho("chocolate-caseiro", "Bolo de chocolate", "A versão caseirinha do bolo de chocolate, nos tamanhos médio e grande."),
  caseirinho("formigueiro", "Bolo formigueiro", "O tradicional bolo formigueiro da linha de caseirinhos da Manacá."),
  recheado("chantilly-com-topo", "Chantilly com topo", "Bolo com decoração em chantilly e topo temático para dar um toque pessoal à comemoração.", "chantilly-com-topo"),
  caseirinho("cenoura", "Bolo de cenoura", "O sabor especial do cardápio acompanha calda. Disponível em três tamanhos.", null, [
    { id: "mini", nome: "Mini", preco: 1500 }, { id: "medio", nome: "Médio", preco: 4000 }, { id: "grande", nome: "Grande", preco: 5000 }
  ])
];
