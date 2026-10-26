// Fonte única de dados do site: cardápio, horários, contatos e textos.
// Para mudar preço, item ou horário, edite só este arquivo.
const CONFIG = {
  restaurante: {
    nome: "London Bistrô",
    slogan: "Food and Drinks",
    desde: 2020,
    instagram: "@london_bistro",
    telefone: "(43) 98870-9252",
    whatsapp: "5543988709252",
    endereco: "Av. Getúlio Vargas, 144 – Califórnia – PR, 86820-000",
    local: {
      rua: "Av. Getúlio Vargas, 144",
      bairro: "Califórnia – PR",
      cep: "CEP 86820-000",
      // texto usado no mapa e nas rotas (Google Maps e Waze)
      busca: "London Bistrô, Av. Getúlio Vargas, 144, Califórnia - PR, 86820-000"
    },
    fuso: "America/Sao_Paulo",
    horarios: [
      { dias: "Segunda", horario: "Fechado" },
      { dias: "Terça a Quinta", horario: "10h às 20h" },
      { dias: "Sexta", horario: "10h às 22h" },
      { dias: "Sábado e Domingo", horario: "16h às 22h" }
    ],
    google: {
      nota: 4.9,
      total: 103
    }
  },
  moeda: "BRL",

  // Qualquer item do cardápio aceita foto: foto: "assets/fotos/....webp".


  categorias: [
    {
      id: "porcoes",
      nome: "Porções",
      itens: [
        { nome: "Batata Frita", preco: 21, descricao: "250g da nossa deliciosa batata palito." },
        { nome: "Polenta Frita", preco: 22, descricao: "300g de pura crocância." },
        { nome: "Batata Rústica", preco: 23, descricao: "Crocante por fora, macia por dentro. Acompanha maionese de alho." },
        { nome: "Mini Quibe", preco: 25, descricao: "Porção de mini quibe bem sequinho servido com maionese agridoce." },
        { nome: "Bolinho de Queijo", preco: 26, descricao: "Acompanha molho de pimenta agridoce." },
        { nome: "Bolinho de Carne Seca", preco: 25, descricao: "Bolinho com massa de mandioca recheado com carne seca." },
        { nome: "Dadinho", preco: 26, descricao: "Dadinho de tapioca com queijo coalho, servido com geleia agridoce de pimenta." }
      ],
      adicionais: [
        { nome: "Molho adicional (pimenta agridoce ou maionese de alho)", preco: 5 }
      ]
    },
    {
      id: "saladas",
      nome: "Saladas",
      itens: [
        { nome: "Italian Salad", preco: 25, descricao: "Cubos de filé de peito de frango, tomate, pepino, croutons, queijo muçarela, molho italiano da casa, servidos sobre mix de folhas verdes." },
        { nome: "Spanish Salad", preco: 28, descricao: "Cubos de filé de frango marinado, pimentão amarelo e cebola roxa fritos na panela com molho de pimenta doce, servidos sobre folhas verdes com tomate, pepino e molho de mostarda e mel." }
      ]
    },
    {
      id: "burgers",
      nome: "Burgers",
      itens: [
        { nome: "Cheese Burger", preco: 21, descricao: "Burger de 170g com queijo muçarela e picles no pão de gergelim." },
        { nome: "Chicken Burger", preco: 23, descricao: "Sassami de frango marinado, muçarela, alface, tomate, pão de hambúrguer." },
        { nome: "Basic Burger", preco: 24, descricao: "Burger gourmet, presunto, queijo, tomate, alface no pão de hambúrguer." },
        {
          nome: "House Burger",
          preco: 26,
          variacoes: [
            { nome: "Simples", preco: 26 },
            { nome: "Duplo", preco: 38 }
          ],
          descricao: "170g de hambúrguer gourmet, molho de cebola caramelizada, bacon inglês (lombo), muçarela, picles, tomate, alface no pão de hambúrguer."
        },
        { nome: "BBQ Chicken Burger", preco: 26, descricao: "Sassami de frango marinado, queijo com molho barbecue, bacon (lombo), tomate, alface." },
        { nome: "Veg Burger", preco: 25, descricao: "Queijo coalho como burger, alface, tomate, molho de pimenta agridoce no pão de hambúrguer." }
      ],
      adicionais: [
        { nome: "Adicional de batata", preco: 8 }
      ]
    },
    {
      id: "sobremesas",
      nome: "Sobremesas",
      itens: [
        {
          nome: "Mini Churros (8 unidades)",
          preco: 12,
          variacoes: [
            { nome: "Doce de leite", preco: 12 },
            { nome: "Nutella", preco: 14 }
          ],
          descricao: ""
        },
        { nome: "Sticky Toffee Pudding", preco: 15, descricao: "Bolinho de tâmaras tradicional, servido com calda de caramelo e sorvete de creme." },
        {
          nome: "Petit Gâteau",
          preco: 17,
          descricao: "Bolinho de chocolate com recheio de chocolate cremoso. Servido com chantili e sorvete de creme.",
          adicionais: [
            { nome: "Morango", preco: 6 }
          ]
        },
        { nome: "Brownie", preco: 18, descricao: "Receita do chef com chocolate nobre meio amargo. Acompanha sorvete de creme, decorado com morango." },
        {
          nome: "Belgian Waffle",
          preco: 24,
          descricao: "Com morango, chantili e sorvete de creme. Sabor: doce de leite, mel ou Nutella.",
          sabores: ["Doce de leite", "Mel", "Nutella"]
        }
      ]
    },
    {
      id: "bebidas",
      nome: "Bebidas",
      itens: [
        {
          nome: "Sucos",
          preco: 8,
          variacoes: [
            { nome: "Com água", preco: 8 },
            { nome: "Com leite", preco: 9 }
          ],
          descricao: "Maracujá, morango, morango com manjericão, abacaxi, abacaxi com hortelã, tangerina.",
          sabores: ["Maracujá", "Morango", "Morango com manjericão", "Abacaxi", "Abacaxi com hortelã", "Tangerina"]
        },
        { nome: "Refrigerante Lata", preco: 6, descricao: "" },
        { nome: "Coca-Cola Vidro 1L", preco: 10, descricao: "" },
        { nome: "Coca-Cola 2L", preco: 14, descricao: "" },
        {
          nome: "Chopp",
          preco: 7,
          maiores18: true,
          variacoes: [
            { nome: "300ml", preco: 7 },
            { nome: "500ml (Mega Chopp)", preco: 9 }
          ],
          descricao: "Mega Chopp."
        },
        {
          nome: "Cerveja Long Neck",
          preco: 9,
          maiores18: true,
          variacoes: [
            { nome: "Heineken", preco: 10 },
            { nome: "Sol", preco: 9 },
            { nome: "Budweiser", preco: 9 }
          ],
          descricao: ""
        },
        {
          nome: "Cerveja Lata",
          preco: 5,
          maiores18: true,
          variacoes: [
            { nome: "Skol", preco: 5 },
            { nome: "Brahma Duplo Malte", preco: 6 }
          ],
          descricao: ""
        },
        { nome: "Antarctica Original 600ml", preco: 14, maiores18: true, descricao: "600ml" }
      ]
    },
    {
      id: "frapes",
      nome: "Frapês",
      itens: [
        { nome: "Frosty Berries", preco: 21, descricao: "Frapê de frutas vermelhas, chantili e xarope de grenadine para finalizar." },
        { nome: "Ovomaltine", preco: 22, descricao: "Frapê de Ovomaltine, chantili e Ovomaltine para finalizar." }
      ]
    },
    {
      id: "drinks",
      nome: "Drinks",
      itens: [
        {
          nome: "Soda Italiana",
          preco: 14,
          descricao: "Sabores: cranberry, frutas vermelhas, maçã verde, limão siciliano.",
          sabores: ["Cranberry", "Frutas vermelhas", "Maçã verde", "Limão siciliano"]
        },
        { nome: "Pink Lemonade", preco: 16, descricao: "Limonada rosa, copo de 500ml. Bebida gourmet de suco de limão, suco de pêssego, xarope de groselha, água com gás e gelo." }
      ]
    },
    {
      id: "cocktails",
      nome: "Cocktails",
      maiores18: true,
      itens: [
        { nome: "Caipirinha", preco: 20, descricao: "Tradicional de limão." },
        { nome: "Day's Gin & Tonic", preco: 22, descricao: "Tradicional G&T com o nosso twist: cubinhos de morango e xarope de grenadine." },
        { nome: "Mojito", preco: 23, descricao: "Cocktail de rum com folhas de hortelã e limão." },
        { nome: "Rum Sunrise", preco: 24, descricao: "Suco de laranja, rum, xarope de frutas vermelhas. Um verdadeiro nascer do sol." },
        { nome: "Piña Colada", preco: 26, descricao: "Suco de abacaxi, leite condensado, leite de coco, rum e gelo." },
        { nome: "Strawberry Daiquiri", preco: 27, descricao: "Frozen cocktail de morango, limão, rum e gelo." }
      ]
    }
  ]
};
