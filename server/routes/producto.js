const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');

const app = express();

const OPTS_PUT = {
    new: true,
    runValidators: true
}

// ======================
//  Buscar productos
// ======================
app.get("/producto/buscar/:termino", verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regEx = new RegExp(termino, 'i'); // => Genera una expresión regular basada en el termino. Con la 'i' es independiente de mayusculas y minusculas

    Producto.find({ nombre: regEx })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

// ======================
//  GET - Devuelve todos los productos
// ======================
app.get("/producto", verificaToken, (req, res) => {

    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limite || 5);

    Producto.find({ disponible: true })
        .skip(desde) // Salta los X primeros registros
        .limit(limite) // Devuelte un limite de X registros
        .populate('usuario', 'nombre email') // => Añade los campos indicados del Schema de usuario según el ID que este asociado a este usuario
        .populate('categoria', 'descripcion') // => Añade los campos indicados del Schema de usuario según el ID que este asociado a esta categoria
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });

});

// ======================
//  GET(ID) - Devuelve un producto por ID
// ======================
app.get("/producto/:id", verificaToken, (req, res) => {

    let productoID = req.params.id;
    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limite || 5);

    Producto.findById(productoID)
        .skip(desde) // Salta los X primeros registros
        .limit(limite) // Devuelte un limite de X registros
        .populate('usuario', 'nombre email') // => Añade los campos indicados del Schema de usuario según el ID que este asociado a este usuario
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });

});

// ======================
//  POST - Crear un nuevo producto
// ======================
app.post("/producto", verificaToken, async(req, res) => {

    let categoria = await Categoria.findOne({ descripcion: req.body.categoria },
        (err, categoriaDB) => {
            if (err) { // => Ha fallado
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se encontró la categoría'
                    }
                });
            }
        });

    let producto = new Producto({
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion: req.body.descripcion,
        categoria: categoria._id,
        usuario: req.usuario._id
    });

    producto.save(producto, (err, productoCreado) => {
        if (err) { // => Ha fallado
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            productoCreado
        });
    });

});

// ======================
//  PUT - Actualiza un producto
// ======================
app.put("/producto/:id", verificaToken, (req, res) => {

    let productoID = req.params.id;
    let camposActualizar = {
        usuario: req.body.usuario,
        categoria: req.body.categoria
    };

    Producto.findByIdAndUpdate(productoID, camposActualizar, OPTS_PUT, (err, productoActualizado) => {

        if (err) { // => Ha fallado
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productoActualizado
        });
    });

});

// ======================
//  DELETE - Borrar un producto
// ======================
app.delete("/producto/:id", verificaToken, (req, res) => {

    let productoID = req.params.id;
    let camposActualizar = {
        disponible: false
    }

    Producto.findByIdAndUpdate(productoID, camposActualizar, OPTS_PUT, (err, productoBorrado) => {
        if (err) { // => Ha fallado
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productoBorrado
        });
    });

});

module.exports = app;