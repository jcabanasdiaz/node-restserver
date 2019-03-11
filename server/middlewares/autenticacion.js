const jwt = require('jsonwebtoken');

// =====================================
//  Verificar token
// =====================================
let verificaToken = (req, res, next) => {

    let token = req.get('token');

    // Verifica cualquier error que pudiera haber (Que haya expirado, incorrecto, etc...)
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;
        next();
    })
};

// =====================================
//  Verificar token imagen
// =====================================
let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    // Verifica cualquier error que pudiera haber (Que haya expirado, incorrecto, etc...)
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;
        next();
    })
};

// =====================================
//  Verificar admin role
// =====================================
let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === "ADMIN_ROLE") {
        next();
    } else {
        res.json({
            ok: false,
            err: {
                message: "El usuario no es administrador"
            }
        });
    }
};


module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}