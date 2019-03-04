/* 
 *  AQUI SE DEFINEN LAS ACCIONES PARA LA COLECCION USUARIO
 */
const express = require('express');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const bcrypt = require('bcrypt');
const _ = require('underscore');


const app = express();
const OPTS_PUT = {
    new: true,
    runValidators: true
}
const FIELDS_UPDATE_PUT = ['nombre', 'email', 'img', 'role', 'estado']; // White list fields to update by PUT method
const FIELDS_TO_GET = ['nombre', 'email', 'role', 'estado', 'img']; // Fields list to retrieve in a GET method


// ======================
//         GET
// ======================
app.get('/usuario', verificaToken, function(req, res) {

    // Comprobación token
    /* return res.json({
        accion: "GET Usuario",
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email
    }); */

    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limite || 5);

    Usuario.find({ estado: true }, FIELDS_TO_GET)
        .skip(desde) // Salta los X primeros registros
        .limit(limite) // Devuelte un limite de X registros
        .exec((err, usuarios) => { // Ejecuta el find a la colección de usuario (Base de datos)
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Devuelve el total de documentos que hay en la colección
            Usuario.countDocuments({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            });
        });
});

// ======================
//         POST
// ======================
app.post('/usuario', [verificaToken, verificaAdminRole], function(req, res) {

    // Comprobación token
    /* return res.json({
        accion: "POST Usuario",
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email
    }); */


    let body = req.body;

    // Creamos una nueva instancia del Schema Usuario
    // con los valores que se pasan en la url
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // usuarioDB -> Sería el usuario que se grabó en la base de datos
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});

// ======================
//         UPDATE
// ======================
app.put('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {

    // Comprobación token
    /* return res.json({
        accion: "PUT Usuario",
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email
    }); */

    let id = req.params.id;
    // _.Pick nos permite filtrar los campos que queremos actualizar
    let body = _.pick(req.body, FIELDS_UPDATE_PUT);

    Usuario.findByIdAndUpdate(id, body, OPTS_PUT, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })
});

// ======================
//         DELETE
// ======================
app.delete('/usuario/:id', [verificaToken, verificaAdminRole], function(req, res) {

    // Comprobación token
    /* return res.json({
        accion: "DELETE Usuario",
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email
    }); */


    let id = req.params.id;
    let cambiaEstado = { estado: false }

    // Borrado lógico de un registro de la BBDD (Marcar campo estado = false);
    Usuario.findByIdAndUpdate(id, cambiaEstado, OPTS_PUT, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuarioBorrado
        });
    });

    // Borrado físico de un registro (No es recomendable)
    /*     Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                usuarioBorrado
            });
        }); */
});

module.exports = app;