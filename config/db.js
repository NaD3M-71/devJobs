const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

mongoose.connect(process.env.DATABASE, {useNewUrlParser:true});

mongoose.connection.on('error', (error) => {
    console.log(error);
})

// importar modelos
require('../models/Usuarios');
require('../models/Vacantes');