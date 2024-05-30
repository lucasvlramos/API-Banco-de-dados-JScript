const express = require('express');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const app = express();
app.use(express.json());

// Listas de armazenamento de dados
let dados_base = [];
let dados_cliente = [];
let regras_negocio = [];

// Rota para coleta de informações do banco 1
app.post('/banco1', (req, res) => {
  dados_base = dados_base.concat(req.body);
  res.status(200).send("Dados do Banco 1 recebidos com sucesso!");
});

// Rota para coleta de informações do banco 2
app.post('/banco2', (req, res) => {
  dados_cliente = dados_cliente.concat(req.body);
  res.status(200).send("Dados do Banco 2 recebidos com sucesso!");
});

// Rota para coleta de informações do banco 3
app.post('/banco3', (req, res) => {
  regras_negocio = regras_negocio.concat(req.body);
  res.status(200).send("Dados do Banco 3 recebidos com sucesso!");
});

// Rota para consolidar as informações recebidas dos 3 bancos
app.get('/consolidar', (req, res) => {
  const dados_consolidados = {
    dados_base,
    dados_cliente,
    regras_negocio
  };
  res.status(200).json(dados_consolidados);
});

// Rota para envio do arquivo
app.post('/enviar_arquivo', (req, res) => {
  const nome_arquivo = 'arquivo_lote.csv';
  const endpoint = 'https://pre-mg-api.telefonicateste.com/Yuop/v2';
  const appKey = 'rgyha64y71jifr7jarg9l4432';
  const hostname = 'VMSCETOE9898';

  if (fs.existsSync(nome_arquivo)) {
    const fileExt = path.extname(nome_arquivo);
    
    // Verificação do formato do arquivo
    if (fileExt !== '.csv') {
      console.log("Arquivo não está no formato CSV.");
      return res.status(400).send("Arquivo não está no formato CSV.");
    }

    const fileStream = fs.createReadStream(nome_arquivo);
    const formData = new FormData();
    formData.append('file', fileStream, {
      contentType: 'text/csv',
      filename: path.basename(nome_arquivo)
    });

    // Log para verificar se o arquivo está sendo enviado
    console.log("Enviando arquivo:", nome_arquivo);
    
    axios.post(endpoint, formData, {
      headers: {
        ...formData.getHeaders(),
        'AppKey': appKey,
        'Hostname': hostname
      }
    })
    .then(response => {
      if (response.status === 200) {
        console.log("Arquivo enviado com sucesso:", nome_arquivo);
        res.status(200).send("Arquivo enviado com sucesso!");
      } else {
        console.log("Erro ao enviar o arquivo, status:", response.status);
        res.status(500).send("Erro ao enviar o arquivo.");
      }
    })
    .catch(error => {
      console.log("Erro ao enviar o arquivo:", error.message);
      res.status(500).send("Erro ao enviar o arquivo.");
    });
  } else {
    console.log("Arquivo não encontrado:", nome_arquivo);
    res.status(404).send("Arquivo não encontrado.");
  }
});

// Inicia o servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Servidor rodando na porta ${PORT});
});

