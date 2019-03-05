const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.CLIENT_ID);
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        // Erorr interno de la base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Usuario o contraseña no validos
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario y/o contraseña incorrectos"
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario y/o contraseña incorrectos"
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });


    });

});

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            })
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        // Erorr interno de la base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }


        if (usuarioDB) { // => Existe el usuario en la base de datos            
            if (usuarioDB.google === false) { // => Se autenticó previamente pero no a través de google. Credenciales normales.

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });

            } else { // => Previamente se ha autenticado con google y hay que renovarle el token.
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else { // => El usuario no existe en la base de datos. Lo creamos.
            let usuario = new Usuario();

            // =======================================
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            // Password obligatorio por el modelo.
            // =>  Nunca va a poder logearse con esta password porque la carita está puesta literalmente en la base de datos
            // y aunque un usuario introdujese la carita en el login, este hará una encriptación de 10 vueltas y devolverá una cadena. Nunca coincidirán.
            usuario.password = ':)';
            // =======================================

            usuario.save((err, usuarioDB) => {
                // Error interno de la base de datos
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                // Generación de un token al nuevo usuario
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                // Respuesta
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            })
        }
    });

});

module.exports = app;