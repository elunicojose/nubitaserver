require("dotenv").config();
const mysql = require("mysql2/promise");
var cors = require("cors");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>Nubita!</h1>")
})

app.get("/api/frutas", (req, res) => {
  console.log("en local app get...");
  async function getFrutas() {
    console.log("en remote app get...");
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: process.env.host || "http://localhost",
      port: 3306,
      database: "nubitamix",
      user: process.env.user || "root",
      password: process.env.password || "rootpass",
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // A simple SELECT query
    try {
      const [result, fields] = await connection.query("SELECT * FROM `frutas`");
      console.log("result: ", result); // results contains rows returned by server
      res.set('Access-Control-Allow-Origin', '*');
      res.json(result);
    } catch (err) {
      console.log(err);
    }
  }
  getFrutas();
});

app.get("/api/mixes", (req, res) => {
  // TO DO
});


/*
app.post("/api/addFruta", (req, res) => {
  console.log(req.body);
  if (req.body.action == "ADD") {
    //AGREGAR FRUTA
    var fruta = {
      nombre: req.body.nombre,
      costo: req.body.costo,
      flete: req.body.flete,
      total: (parseFloat(req.body.costo) + parseFloat(req.body.flete)).toFixed(2),
    };

    fruta.id = arrFrutas.length + 1;
    arrFrutas.push(fruta);
    handleSaveData(arrFrutas, "frutas.json")
    console.log("Nueva fruta agregada");
     //pendiente grabar fruta. ver si el ID y total viene desde cliente o si se genera en servidor
  } else if (req.body.action == "EDIT") {
      console.log('editar en server', req)
  }

  res.status(200).json(req.body);
});*/


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

