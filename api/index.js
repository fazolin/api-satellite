const express = require("express");
require("dotenv").config();
const app = express();
const fs = require("fs");
const port = process.env.PORT || 3000;

const sateliteId = process.env.SATELITES.split(", ");
const predictedSeconds = process.env.SEGUNDOS;
const urlN2yo = [];
let sateliteData;

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

async function fetchDataFromUrls(urls, filePath) {
  console.log("[api-satellite] [fetching data] Conectando na API.");
  try {
    // Mesmo código para buscar os dados das APIs
    const requests = urls.map((url) => fetch(url));
    const responses = await Promise.all(requests);
    sateliteData = await Promise.all(
      responses.map((response) => response.json())
    );
  } catch (error) {
    console.error("[api-satellite] [saving data] Erro ao buscar dados.", error);
    throw error;
  }
}

function fetchDataPeriodically() {
  fetchDataFromUrls(urlN2yo)
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
fetchDataPeriodically();
setInterval(fetchDataPeriodically, 30 * 60 * 1000);

app.get("/data", (req, res) => {
  try {
    res.status(200).send(sateliteData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao ler o arquivo");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("[api-satellite] " + "API SATELLITES listening on port " + port);
});
