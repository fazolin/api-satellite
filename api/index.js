const express = require("express");
require("dotenv").config();
const app = express();
const fs = require("fs");
const port = process.env.PORT || 3000;

const sateliteId = [25544, 25338];
const predictedSeconds = 30;
const urlN2yo = [];

console.log("[api-satellite] " + "Generating urls to fecth N2YO API.");

sateliteId.forEach(function (id, i) {
  urlN2yo[i] =
    "https://api.n2yo.com/rest/v1/satellite/positions/" +
    sateliteId[i] +
    "/0/0/0/" +
    predictedSeconds +
    "/&apiKey=" +
    process.env.N2YO_API_KEY;
  console.log("[api-satellite] " + urlN2yo[i]);
});

async function fetchDataFromUrlsAndSaveToFile(urls, filePath) {
  console.log("[api-satellite] [fetching data] Conectando na API.");
  try {
    // Mesmo código para buscar os dados das APIs
    const requests = urls.map((url) => fetch(url));
    const responses = await Promise.all(requests);
    const data = await Promise.all(
      responses.map((response) => response.json())
    );

    // Cria o caminho completo para o diretório "data" e o arquivo JSON
    const dataDirectory = `${__dirname}/data`;
    const outputFile = `${dataDirectory}/${filePath}`;

    // Verifica se o diretório "data" existe, senão, cria-o
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory);
    }

    // Escreve os dados em um arquivo JSON
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

    console.log("[api-satellite] [saving data] Dados salvos em:", filePath);
  } catch (error) {
    console.error(
      "[api-satellite] [saving data] Erro ao buscar dados ou salvar em arquivo:",
      error
    );
    throw error;
  }
}

const outputFile = "dados.json"; // Nome do arquivo de saída
function fetchDataAndSavePeriodically() {
  fetchDataFromUrlsAndSaveToFile(urlN2yo, outputFile)
    .then(() => {
      console.log("[api-satellite] [fetching data] Processo concluído.");
    })
    .catch((error) => {
      console.error(
        "[api-satellite] [fetching data] Erro durante o processo:",
        error
      );
    });
}
fetchDataAndSavePeriodically();
setInterval(fetchDataAndSavePeriodically, 30 * 60 * 1000);

app.use(express.static("./data", { index: false, extensions: ["json"] }));
app.use("/data", function (req, res, next) {
  res.send(JSON.stringify("/data/dados.json"));
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("[api-satellite] " + "API SATELLITES listening on port " + port);
});
