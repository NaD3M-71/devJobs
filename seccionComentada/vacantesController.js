const mongoose = require("mongoose");
//Mongoose tiene dos formas de guardar informacion en los modelos,
// Opcion 1=
// const Vacante = require('../models/Vacantes')
// Opcion 2
const Vacante = require("../models/Vacantes"); // esto requiere que importemos mongoose y tener exportado el modelo con Mongoose con su Schema.

exports.formularioNuevaVacante = (req, res) => {
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
  });
};

// agregar vacantes a la base de datos
// Tambien hay 2 formas de hacerlo (en realidad hay 3 con insertMany pero esa no la vamos a ver)
//opcion 1 ( con New + el Modelo)
exports.agregarVacante = async (req, res) => {
  const vacante = new Vacante(req.body);

  // crear array de skills (que se estan mostrando como string)
  vacante.skills = req.body.skills.split(',');
  
  // almacenar la informacion en la BBDD
  const nuevaVacante = await vacante.save();

  // Redireccionar a home
  res.redirect(`/vacantes/${nuevaVacante.url}`)
};

// Opcion 2 --> Vacante.create()

//mostrar vacantes
exports.mostrarVacante = async (req, res, next) =>{
  const vacante = await Vacante.findOne({ url: req.params.url });
  console.log(vacante);
  //si no hay resultados
  if (!vacante) return next();

  res.render('vacante',{
    vacante,
    nombrePagina: vacante.titulo,
    barra: true

  })
}