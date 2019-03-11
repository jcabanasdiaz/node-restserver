const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');


const app = express();

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }

    // Validar tipo
    const tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las tipos permitidas son ' + tiposValidos.join(', '),
                tipo: tipo
            }
        });
    }


    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.')[0];
    let extensionArchivo = archivo.name.split('.')[1];

    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // Validar extension
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extensionArchivo
            }
        });
    }

    // Cambiar nombre al archivo
    let filename = `${id}-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    archivo.mv(`uploads/${tipo}/${filename}`, (err) => {

        if (err)
            return res.status(500)
                .json({
                    ok: false,
                    err
                });

        //Aqui, imagen ya cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, filename);
        } else {
            imagenProducto(id, res, filename);
        }
    });
});


function imagenUsuario(usuarioID, res, filename) {

    Usuario.findById(usuarioID, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(filename, 'usuarios'); // => Si hay fallo interno, borramos la imagen que acabamos de subir
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            borrarArchivo(filename, 'usuarios'); // => Si el usuario no existe, borramos la imagen que acabamos de subir
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            })
        }

        // Si el usuario tiene una imagen ya cargada con anterioridad, la borramos de la carpeta para no acumularlas
        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = filename;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: filename
            });
        });
    });
}

function imagenProducto(productoID, res, filename) {

    Producto.findById(productoID, (err, productoDB) => {

        if (err) {
            borrarArchivo(filename, 'usuarios'); // => Si hay fallo interno, borramos la imagen que acabamos de subir
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borrarArchivo(filename, 'productos'); // => Si el producto no existe, borramos la imagen que acabamos de subir
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        // Si el producto tiene una imagen cargada, la borramos
        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = filename;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                producto: productoGuardado,
                img: filename
            });
        });

    });
}

function borrarArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;