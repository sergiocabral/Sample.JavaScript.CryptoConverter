const dadosDeConversao = {
  cotacoes: [],
  entrada: {
    valor: undefined,
    moeda: undefined,
  },
  saida: {
    moeda: undefined,
  }
}

function receberParametrosDoUsuario() {
  dadosDeConversao.entrada.valor = document.querySelector('.campo.entrada .valor').value
  dadosDeConversao.entrada.moeda = document.querySelector('.campo.entrada .moeda').value
  dadosDeConversao.saida.moeda = document.querySelector('.campo.saida .moeda').value
}

async function carregarDadosDeConversaoDeMoedas() {
  try {
    const url = "https://api2.binance.com/api/v3/ticker/24hr"
    const resposta = await fetch(url)
    const json = await resposta.json()
    return json
  } catch (erro) {
    return window.cotacaoDasMoedasPadrao
  }
}

async function receberCotacaoDasMoedas() {
  if (dadosDeConversao.cotacoes.length > 0) {
    return
  }

  const moedas = await carregarDadosDeConversaoDeMoedas()

  const paraBtc = moedas
    .filter(cotacao => cotacao.symbol.endsWith("BTC"))
    .map(cotacao => ({
      moeda: cotacao.symbol.substring(0, cotacao.symbol.indexOf("BTC")),
      valor: parseFloat(cotacao.lastPrice)
    }))

  const deBtc = moedas
    .filter(cotacao => cotacao.symbol.startsWith("BTC"))
    .map(cotacao => ({
      moeda: cotacao.symbol.substring(3),
      valor: 1 / parseFloat(cotacao.lastPrice)
    }))

  dadosDeConversao.cotacoes = [
    ...paraBtc,
    ...deBtc
  ]
}

function preencherCampoDeMoeda(select, moedas) {
  const valorOriginal = select.value
  select.innerHTML = ""
  moedas.forEach(moeda => {
    const option = document.createElement('option');
    option.value = moeda;
    option.textContent = moeda;
    select.appendChild(option);
  });
  select.value = valorOriginal
}

function preencherCamposDasMoedas() {
  let moedas = dadosDeConversao.cotacoes
    .map(cotacao => cotacao.moeda)
    .filter(moeda => moeda.trim())
  moedas.push('BTC')

  moedas = moedas
    .filter((moeda, index) => moedas.indexOf(moeda) === index)
    .sort()

  preencherCampoDeMoeda(document.querySelector('.campo.entrada .moeda'), moedas)
  preencherCampoDeMoeda(document.querySelector('.campo.saida .moeda'), moedas)
}

function calcularResultado() {
  const valorDeEntrada = parseFloat(dadosDeConversao.entrada.valor)
  const moedaDeEntrada = (dadosDeConversao.entrada.moeda || "BTC").toUpperCase()
  const moedaDeSaida = (dadosDeConversao.saida.moeda || "USDT").toUpperCase()

  if (isNaN(valorDeEntrada)) {
    console.error(`ERRO: Valor de entrada precisa ser numérico`)
    return
  }

  const cotacaoDaMoedaDeEntradaParaBtc = moedaDeEntrada === "BTC" ? 1 : dadosDeConversao.cotacoes.find(cotacao => cotacao.moeda === moedaDeEntrada)?.valor
  if (cotacaoDaMoedaDeEntradaParaBtc === undefined) {
    console.error(`ERRO: Moeda de entrada "${moedaDeEntrada}" não encontrada`)
  }
  const cotacaoDaMoedaDeSaidaParaBtc = moedaDeSaida === "BTC" ? 1 : dadosDeConversao.cotacoes.find(cotacao => cotacao.moeda === moedaDeSaida)?.valor
  if (cotacaoDaMoedaDeSaidaParaBtc === undefined) {
    console.error(`ERRO: Moeda de saída "${moedaDeSaida}" não encontrada`)
  }
  if (cotacaoDaMoedaDeEntradaParaBtc === undefined || cotacaoDaMoedaDeSaidaParaBtc === undefined) {
    return
  }

  const razao = cotacaoDaMoedaDeEntradaParaBtc / cotacaoDaMoedaDeSaidaParaBtc
  const valorDeSaida = valorDeEntrada * razao

  const calcularCasasDecimais = moeda => moeda.includes('USD') || moeda.includes('BRL') ? 2 : 8
  const casasDecimais = {
    valorDeEntrada: calcularCasasDecimais(moedaDeEntrada),
    valorDeSaida: calcularCasasDecimais(moedaDeSaida),
  }

  document.querySelector('.campo.entrada .valor').value = valorDeEntrada.toFixed(casasDecimais.valorDeEntrada)
  document.querySelector('.campo.saida .valor').value = valorDeSaida.toFixed(casasDecimais.valorDeSaida)
}

async function executarPrograma() {
  receberParametrosDoUsuario()
  await receberCotacaoDasMoedas()
  preencherCamposDasMoedas()
  calcularResultado()
}

executarPrograma()