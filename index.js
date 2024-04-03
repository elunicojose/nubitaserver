const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const { loadFrutas, loadMixes } = require("./nubita_model");
const PORT = process.env.PORT || 3001;
var cors = require("cors");

const frutas = loadFrutas();
const mixes = { ...loadMixes() };

app.use(express.json());
app.use(cors());

let arrFrutas = Object.values(frutas);

let arrMixes = Object.values(mixes);


const handleSaveData = (data, fileName) => {
  console.log("Saving DATA= ", data);
  var sData = JSON.stringify(data);
  var thePath = path.join("./server/data/", fileName);
  console.log('path archivo= ', thePath)
  fs.writeFile(thePath, sData, (err) => {
    if (err) {
      console.log('Error while saving data: ', err);
    } else console.log("Data saved!");
  });
};

app.get("/frutas", (req, res) => {
  res.send(loadFrutas());
});

app.get("/mixes", (req, res) => {
  res.send(loadMixes());
});

app.get("/", (req, res) => {
  res.json("Welcome");
});

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
});


app.delete("/borrarFruta", (req, res) => {
  console.log('borrando en server...', req.body);
  removeFruta(req.body.id, res)
  //res.status(200).json({"remove": "ok"})
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const existeFrutaEnMix = (idFruta) => {
  const index = arrFrutas.findIndex((laFruta) => {
    return laFruta.id === idFruta;
  });

  if (index == -1) {
    console.log("No se pudo borrar la fruta");
    return false;
  }

  let nombreFruta = arrFrutas[index].nombre;

  for (let i = 0; i < mixes.length; i++) {
    let mix = arrMixes[i];
    for (let j = 0; j < mix.frutasMix.length; j++) {
      if (
        nombreFruta.trim().toUpperCase() ===
        mix.frutasMix[j].nombre.trim().toUpperCase()
      ) {
        return true;
      }
    }
  }
  return false;
};

const removeFruta = (rec, res) => {
  console.log("borrar= ", rec);
  if (arrFrutas && arrFrutas.length > 0) {
    if (existeFrutaEnMix(rec)) {
      //showAlert("Esta fruta está agregada en un mix", "danger");
      console.log( "Esta fruta está agregada en un mix")
      res.status(500).json({"status": "error", "message": "Esta fruta está agregada en un mix"})
      return;
    }
    
   /* var filtro = arrFrutas.filter((elem, i) => {
      if (rec == elem.id) {
        arrFrutas.splice(i, 1);
        updateFrutaID(arrFrutas);
        //buildTable(); --> actualizar lista de frutas en frontend
        
        //window.electronAPI.onSaveData(frutas, "frutas.json");
        handleSaveData(arrFrutas, "frutas.json")
        
        //showAlert("Fruta borrada", "info");
        res.status(200).json({"status": "ok", "message": "Fruta borrada"})
      }
    });*/

    const idxFrutaBorrar = arrFrutas.findIndex(elem => {
      return elem.id === rec;
    });

    if (idxFrutaBorrar === -1) {
      console.log("No se pudo borrar la fruta")
      res.status(500).json({"status": "error", "message": "No se pudo borrar la fruta"})
      return
    }

    arrFrutas.splice(idxFrutaBorrar, 1);
    updateFrutaID(arrFrutas); 
    handleSaveData(arrFrutas, "frutas.json")
    console.log("Fruta borrada")
    res.status(200).json({"status": "ok", "message": "Fruta borrada"})

  }
  console.log(arrFrutas);
};

const updateFrutaID = (frutas) => {
  //SI SE ACTUALIZA EL ID FRUTA, ACTUALIZAR TAMBIEN EN LAS FRUTAS DE LOS MIXES
  
  //NO HACE FALTA EL COMENTARIO ANTERIOR, 
  //PORQUE EL UPDATE SE HACE CUANDO SE BORRA UNA FRUTA 
  //Y NO SE PUEDE BORRAR UNA FRUTA QUE ESTÉ INCLUIDA EN UN MIX
  if (frutas) {
    frutas.forEach((elem, index) => {
      elem.id = index + 1;
    });
  }
};