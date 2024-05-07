require("dotenv").config();
const mysql = require("mysql2/promise");
var cors = require("cors");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

//const database = require('./utils/sqlConnection'); 


const PORT = process.env.PORT || 3001;

/*
BD REMOTA
database: "brhtiwji8gfuvzjetgyo",
*/

app.use(cors());

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h1>Nubita!</h1>")
})

app.get("/api/frutas", (req, res) => {
  console.log("en server local app get frutas...");
  async function getFrutas() {
    console.log("en remote app get...host= " + process.env.host + ", user= " + process.env.user);
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: process.env.host || "http://localhost",
      port: 3306,
      database: process.env.database || "nubitamix",
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
  console.log("en server local app get mixes...");
  async function getMixes() {
    console.log("en remote app get...host= " + process.env.host + ", user= " + process.env.user);
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: process.env.host || "http://localhost",
      port: 3306,
      database: process.env.database || "nubitamix",
      user: process.env.user || "root",
      password: process.env.password || "rootpass",
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // A simple SELECT query
    try {
      const [result, fields] = await connection.query("SELECT * FROM `mixes`");
      console.log("result: ", result); // results contains rows returned by server
      res.set('Access-Control-Allow-Origin', '*');
      res.json(result);
    } catch (err) {
      console.log(err);
    }
  }
  getMixes();
});


app.post("/api/addFruta", (req, res) => {
  console.log(req.body);
  var fruta = {
    id: req.body.id,
    nombre: req.body.nombre,
    costo: req.body.costo,
    flete: req.body.flete,
    total: (parseFloat(req.body.costo) + parseFloat(req.body.flete)).toFixed(2),
  };

  if (req.body.action == "ADD") {
    handleSaveData(fruta, res)
  } else if (req.body.action == "EDIT") {
    handleEditData(fruta, res)
  }

  res.status(200).json(req.body);
});

async function handleSaveData(fruta, res) {
  console.log('guardar fruta= ' + fruta.nombre + ', costo= ' + fruta.costo + ', flete= ' + fruta.flete + ', total= ' + fruta.total)
  // Create the connection to database
  const connection = await mysql.createConnection({
    host: process.env.host || "http://localhost",
    port: 3306,
    database: process.env.database || "nubitamix",
    user: process.env.user || "root",
    password: process.env.password || "rootpass",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // insert fruta info
  try {
      var sql = 'INSERT INTO frutas(nombre, costo, flete, total) VALUES (?, ?, ?, ?)';
      connection.query(sql, [fruta.nombre, fruta.costo, fruta.flete, fruta.total], 
        (err, result) => {
        if (err) {
          throw err;
        }
        console.log('Fruta agregada!' + result)
      })
  } catch (err) {
    console.log(err);
  }
}


async function handleEditData(fruta, res) {
  console.log('editar fruta= ' + fruta.nombre + ', costo= ' + fruta.costo + ', flete= ' + fruta.flete + ', total= ' + fruta.total)
  // Create the connection to database
  const connection = await mysql.createConnection({
    host: process.env.host || "http://localhost",
    port: 3306,
    database: process.env.database || "nubitamix",
    user: process.env.user || "root",
    password: process.env.password || "rootpass",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // update fruta info
  try {
      var sql = 'UPDATE frutas SET nombre=?, costo=?, flete=?, total=? WHERE idfrutas = ?';
      connection.query(sql, [fruta.nombre, fruta.costo, fruta.flete, fruta.total, fruta.id], 
        (err, result) => {
        if (err) {
          throw err;
        }
        console.log('Fruta modificada!' + result)
      })
  } catch (err) {
    console.log(err);
  }
}

app.delete("/api/deleteFruta", (req, res) => {
  removeFruta(req.body.id)
  res.status(200).json(req.body);
})

async function removeFruta(idFruta) {
    const connection = await mysql.createConnection({
    host: process.env.host || "http://localhost",
    port: 3306,
    database: process.env.database || "nubitamix",
    user: process.env.user || "root",
    password: process.env.password || "rootpass",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // update fruta info
  try {
      var sql = 'DELETE FROM frutas WHERE idfrutas = ?';
      connection.query(sql, [idFruta], 
        (err, result) => {
        if (err) {
          throw err;
        }
        console.log('Fruta borrada!' + result)
      })
  } catch (err) {
    console.log(err);
  }
}

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

