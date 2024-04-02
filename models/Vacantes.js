const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug'); // slug achicará/transformara AbCdEfG en abcdefg

const { nanoid }= require('nanoid') // generará un id unico a nuestro codigo, este proyecto esta hecho con CommonJS por lo que usamos la version 3.x de nanoid

const vacantesSchema = new mongoose.Schema({
    titulo:{
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true,

    },
    empresa:{
        type: String,
        trim: true
    },
    ubicacion:{
        type: String,
        trim: true,
        required: 'La ubicacion es obligatoria'
    },
    salario:{
        type: String,
        default: 0,
        trim: true,
    },
    contrato: {
        type: String,
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true,
    },
    url: {
        type: String,
        lowercase: true,
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv : String,
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es Obligatorio'
    }

});
vacantesSchema.pre('save', function(next){
    // crear la url
    const url =slug(this.titulo);
    this.url =`${url}-${nanoid()}`

    next();
})

// Crear un indice
vacantesSchema.index({titulo: 'text'});

module.exports = mongoose.model('Vacante', vacantesSchema);