// ===================
// Puerto
// ===================
process.env.PORT = process.env.PORT || 3000;

// ===================
// Entorno
// ===================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===================
// Base de datos
// ===================

// ===== CONNECTIONS MONGODB - ATLAS ==== 
// jcabanas-test-shard-00-02-36jpx.mongodb.net:27017 ==> PRIMARY
// jcabanas-test-shard-00-00-36jpx.mongodb.net:27017 ==> SECONDARY
// jcabanas-test-shard-00-01-36jpx.mongodb.net:27017 ==> SECONDARY
const mongoDBSettings = {
    password: "Realcore2018",
    nombreBD: "cafe"
}
let urlDB;

// if (process.env.NODE_ENV === 'dev') {
//     urlDB = `mongodb://localhost:27017/${mongoDBSettings.nombreBD}`;
// } else {

urlDB = process.env.MONGO_URI;
// urlDB = `mongodb+srv://jcabanas:Realcore2018@jcabanas-test-36jpx.mongodb.net/cafe?retryWrites=true`
// urlDB = `mongodb+srv://jcabanas:${mongoDBSettings.password}@jcabanas-test-36jpx.mongodb.net/${mongoDBSettings.nombreBD}?retryWrites=true`
// urlDB = `mongodb://jcabanas:${mongoDBSettings.password}@jcabanas-test-shard-00-02-36jpx.mongodb.net:27017/${mongoDBSettings.nombreBD}?ssl=true&replicaSet=JCABANAS-TEST-shard-0&authSource=admin&retryWrites=true`;

// }

process.env.URLDB = urlDB;