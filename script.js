/* London Bistrô — tudo é gerado a partir de CONFIG (config.js). */
(() => {
  "use strict";

  const R = CONFIG.restaurante;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: CONFIG.moeda });
  const preco = (v) => brl.format(v);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- Links e textos de contato ---------------- */
  const BUSCA = encodeURIComponent(R.local.busca);
  const LINKS = {
    whatsapp: `https://wa.me/${R.whatsapp}`,
    instagram: `https://www.instagram.com/${R.instagram.replace("@", "")}/`,
    rota: `https://www.google.com/maps/dir/?api=1&destination=${BUSCA}`,
    waze: `https://waze.com/ul?q=${BUSCA}&navigate=yes`,
    "pedido-choco": `https://wa.me/${R.whatsapp}?text=${encodeURIComponent(`Olá, ${R.nome}! Quero um chocolate quente.`)}`
  };
  $$("[data-link]").forEach((a) => { a.href = LINKS[a.dataset.link]; });
  $$("[data-texto]").forEach((el) => { el.textContent = R[el.dataset.texto]; });
  $$("[data-local]").forEach((el) => { el.textContent = R.local[el.dataset.local]; });
  const mapa = $("#mapa");
  if (mapa) mapa.src = `https://maps.google.com/maps?q=${BUSCA}&z=17&hl=pt-BR&output=embed`;
  $("#ano").textContent = new Date().getFullYear();

  const ICO = (id, cls = "ico") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;


  /* ---------------- Horários (fuso de São Paulo) ---------------- */
  const DIAS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const DIAS_TXT = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const normaliza = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  // Converte "Terça a Quinta" / "Sábado e Domingo" + "10h às 20h" numa grade por dia da semana.
  function montaGrade() {
    const grade = Array(7).fill(null);
    R.horarios.forEach((h, linha) => {
      const partes = normaliza(h.dias);
      let dias = [];
      const faixa = partes.match(/^(\w+) a (\w+)$/);
      if (faixa) {
        let i = DIAS.indexOf(faixa[1]);
        const fim = DIAS.indexOf(faixa[2]);
        dias.push(i);
        while (i !== fim) { i = (i + 1) % 7; dias.push(i); }
      } else {
        dias = partes.split(/\s*(?:,|\be\b)\s*/).map((d) => DIAS.indexOf(d)).filter((d) => d >= 0);
      }
      const m = h.horario.match(/(\d{1,2})h(\d{2})?\s*(?:às|as|-)\s*(\d{1,2})h(\d{2})?/i);
      const janela = m ? { abre: +m[1] * 60 + +(m[2] || 0), fecha: +m[3] * 60 + +(m[4] || 0) } : null;
      dias.forEach((d) => { grade[d] = janela ? { ...janela, linha } : { linha, fechado: true }; });
    });
    return grade;
  }
  const GRADE = montaGrade();
  const aberto = (d) => GRADE[d] && !GRADE[d].fechado ? GRADE[d] : null;

  function agoraSP() {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone: R.fuso, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).map((x) => [x.type, x.value])
    );
    const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    return { dia, min: +p.hour * 60 + +p.minute };
  }
  const hora = (min, curto = true) => {
    const h = Math.floor(min / 60), m = min % 60;
    return curto && m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
  };

  function status() {
    const { dia, min } = agoraSP();
    const hoje = aberto(dia);
    if (hoje && min >= hoje.abre && min < hoje.fecha) {
      return { aberto: true, texto: `Aberto agora, fecha às ${hora(hoje.fecha)}` };
    }
    if (hoje && min < hoje.abre) return { aberto: false, texto: `Fechado agora, abre hoje às ${hora(hoje.abre)}` };
    for (let i = 1; i <= 7; i++) {
      const d = (dia + i) % 7, j = aberto(d);
      if (j) return { aberto: false, texto: `Fechado agora, abre ${i === 1 ? "amanhã" : DIAS_TXT[d]} às ${hora(j.abre)}` };
    }
    return { aberto: false, texto: "Fechado" };
  }

  function pintaStatus() {
    const s = status();
    $$("[data-status]").forEach((el) => {
      el.textContent = s.texto;
      el.classList.toggle("aberto", s.aberto);
      el.classList.toggle("fechado", !s.aberto);
    });
  }

  function pintaTabela() {
    const linhaHoje = GRADE[agoraSP().dia]?.linha;
    $("#tabelaHorarios").innerHTML = R.horarios.map((h, i) =>
      `<tr class="${[i === linhaHoje ? "hoje" : "", /fechado/i.test(h.horario) ? "fechado-dia" : ""].join(" ").trim()}"${i === linhaHoje ? ' aria-current="date"' : ""}><th scope="row">${esc(h.dias)}</th><td>${esc(h.horario)}</td></tr>`
    ).join("");
    $("#rodapeHoras").innerHTML = R.horarios.map((h) => `<dt>${esc(h.dias)}</dt><dd>${esc(h.horario)}</dd>`).join("");
  }

  // Horários de retirada/consumo: a partir de agora + 20 min, de 15 em 15, só dentro do funcionamento.
  function horariosDisponiveis() {
    const { dia, min } = agoraSP();
    for (let i = 0; i < 8; i++) {
      const d = (dia + i) % 7, j = aberto(d);
      if (!j) continue;
      let inicio = i === 0 ? Math.max(j.abre, min + 20) : j.abre;
      inicio = Math.ceil(inicio / 15) * 15;
      const fim = j.fecha - 15;
      if (inicio > fim) continue;
      const rotuloDia = i === 0 ? "hoje" : i === 1 ? "amanhã" : DIAS_TXT[d];
      const lista = [];
      for (let t = inicio; t <= fim; t += 15) lista.push({ valor: `${rotuloDia}|${t}`, dia: rotuloDia, hora: hora(t, false) });
      return lista;
    }
    return [];
  }

  pintaStatus();
  pintaTabela();
  setInterval(() => { pintaStatus(); pintaTabela(); }, 60000);

  /* ---------------- Cardápio ---------------- */
  const CATS = CONFIG.categorias;
  let catAtual = 0;

  const precoBase = (item) => item.variacoes ? Math.min(...item.variacoes.map((v) => v.preco)) : item.preco;
  const temOpcoes = (item, cat) => !!(item.variacoes || item.sabores || item.adicionais || cat.adicionais);
  const proibido18 = (item, cat) => !!(item.maiores18 || cat.maiores18);

  $("#abas").innerHTML = CATS.map((c, i) =>
    `<button class="aba" type="button" role="tab" id="aba-${c.id}" aria-controls="vitrine" aria-selected="${i === 0}" data-cat="${i}">${esc(c.nome)}</button>`
  ).join("");

  const SETA = (dir) => `<button class="seta" type="button" data-passo="${dir}" aria-label="${dir < 0 ? "Categoria anterior" : "Próxima categoria"}">
    <svg viewBox="0 0 26 40" aria-hidden="true"><path d="${dir < 0 ? "M20 3 4 20l16 17" : "M6 3l16 17L6 37"}"/></svg></button>`;

  function cardItem(item, cat, ci, i = 0) {
    const varios = !!item.variacoes && new Set(item.variacoes.map((v) => v.preco)).size > 1;
    const desc = item.descricao || (item.variacoes ? item.variacoes.map((v) => v.nome).join(", ") : "");
    return `<article class="card-menu" style="--i:${i}">
      <h3 class="card-menu__nome">${esc(item.nome)}${proibido18(item, cat) ? '<span class="tag18" title="Proibido para menores de 18 anos">+18</span>' : ""}</h3>
      <p class="card-menu__desc">${esc(desc)}</p>
      <div class="card-menu__rodape">
        <p class="card-menu__preco">${varios ? "<small>a partir de</small>" : ""}${preco(precoBase(item))}</p>
        <button class="card-menu__add" type="button" data-add="${ci}:${CATS[ci].itens.indexOf(item)}" aria-label="Adicionar ${esc(item.nome)}">${ICO("i-plus")}Adicionar</button>
      </div>
    </article>`;
  }

  function pintaVitrine() {
    const cat = CATS[catAtual];
    const fileiras = [];
    for (let i = 0; i < cat.itens.length; i += 4) fileiras.push(cat.itens.slice(i, i + 4));
    $("#vitrine").innerHTML = fileiras.map((f, fi) =>
      `<div class="fileira">${SETA(-1)}<div class="cards-menu">${f.map((it, j) => cardItem(it, cat, catAtual, fi * 4 + j)).join("")}</div>${SETA(1)}</div>`
    ).join("");
    $("#vitrine").setAttribute("aria-labelledby", `aba-${cat.id}`);
    $$(".aba").forEach((b, i) => {
      b.setAttribute("aria-selected", i === catAtual);
      b.tabIndex = i === catAtual ? 0 : -1;
    });
    $("#aviso18").hidden = !cat.itens.some((it) => proibido18(it, cat));
    $("#btnMais").textContent = `Mais: ${CATS[(catAtual + 1) % CATS.length].nome}`;
  }

  function trocaCategoria(nova, dir = 1) {
    nova = (nova + CATS.length) % CATS.length;
    if (nova === catAtual) return;
    const v = $("#vitrine");
    v.style.setProperty("--dir", `${-dir * 24}px`);
    v.classList.add("saindo");
    setTimeout(() => {
      catAtual = nova;
      pintaVitrine();
      v.style.setProperty("--dir", `${dir * 24}px`);
      v.classList.add("trocou");
      requestAnimationFrame(() => v.classList.remove("saindo"));
      $(`#aba-${CATS[catAtual].id}`).scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }, 180);
  }

  $("#abas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (b) trocaCategoria(+b.dataset.cat, +b.dataset.cat > catAtual ? 1 : -1);
  });
  $("#abas").addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const dir = e.key === "ArrowRight" ? 1 : -1;
    trocaCategoria(catAtual + dir, dir);
    setTimeout(() => $(`#aba-${CATS[catAtual].id}`).focus(), 200);
  });
  $("#vitrine").addEventListener("click", (e) => {
    const seta = e.target.closest("[data-passo]");
    if (seta) return trocaCategoria(catAtual + +seta.dataset.passo, +seta.dataset.passo);
    const add = e.target.closest("[data-add]");
    if (add) { const [c, i] = add.dataset.add.split(":").map(Number); pedirItem(c, i, add); }
  });
  $("#btnMais").addEventListener("click", () => {
    trocaCategoria(catAtual + 1, 1);
    $("#cardapio").scrollIntoView({ behavior: "smooth" });
  });
  pintaVitrine();

  /* ---------------- Carrinho (em memória) ---------------- */
  const carrinho = [];
  const QTD_MAX = 30;
  let itemModal = null;

  const modal = $("#modalItem");
  const painel = $("#painel");

  let origem = null;
  function pedirItem(ci, ii, botao) {
    const cat = CATS[ci], item = cat.itens[ii];
    origem = botao || null;
    if (!temOpcoes(item, cat)) {
      adiciona({ item, cat, variacao: null, sabor: null, adicionais: [], qtd: 1 });
      return;
    }
    itemModal = { ci, ii };
    $("#modalTitulo").textContent = item.nome;
    $("#modalDesc").textContent = item.descricao;
    const adicionais = [...(cat.adicionais || []), ...(item.adicionais || [])];
    let html = "";
    if (item.variacoes) html += grupoRadio("Escolha a opção", "variacao", item.variacoes.map((v, i) => ({ valor: i, txt: v.nome, extra: preco(v.preco) })));
    if (item.sabores) html += grupoRadio("Escolha o sabor", "sabor", item.sabores.map((s, i) => ({ valor: i, txt: s })));
    if (adicionais.length) {
      html += `<fieldset class="grupo"><legend>Adicionais</legend>${adicionais.map((a, i) =>
        `<label class="check"><input type="checkbox" name="adicional" value="${i}"> ${esc(a.nome)} <b>+ ${preco(a.preco)}</b></label>`).join("")}</fieldset>`;
    }
    if (proibido18(item, cat)) html += `<p class="aviso-modal">Venda proibida para menores de 18 anos.</p>`;
    $("#modalOpcoes").innerHTML = html;
    $("#modalOpcoes").dataset.adicionais = JSON.stringify(adicionais);
    $("#modalQtd").value = 1;
    atualizaModal();
    modal.showModal();
  }

  const grupoRadio = (titulo, nome, ops) =>
    `<fieldset class="grupo"><legend>${titulo}</legend><div class="opcoes">${ops.map((o, i) =>
      `<label class="opcao"><input type="radio" name="${nome}" value="${o.valor}"${i === 0 ? " checked" : ""}><span>${esc(o.txt)}${o.extra ? `<em>${esc(o.extra)}</em>` : ""}</span></label>`).join("")}</div></fieldset>`;

  function leModal() {
    const cat = CATS[itemModal.ci], item = cat.itens[itemModal.ii];
    const f = $("#formItem");
    const vi = f.querySelector("[name=variacao]:checked");
    const si = f.querySelector("[name=sabor]:checked");
    const lista = JSON.parse($("#modalOpcoes").dataset.adicionais);
    return {
      item, cat,
      variacao: vi ? item.variacoes[+vi.value] : null,
      sabor: si ? item.sabores[+si.value] : null,
      adicionais: $$("[name=adicional]:checked", f).map((c) => lista[+c.value]),
      qtd: +$("#modalQtd").value
    };
  }
  const unitario = (l) => (l.variacao ? l.variacao.preco : l.item.preco) + l.adicionais.reduce((s, a) => s + a.preco, 0);

  function atualizaModal() {
    const l = leModal();
    $("#modalAdd").innerHTML = `Adicionar <span class="btn__valor">${preco(unitario(l) * l.qtd)}</span>`;
  }
  $("#formItem").addEventListener("change", atualizaModal);
  $$("[data-qtd]", modal).forEach((b) => b.addEventListener("click", () => {
    const o = $("#modalQtd");
    o.value = Math.min(QTD_MAX, Math.max(1, +o.value + +b.dataset.qtd));
    atualizaModal();
  }));
  $("#formItem").addEventListener("submit", (e) => {
    e.preventDefault();
    adiciona(leModal());
    modal.close();
  });

  const chave = (l) => [l.item.nome, l.variacao?.nome, l.sabor, l.adicionais.map((a) => a.nome).join("+")].join("|");

  function adiciona(l) {
    const existente = carrinho.find((x) => chave(x) === chave(l));
    if (existente) existente.qtd = Math.min(QTD_MAX, existente.qtd + l.qtd);
    else carrinho.push({ ...l, obs: "" });
    atualizaCarrinho();
    toast(`${l.qtd}x ${l.item.nome} no pedido`);
    $$("[data-contador]").forEach((b) => { b.classList.remove("pulo"); void b.offsetWidth; b.classList.add("pulo"); });
    if (origem && origem.classList.contains("card-menu__add")) {
      const b = origem, html = b.innerHTML;
      b.classList.add("ok");
      b.innerHTML = `${ICO("i-check")}Adicionado`;
      setTimeout(() => { b.classList.remove("ok"); b.innerHTML = html; }, 1400);
    }
    origem = null;
  }

  const descricaoLinha = (l) => {
    const extras = [l.variacao?.nome, l.sabor].filter(Boolean);
    return `${l.item.nome}${extras.length ? ` (${extras.join(", ")})` : ""}${l.adicionais.map((a) => ` + ${a.nome}`).join("")}`;
  };
  const total = () => carrinho.reduce((s, l) => s + unitario(l) * l.qtd, 0);
  const totalItens = () => carrinho.reduce((s, l) => s + l.qtd, 0);

  function atualizaCarrinho() {
    const n = totalItens();
    $$("[data-contador]").forEach((b) => { b.textContent = n; b.hidden = n === 0; });
    $$("[data-contador-txt]").forEach((s) => { s.textContent = n ? `(${n})` : ""; });
    $("#barra").hidden = n === 0;
    document.body.classList.toggle("tem-carrinho", n > 0);
    $("#barraQtd").textContent = `${n} ${n === 1 ? "item" : "itens"}`;
    $("#barraTotal").textContent = preco(total());
    pintaPainel();
  }

  function pintaPainel() {
    $("#painelVazio").hidden = carrinho.length > 0;
    $("#formPedido").hidden = carrinho.length === 0;
    $("#painelTotal").textContent = preco(total());
    $("#painelItens").innerHTML = carrinho.map((l, i) => `
      <li class="linha">
        <div class="linha__topo">
          <div>
            <div class="linha__nome">${esc(l.item.nome)}</div>
            <div class="linha__extra">${esc([l.variacao?.nome, l.sabor, ...l.adicionais.map((a) => "+ " + a.nome)].filter(Boolean).join(", "))}</div>
          </div>
          <span class="linha__preco">${preco(unitario(l) * l.qtd)}</span>
        </div>
        <div class="linha__acoes">
          <div class="qtd qtd--mini" aria-label="Quantidade de ${esc(l.item.nome)}">
            <button type="button" data-linha="${i}" data-delta="-1" aria-label="Diminuir">−</button>
            <output>${l.qtd}</output>
            <button type="button" data-linha="${i}" data-delta="1" aria-label="Aumentar">+</button>
          </div>
          <button class="linha__remover" type="button" data-remover="${i}">Remover</button>
        </div>
        <input type="text" maxlength="140" data-obs="${i}" value="${esc(l.obs)}" placeholder="Observação (ex.: sem picles)" aria-label="Observação para ${esc(l.item.nome)}">
      </li>`).join("");
  }

  $("#painelItens").addEventListener("click", (e) => {
    const d = e.target.closest("[data-delta]");
    const r = e.target.closest("[data-remover]");
    if (d) {
      const l = carrinho[+d.dataset.linha];
      l.qtd = Math.min(QTD_MAX, l.qtd + +d.dataset.delta);
      if (l.qtd < 1) carrinho.splice(+d.dataset.linha, 1);
    } else if (r) carrinho.splice(+r.dataset.remover, 1);
    else return;
    atualizaCarrinho();
  });
  $("#painelItens").addEventListener("input", (e) => {
    if (e.target.dataset.obs != null) carrinho[+e.target.dataset.obs].obs = e.target.value;
  });

  function pintaHorarios() {
    const sel = $("#cliHora"), atual = sel.value;
    const lista = horariosDisponiveis();
    const grupos = {};
    lista.forEach((h) => (grupos[h.dia] ||= []).push(h));
    sel.innerHTML = Object.entries(grupos).map(([dia, hs]) =>
      `<optgroup label="${dia[0].toUpperCase() + dia.slice(1)}">${hs.map((h) => `<option value="${h.valor}">${dia === "hoje" ? "" : dia + ", "}${h.hora}</option>`).join("")}</optgroup>`
    ).join("");
    if ([...sel.options].some((o) => o.value === atual)) sel.value = atual;
  }

  function abrePainel() {
    pintaHorarios();
    pintaPainel();
    $("#painelErro").textContent = "";
    painel.showModal();
  }
  $$("[data-abrir-carrinho]").forEach((b) => b.addEventListener("click", abrePainel));
  $("#btnIrCardapio").addEventListener("click", () => {
    painel.close();
    $("#cardapio").scrollIntoView({ behavior: "smooth" });
  });
  $$("[data-fechar]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
  [modal, painel].forEach((dlg) => dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); }));

  function mensagem() {
    const nome = $("#cliNome").value.trim();
    const modo = $("[name=modo]:checked").value;
    const [dia, min] = $("#cliHora").value.split("|");
    const quando = `${dia === "hoje" ? "" : dia + " "}às ${hora(+min, false)}`;
    const linhas = [
      `Olá, ${R.nome}! 🇬🇧`,
      `Pedido de: ${nome}`,
      ...carrinho.flatMap((l) => {
        const out = [`• ${l.qtd}x ${descricaoLinha(l)} — ${preco(unitario(l) * l.qtd)}`];
        if (l.obs.trim()) out.push(`  Obs: ${l.obs.trim()}`);
        return out;
      }),
      `Total: ${preco(total())}`,
      `${modo === "retirada" ? "Retirada no balcão" : "Consumo no local"} ${quando}`
    ];
    return linhas.join("\n");
  }

  // O envio é um link de verdade (abre o WhatsApp numa aba nova); a validação acontece no clique.
  function validaPedido() {
    const erro = $("#painelErro");
    const nome = $("#cliNome");
    if (!nome.value.trim()) {
      erro.textContent = "Informe seu nome para o balcão chamar você.";
      nome.setAttribute("aria-invalid", "true");
      nome.focus();
      return false;
    }
    nome.removeAttribute("aria-invalid");
    if (!$("#cliHora").value) {
      erro.textContent = "Não há horário disponível nos próximos dias. Fale com a gente pelo WhatsApp.";
      return false;
    }
    erro.textContent = "";
    return true;
  }
  $("#enviarPedido").addEventListener("click", (e) => {
    if (!validaPedido()) { e.preventDefault(); return; }
    e.currentTarget.href = `https://wa.me/${R.whatsapp}?text=${encodeURIComponent(mensagem())}`;
    toast("Pedido aberto no WhatsApp. É só enviar a mensagem.");
  });
  $("#formPedido").addEventListener("submit", (e) => {
    e.preventDefault();
    if (validaPedido()) $("#enviarPedido").focus();
  });

  /* ---------------- Reserva de mesa ---------------- */
  const modalReserva = $("#modalReserva");
  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const hojeSP = () => new Intl.DateTimeFormat("en-CA", { timeZone: R.fuso }).format(new Date()); // AAAA-MM-DD
  const diaDaSemana = (iso) => new Date(`${iso}T12:00:00`).getDay();
  let pessoas = 2;

  // Horários de 30 em 30 min, até 1 hora antes de fechar; hoje, só a partir de agora + 30 min.
  const LIMITE_DIAS = 60;
  const somaDias = (iso, n) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  function horariosReserva(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || iso < hojeSP() || iso > somaDias(hojeSP(), LIMITE_DIAS)) return [];
    const j = aberto(diaDaSemana(iso));
    if (!j) return [];
    let inicio = j.abre;
    if (iso === hojeSP()) inicio = Math.max(inicio, Math.ceil((agoraSP().min + 30) / 30) * 30);
    const lista = [];
    for (let t = inicio; t <= j.fecha - 60; t += 30) lista.push(t);
    return lista;
  }

  function pintaHorasReserva() {
    const iso = $("#resData").value, sel = $("#resHora"), atual = sel.value;
    const lista = iso ? horariosReserva(iso) : [];
    sel.innerHTML = lista.length
      ? lista.map((t) => `<option value="${t}">${hora(t, false)}</option>`).join("")
      : `<option value="">${iso && !aberto(diaDaSemana(iso)) ? "Fechado neste dia" : "Sem horários neste dia"}</option>`;
    sel.disabled = !lista.length;
    if ([...sel.options].some((o) => o.value === atual)) sel.value = atual;
  }

  function abreReserva() {
    const data = $("#resData");
    data.min = hojeSP();
    data.max = somaDias(hojeSP(), LIMITE_DIAS);
    if (!data.value || data.value < data.min || data.value > data.max) {
      // primeiro dia aberto com horário disponível
      const d = new Date(`${hojeSP()}T12:00:00`);
      for (let i = 0; i < 8; i++) {
        const iso = d.toISOString().slice(0, 10);
        if (horariosReserva(iso).length) { data.value = iso; break; }
        d.setDate(d.getDate() + 1);
      }
    }
    pintaHorasReserva();
    $("#resErro").textContent = "";
    modalReserva.showModal();
  }
  $$("[data-abrir-reserva]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); abreReserva(); }));
  $("#resData").addEventListener("change", pintaHorasReserva);
  $$("[data-pessoas]").forEach((b) => b.addEventListener("click", () => {
    pessoas = Math.min(30, Math.max(1, pessoas + +b.dataset.pessoas));
    $("#resPessoas").value = pessoas;
  }));
  modalReserva.addEventListener("click", (e) => { if (e.target === modalReserva) modalReserva.close(); });

  function validaReserva() {
    const erro = $("#resErro"), nome = $("#resNome");
    if (!nome.value.trim()) {
      erro.textContent = "Informe seu nome para a reserva.";
      nome.setAttribute("aria-invalid", "true");
      nome.focus();
      return false;
    }
    nome.removeAttribute("aria-invalid");
    if (!$("#resData").value || !$("#resHora").value) {
      erro.textContent = "Escolha um dia em que o London esteja aberto.";
      $("#resData").focus();
      return false;
    }
    erro.textContent = "";
    return true;
  }
  function mensagemReserva() {
    const iso = $("#resData").value;
    const [, m, d] = iso.split("-");
    const obs = $("#resObs").value.trim();
    return [
      `Olá, ${R.nome}! Gostaria de reservar uma mesa.`,
      `Nome: ${$("#resNome").value.trim()}`,
      `Dia: ${DIAS_TXT[diaDaSemana(iso)]}, ${+d} de ${MESES[+m - 1]}`,
      `Horário: ${hora(+$("#resHora").value, false)}`,
      `Pessoas: ${pessoas}`,
      ...(obs ? [`Obs: ${obs}`] : [])
    ].join("\n");
  }
  $("#enviarReserva").addEventListener("click", (e) => {
    if (!validaReserva()) { e.preventDefault(); return; }
    e.currentTarget.href = `https://wa.me/${R.whatsapp}?text=${encodeURIComponent(mensagemReserva())}`;
    toast("Pedido de reserva aberto no WhatsApp. A equipe confirma por lá.");
  });
  $("#formReserva").addEventListener("submit", (e) => {
    e.preventDefault();
    if (validaReserva()) $("#enviarReserva").focus();
  });

  /* ---------------- Header, menu mobile, toast ---------------- */
  const header = $("#header");
  const onScroll = () => {
    header.classList.toggle("rolou", window.scrollY > 40);
    document.body.classList.toggle("passou-topo", window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const btnMenu = $("#btnMenu"), nav = $("#nav");
  btnMenu.addEventListener("click", () => {
    const abre = !nav.classList.contains("aberto");
    nav.classList.toggle("aberto", abre);
    header.classList.toggle("menu-aberto", abre);
    btnMenu.setAttribute("aria-expanded", abre);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) { nav.classList.remove("aberto"); header.classList.remove("menu-aberto"); btnMenu.setAttribute("aria-expanded", false); }
  });

  const links = $$(".header__nav a:not([data-abrir-reserva])");
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("ativo", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["topo", "cardapio", "chocolate", "sobre", "visite"]
    .forEach((id) => obs.observe(document.getElementById(id)));

  /* Animações ao rolar: só marcam o elemento uma vez quando ele aparece */
  $$(".anima-lista").forEach((lista) => [...lista.children].forEach((el, i) => el.style.setProperty("--i", i)));
  if ("IntersectionObserver" in window) {
    const visto = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("visto");
        en.target.classList.remove("espera");
        visto.unobserve(en.target);
      });
    }, { threshold: 0.2 });
    $$(".anima-lista, .choco").forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add("espera");
      visto.observe(el);
    });
  } else {
    $$(".anima-lista, .choco").forEach((el) => el.classList.add("visto"));
  }

  let toastT;
  function toast(txt) {
    const t = $("#toast");
    t.innerHTML = `${ICO("i-check")}<span>${esc(txt)}</span>`;
    t.classList.add("visivel");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("visivel"), 2200);
  }

  atualizaCarrinho();
})();
