/* 
 * MONGODB - Modelo Categoria
 */

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

mongoose.set('useCreateIndex', true); // => Añadido por un 'deprecatedWarning'

// Modelo
let Schema = mongoose.Schema;
const categoriaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'Es obligatorio introducir una descripción de la categoría']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

// Validaciones
categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Categoria', categoriaSchema);