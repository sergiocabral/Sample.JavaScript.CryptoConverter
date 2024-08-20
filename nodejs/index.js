async function perguntar(pergunta) {
  const readline = require('readline')
  const process = require('process')

  const parametrosDaInterface = {
    input: process.stdin,
    output: process.stdout,
  }

  const interfaceComUsuario = readline.createInterface(parametrosDaInterface)

  return new Promise(function(retornar) {
    interfaceComUsuario.question(
      pergunta,
      function(resposta) {
        retornar(resposta)

        interfaceComUsuario.close()
      }
    )
  })
}

const dadosDeConversao = {
  entrada: {
    valor: undefined,
    moeda: undefined,
  },
  saida: {
    moeda: undefined,
  }
}

async function receberParametrosDoUsuario() {
  dadosDeConversao.entrada.valor = await perguntar(`Qual o valor? `)
  dadosDeConversao.entrada.moeda = await perguntar(`Qual a moeda do valor informado? `)
  dadosDeConversao.saida.moeda = await perguntar(`Qual a moeda para conversão do valor? `)
}

async function executarPrograma() {
  console.info(`CONVERSOR DE MOEDAS`)
  console.info(`^^^^^^^^^^^^^^^^^^^`)

  await receberParametrosDoUsuario()

  console.info(`_______________`)
  console.info(`FIM DO PROGRAMA`)
}

executarPrograma()