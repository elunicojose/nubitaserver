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

// Función asincrónica para conectar a la base de datos
async function connectToDatabase() {
  try {
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
      console.log('Conexión a la base de datos establecida');
      return connection;
  } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      throw error; // Propagar el error hacia arriba
  }
}

app.get("/", (req, res) => {
  res.send("<h1>Nubita!</h1>")
})


/****INICIO FRUTAS****/
app.get("/api/frutas", async (req, res) => {
  console.log("en server local app get frutas nuevo...");
  try {
    // Conectar a la base de datos
    const connection = await connectToDatabase();

    const [result] = await connection.query("SELECT * FROM `frutas`");

    // Cerrar la conexión
    await connection.end();

    console.log("result: ", result); // results contains rows returned by server
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al traer frutas", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/api/addFruta", async (req, res) => {
  console.log(req.body);
  var fruta = {
    id: req.body.id,
    nombre: req.body.nombre,
    costo: req.body.costo,
    flete: req.body.flete,
    total: (parseFloat(req.body.costo) + parseFloat(req.body.flete)).toFixed(2),
  };

   let operationStatus = 200;
  if (req.body.action == "ADD") {
    operationStatus = await handleAddData(fruta)
  } else if (req.body.action == "EDIT") {
    operationStatus = await handleEditData(fruta)
  }

  console.log('resultado operacion: '+ operationStatus)
  res.status(operationStatus).json(req.body);
});

async function handleAddData(fruta) {
  console.log('guardar fruta= ' + fruta.nombre + ', costo= ' + fruta.costo + ', flete= ' + fruta.flete + ', total= ' + fruta.total)
  const connection = await connectToDatabase();
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
      await connection.end();
      return 200;
  } catch (err) {
    console.log(err);
    return 500;
  }
}

async function handleEditData(fruta) {
  console.log('editar fruta= ' + fruta.nombre + ', costo= ' + fruta.costo + ', flete= ' + fruta.flete + ', total= ' + fruta.total)
  const connection = await connectToDatabase();
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
      await connection.end();
      return 200;
  } catch (err) {
    console.log(err);
    return 500;
  }
}

app.delete("/api/deleteFruta/:id", async (req, res) => {
  const idDelete = parseInt(req.params.id);
  console.log("Borrando: " + idDelete);
  try {
    // Conectar a la base de datos
    const connection = await connectToDatabase();

    // Realizar la operación de eliminación
    const [result] = await connection.execute(
      "DELETE FROM frutas WHERE idfrutas = ?",
      [idDelete]
    );

    // Cerrar la conexión
    await connection.end();

    res.status(200).json({ message: "Elemento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el elemento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


/****INICIO MIXES****/
app.get("/api/mixes", async (req, res) => {
  console.log("en server local app get MIXES nuevo...");
  try {
    // Conectar a la base de datos
    const connection = await connectToDatabase();

    const [result] = await connection.query("SELECT * FROM `mixes`");

    // Cerrar la conexión
    await connection.end();

    console.log("result: ", result); // results contains rows returned by server
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al traer mixes", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

