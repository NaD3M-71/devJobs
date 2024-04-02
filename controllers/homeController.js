const mongoose = require("mongoose");
const Vacante = mongoose.model("Vacante"); 

exports.mostrarTrabajos = async (req,res, next) =>{

    const vacantes = await Vacante.find().lean(); // Lean() permite leer los resultados del query sin modificar de manera mas sencilla

    if (!vacantes) return next();


    res.render('home',{
        nombrePagina :'devJobs',
        tagline: 'Encuentra y publica Trabajos para desarrolladores web',
        barra: true,
        boton: true,
        vacantes,
    })
}