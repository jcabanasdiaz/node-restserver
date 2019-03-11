require('./config/config');

const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express()
const MONGOOSE_OPTS = { useNewUrlParser: true, useFindAndModify: false };

//  ===== Middleware =====
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
//  =======================

// habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuración global de rutas
app.use(require("./routes/index"));

// Conexion a la BBDD
mongoose.connect(process.env.URLDB, MONGOOSE_OPTS, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
});

// Inicia la escucha
app.listen(3000, () => {
    console.log(`Escuchando el puerto`, process.env.PORT);
});