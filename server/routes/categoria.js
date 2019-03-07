const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');

const app = express();
const OPTS_PUT = {
    new: true,
    runValidators: true
}

// ======================
//  GET - Devuelve todas las categorias
// ======================
app.get("/categoria", verificaToken, function(req, res) {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') // => Añade los campos indicados del Schema de usuario según el ID que este asociado a esta categoria
        .exec((err, categoriasDB) => {
            if (err) { // => Ha fallado
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // res.json({
            //     ok: true,
            //     categoriasDB
            // });

            Categoria.countDocuments((err, totalCount) => {
                res.json({
                    ok: true,
                    categorias: categoriasDB,
                    totalCount
                });
            });
        });
});

// ======================
//  GET(ID) - Devuelve la categoria pasada por ID
// ======================
app.get("/categoria/:id", verificaToken, function(req, res) {

    let categoriaID = req.params.id;

    Categoria.findById(categoriaID, (err, categoriaDB) => {

        if (err) { // => Ha fallado
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ======================
//  POST - Crea una nueva categoria
// ======================
app.post("/categoria", verificaToken, function(req, res) {

    let body = req.body; // => Recupera el body de la petición

    // => Definimos la nueva instancia de la categoría
    let categoria = new Categoria({
        descripcion: req.body.descripcion,
        usuario: req.usuario._id // => usuario es asignado a '.req' en el middleware 'VerificaToken'
    });

    // => Ejecutamos la creación de la categoria
    // => Resaltar que el '.save' se ejecuta sobre la instancia y no la constante Categoria
    categoria.save((err, categoriaDB) => {

        if (err) { // => Ha fallado
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({ // => Tuvo éxito
            ok: true,
            categoria: categoriaDB
        })
    });
});
// ======================
//  PUT - Actualiza una categoria
// ======================
app.put("/categoria/:id", verificaToken, function(req, res) {

    let categoriaID = req.params.id;
    let descripCategoria = {
        descripcion: req.body.descripcion
    };

    Categoria.findByIdAndUpdate(categoriaID, descripCategoria, OPTS_PUT, (err, categoriaDB) => {

        if (err) { // => Ha fallado
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({ // => Tuvo éxito
            ok: true,
            categoria: categoriaDB
        })
    });

});

// ======================
//  Delete - Borra una categoria
// ======================
app.delete("/categoria/:id", [verificaToken, verificaAdminRole], function(req, res) {

    let categoriaID = req.params.id;

    Categoria.findByIdAndRemove(categoriaID, (err, categoriaBorrada) => {
        if (err) { // => Ha fallado
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({ // => Tuvo éxito
            ok: true,
            categoriaBorrada
        })
    });

});

module.exports = app; // Importante => Se debe poner desde el principio para que no dé error el 'app.use(require('./categoria'));' del index.js