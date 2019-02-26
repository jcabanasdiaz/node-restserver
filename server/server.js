require('./config/config');

const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express()
const MONGOOSE_OPTS = { useNewUrlParser: true, useFindAndModify: false };

// Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(require('./routes/usuario'));

// app.get('/', function(req, res) {
//     res.json({
//         hola: "hola"
//     })
// });

mongoose.connect(process.env.URLDB, MONGOOSE_OPTS, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log(`Escuchando el puerto`, process.env.PORT);
});