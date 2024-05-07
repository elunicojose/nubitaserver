/* DESPUES VER SI SE PUEDE USAR ESTE MODULO PARA EVITAR CREAR CONEXIONES TODO EL TIEMPO EN index.js */
require("dotenv").config();
const mysql = require("mysql2/promise");

// Creating connection 
let pool = mysql.createPool({
    host: process.env.host || "http://localhost",
    port: 3306,
    database: process.env.database || "nubitamix",
    user: process.env.user || "root",
    password: process.env.password || "rootpass",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Connect to MySQL server 
  pool.connect((err) => { 
    if (err) { 
      console.log("Database Connection Failed !!!", err); 
    } else { 
      console.log("connected to Database"); 
    } 
  }); 
    
  module.exports = pool;