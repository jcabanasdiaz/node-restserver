/* 
 * AQUI SE DEFINE EL MODELO USUARIO DE MONGODB 
 */

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Añadido por un 'deprecatedWarning'
mongoose.set('useCreateIndex', true);

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        required: [true, 'El correo es necesario'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Evitar que el campo contraseña sea devuelto 
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

// MongoDB & Express detecta automaticamente los modelos que tengamos definidos y crea las colecciones si no están creadas
// Por lo tanto, al definir aqui el modelo "Usuario", él va a crear una coleccion llamada "usuarios"
// Ejemplos:
// => Usuarios - usuarios
// => Empleado - empleados
// => News - news
module.exports = mongoose.model('Usuario', usuarioSchema)