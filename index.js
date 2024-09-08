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
      host: process.env.host || "localhost",
      port: 3306,
      database: process.env.database || "nubitamix",
      user: process.env.user || "root",
      password: process.env.password || "rootpass",
      ssl: {
        rejectUnauthorized: false,
      },
    });
    console.log("Conexión a la base de datos establecida");
    return connection;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error; // Propagar el error hacia arriba
  }
}

app.get("/", (req, res) => {
  res.send("<h1>Nubita!</h1>");
});

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
    operationStatus = await handleAddData(fruta);
  } else if (req.body.action == "EDIT") {
    operationStatus = await handleEditData(fruta);
  }

  console.log("resultado operacion: " + operationStatus);
  res.status(operationStatus).json(req.body);
});

async function handleAddData(fruta) {
  console.log(
    "guardar fruta= " +
      fruta.nombre +
      ", costo= " +
      fruta.costo +
      ", flete= " +
      fruta.flete +
      ", total= " +
      fruta.total
  );
  const connection = await connectToDatabase();
  // insert fruta info
  try {
    var sql ="INSERT INTO frutas(nombre, costo, flete, total) VALUES (?, ?, ?, ?)";
    connection.query(
      sql,
      [fruta.nombre, fruta.costo, fruta.flete, fruta.total],
      (err, result) => {
        if (err) {
          throw err;
        }
        console.log("Fruta agregada!" + result);
      }
    );
    await connection.end();
    return 200;
  } catch (err) {
    console.log(err);
    return 500;
  }
}

async function handleEditData(fruta) {
  console.log(
    "editar fruta= " +
      fruta.nombre +
      ", costo= " +
      fruta.costo +
      ", flete= " +
      fruta.flete +
      ", total= " +
      fruta.total
  );
  const connection = await connectToDatabase();
  // update fruta info
  try {
    var sql =
      "UPDATE frutas SET nombre=?, costo=?, flete=?, total=? WHERE idfrutas = ?";
    connection.query(
      sql,
      [fruta.nombre, fruta.costo, fruta.flete, fruta.total, fruta.id],
      (err, result) => {
        if (err) {
          throw err;
        }
        console.log("Fruta modificada!" + result);
      }
    );
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

    const [result] = await connection.query(`select m.idmix as idMix, 
    m.nombre as nombreMix, m.pct, m.total_con_ganancia as totalConGanancia, 
    f.idfrutas as idFruta, f.nombre as nombreFruta, mf.gramos, mf.costo, 
    (select sum(mf2.costo) from mix_fruta mf2 where mf2.id_mix = mf.id_mix) as totalMix
    from mixes m inner join mix_fruta mf on m.idmix = id_mix
    inner join frutas f on f.idfrutas = mf.id_frutal
    order by m.idmix, f.nombre`);
    // Cerrar la conexión
    await connection.end();

    const mixes = [];

    for (let i = 0; i < result.length; i++) {
      const current = result[i];
      let mix = mixes.find((mix) => mix.idMix === current.idMix);

      if (!mix) {
        mix = {
          idMix: current.idMix,
          nombreMix: current.nombreMix,
          pct: current.pct,
          totalConGanancia: current.totalConGanancia,
          totalMix: current.totalMix,
          frutasMix: [],
        };
        mixes.push(mix);
      }

      mix.frutasMix.push({
        idFruta: current.idFruta,
        nombreFruta: current.nombreFruta,
        gramos: current.gramos,
        costo: current.costo
      });
    }

    console.log("result: ", mixes); // results contains rows returned by server
    res.status(200).json(mixes);
  } catch (error) {
    console.error("Error al traer mixes", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


app.post('/api/addMix', async (req, res) => {
  const { mixName, frutasInfo } = req.body;

  console.log('Nuevo mix de frutas recibido:');
  console.log('Nombre del mix:', mixName);
  console.log('Información de las frutas:', frutasInfo);

  if (!mixName || !Array.isArray(frutasInfo) || frutasInfo.length === 0) {
    return res.status(400).json({ error: 'Datos del mix inválidos' });
  }


  /*insert into mix_fruta (id_mix, id_frutal, gramos, costo)
values (3, 1, gramos, (gramos * (select total from frutas f where f.idFruta = id_frutal) / 1000))*/


 // Calcula el total de gramos
 //const totalGramos = frutasInfo.reduce((total, fruta) => total + parseInt(fruta.gramos, 10), 0);

 const connection = await connectToDatabase();

 try {
   await connection.beginTransaction();

   const [frutas] = await connection.query( 'SELECT idfrutas, total FROM frutas');

  if (frutas.length === 0) {
    return res.status(404).json({ error: 'Frutas no encontradas' });
  } 
   
  const frutasMap = new Map();

  // Recorre el array de resultados y llena el Map
  frutas.forEach(fruta => {
    frutasMap.set(fruta.idfrutas.toString(), fruta.total);
  });

  console.log('frutasMap==> ', frutasMap)

  var total_con_ganancia = 0; //cuando se crea, es la sumatoria del mix
  frutasInfo.forEach(frutaInfo => {
    console.log('frutaInfo.idFruta= ', frutaInfo.idFruta);
    console.log('frutaInfo.gramos= ', frutaInfo.gramos);

    //const totalInt= frutasMap.get(2);

    let costo = parseInt(frutaInfo.gramos, 10) * parseFloat(frutasMap.get(frutaInfo.idFruta.toString())) / 1000;

    console.log('costo= ', costo);
    total_con_ganancia += costo;
  });

  console.log('total_con_ganancia= ', total_con_ganancia)


   // 1. Inserta en la tabla mixes
   const [result] = await connection.query('INSERT INTO mixes (nombre, pct, total_con_ganancia) VALUES (?, ?, ?)', [mixName, 0, total_con_ganancia]);
   const idMix = result.insertId;

   // 2. Inserta en la tabla mix_fruta
   const values = frutasInfo.map(fruta => [idMix, fruta.idFruta, fruta.gramos, (parseInt(fruta.gramos, 10) * frutasMap.get(fruta.idFruta) / 1000) ]);
   await connection.query('INSERT INTO mix_fruta (id_mix, id_frutal, gramos, costo) VALUES ?', [values]);

   await connection.commit();
   res.status(201).json({ message: 'Mix agregado correctamente', idMix });

 } catch (error) {
   await connection.rollback();
   console.error(error);
   res.status(500).json({ error: 'Error al añadir el mix' });
 }

  //res.status(201).json({ message: 'Mix de frutas agregado exitosamente' });
});


app.delete("/api/deleteMix/:idMix", async (req, res) => {
  const idMix = parseInt(req.params.idMix);
  console.log("Borrando mix: " + idMix);
  try {
    // Conectar a la base de datos
    const connection = await connectToDatabase();

    await connection.beginTransaction();

    // Borrar los detalles primero
    const deleteMixDetailQuery = 'DELETE FROM mix_fruta WHERE id_mix = ?';
    await connection.query(deleteMixDetailQuery, [idMix]);

    // Borrar el mix
    const deleteMixQuery = 'DELETE FROM mixes WHERE idmix = ?';
    const [result] = await connection.query(deleteMixQuery, [idMix]);

    await connection.commit();

    if (result.affectedRows > 0) {
      console.log('Mix borrado exitosamente')
        res.status(200).send({ message: 'Mix borrado exitosamente.' });
    } else {
        console.log('No se encontró mix')
        res.status(404).send({ message: 'No se encontró mix.' });
    }

    //res.status(200).json({ message: "Elemento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el elemento:", error);
    await connection.rollback();
    res.status(500).json({ error: "Error interno del servidor" });
  }
});



/*
async function handleUpdateGcia(mix) {
  console.log( "editar gcia= " + mix.id + ", pct= " + mix.pct );
  const connection = await connectToDatabase();
  // update mix total ganancia
  try {
    var sql =
      "UPDATE frutas SET nombre=?, costo=?, flete=?, total=? WHERE idfrutas = ?";
    connection.query(
      sql,
      [fruta.nombre, fruta.costo, fruta.flete, fruta.total, fruta.id],
      (err, result) => {
        if (err) {
          throw err;
        }
        console.log("Fruta modificada!" + result);
      }
    );
    await connection.end();
    return 200;
  } catch (err) {
    console.log(err);
    return 500;
  }
}*/

// Función para obtener la sumatoria de los costos desde la tabla mix_fruta
const obtenerSumatoriaCostos = async (id_mix) => {
  console.log('obtenerSumatoriaCostos, recibido mix= ', id_mix)
  const connection = await connectToDatabase();
  const query = `SELECT SUM(costo) AS total_costos FROM mix_fruta WHERE id_mix = ?`;
   
  const [results] = await connection.query(query, [id_mix])
  const totalCostos = results[0].total_costos || 0; // Si no hay resultado, devolvemos 0

  console.log('totalCostos==> ', totalCostos)
  return totalCostos;
};

// Función para actualizar la tabla mix con el porcentaje y total con porcentaje
const actualizarTablaMix = async (id, pct, total_con_porcentaje) => {
    const query = `UPDATE mixes SET pct = ?, total_con_ganancia = ? WHERE idmix = ?`;
    const connection = await connectToDatabase();
    await connection.query(query, [pct, total_con_porcentaje, id], (error, results) => {
      if (error) {
        return error;
      }
      return results;
    });
};

app.post("/api/updateGcia", async (req, res) => {
  console.log(req.body);
  const { id, pct } = req.body;
    //total: (parseFloat(req.body.costo) + parseFloat(req.body.flete)).toFixed(2),
  if (!id || !pct) {
    return res.status(400).send('Debe enviar un idmix y porcentaje de ganancia.');
  }
  /*let operationStatus = await handleUpdateGcia(updateMix);
  console.log("resultado operacion: " + operationStatus);
  res.status(operationStatus).json(req.body);*/

  try {
    // 1. Obtener la sumatoria de los costos de la tabla mix_fruta basada en el id_mix
    const sumatoriaCostos = await obtenerSumatoriaCostos(id);
    console.log('sum= ', sumatoriaCostos)

    // 2. Aplicar el porcentaje
    const totalConPorcentaje = sumatoriaCostos * ( 1 + (pct / 100));
    console.log('total= ', totalConPorcentaje)

    // 3. Actualizar la tabla mix con el porcentaje y el total con porcentaje
    await actualizarTablaMix(id, pct, totalConPorcentaje);

    // 4. Enviar una respuesta de éxito al cliente
    res.status(200).json({
      mensaje: 'El cálculo y la actualización se realizaron correctamente',
      id,
      pct,
      total_con_porcentaje: totalConPorcentaje
    });
  } catch (error) {
    console.error('Error en el proceso:', error);
    res.status(500).send('Ocurrió un error al procesar la solicitud.');
  }
});



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
