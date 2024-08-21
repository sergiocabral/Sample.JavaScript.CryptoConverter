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

async function calcularResultado() {
  const valorDeEntrada = parseFloat(dadosDeConversao.entrada.valor)
  const moedaDeEntrada = (dadosDeConversao.entrada.moeda || "BTC").toUpperCase()
  const moedaDeSaida = (dadosDeConversao.saida.moeda || "USDT").toUpperCase()

  if (isNaN(valorDeEntrada)) {
    console.error(`ERRO: Valor de entrada precisa ser numérico`)
    return
  }

  await receberCotacaoDasMoedas()

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

  console.info(`RESULTADO: ${valorDeEntrada.toFixed(casasDecimais.valorDeEntrada)} ${moedaDeEntrada} -> ${valorDeSaida.toFixed(casasDecimais.valorDeSaida)} ${moedaDeSaida}`)
}

async function executarPrograma() {
  console.info(`CONVERSOR DE MOEDAS`)
  console.info(`^^^^^^^^^^^^^^^^^^^`)

  receberParametrosDoUsuario()
  await calcularResultado()

  console.info(`_______________`)
  console.info(`FIM DO PROGRAMA`)
}

executarPrograma()