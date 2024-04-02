const mongoose = require("mongoose");
const Vacante = mongoose.model("Vacante"); 
const multer = require('multer');
const { nanoid }= require('nanoid'); 
const { body, validationResult } = require("express-validator");
// const Vacante = mongoose.model("../models/Vacantes"); 

exports.formularioNuevaVacante = (req, res) => {
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
  });
};

// agregar vacantes a la base de datos

exports.agregarVacante = async (req, res) => {
  const vacante = new Vacante(req.body);

  // Usuario autor de la vacante
  vacante.autor = req.user._id;

  // crear array de skills (que se estan mostrando como string)
  vacante.skills = req.body.skills.split(',');
  
  // almacenar la informacion en la BBDD
  const nuevaVacante = await vacante.save();

  // Redireccionar a home
  res.redirect(`/vacantes/${nuevaVacante.url}`)
};



// mostrar vacantes
exports.mostrarVacante = async (req, res, next) =>{
  const vacante = await Vacante.findOne({url: req.params.url}).lean().populate('autor');
  // si no hay resultados
  if (!vacante) return next();

  // todo ok, redireccionamos
  res.render('vacante',{
    vacante,
    nombrePagina: vacante.titulo,
    barra: true
  })
}

exports.formEditarVacante = async (req,res,next) =>{
  const vacante = await Vacante.findOne({url: req.params.url}).lean();

  if(!vacante) return next();

  res.render('editar-vacante',{
    vacante,
    nombrePagina: `Editar - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
  });
}

exports.editarVacante = async (req,res) =>{
  const vacanteActualizada = req.body;
  vacanteActualizada.skills = req.body.skills.split(',');

  const vacante = await Vacante.findOneAndUpdate({url: req.params.url},vacanteActualizada,{
    new: true,
    runValidators: true,
  });
  res.redirect(`/vacantes/${vacante.url}`)
};

// Validar y Sanitizar los campos de nuevas vacantes

// exports.validarVacante = (req,res, next) =>{
//   // Samitizar campos
//   req.sanitizeBody('titulo').escape();
//   req.sanitizeBody('empresa').escape();
//   req.sanitizeBody('ubicacion').escape();
//   req.sanitizeBody('salario').escape();
//   req.sanitizeBody('contrato').escape();
//   req.sanitizeBody('skills').escape();

//   // validar
//   req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
//   req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
//   req.checkBody('ubicacion', 'Agrega una Ubicación').notEmpty();
//   req.checkBody('contrato', 'Agrega el tipo de Contrato').notEmpty();
//   req.checkBody('skills', 'Agrega al menos una Habilidad').notEmpty();

//   const errores = req.validationErrors();

//   if (errores) {
//     // recargar la vista con lso errores
//     req.flash('error', errores.map( error => error.msg));

//     res.render('nueva-vacante', {
//     nombrePagina: "Nueva Vacante",
//     tagline: "Llena el formulario y publica tu vacante",
//     cerrarSesion: true,
//     nombre: req.user.nombre,
//     mensajes: req.flash()
//     })
//   }
//   next(); // siguiente middleware
// } 
// OLD VERSION

exports.validarVacante = async (req, res, next) => {
  const rules = [
      body("titulo").not().isEmpty().withMessage("Agrega un Titulo a la Vacante").escape(),
      body("empresa").not().isEmpty().withMessage("Agrega una Empresa").escape(),
      body("ubicacion")
        .not()
        .isEmpty()
        .withMessage("Agrega una Ubicación")
        .escape(),
      body("contrato")
        .not()
        .isEmpty()
        .withMessage("Selecciona un tipo de Contrato")
        .escape(),
      body("skills")
      .not()
      .isEmpty()
      .withMessage("Agrega al menos una Habilidad")
      .escape(),
    ];
    await Promise.all(rules.map((validation) => validation.run(req)));
    const errors = validationResult(req);


if (!errors.isEmpty()) {
  // Recargar pagina con errores
  req.flash("error", errors.array().map((error) => error.msg));
  
  res.render("nueva-vacante", {
    pageName: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    mensajes: req.flash()
  });
  return;
}
  next();


};

exports.eliminarVacante = async (req,res) =>{
  const { id } = req.params;
  
  const vacante = await Vacante.findById(id);
  console.log(vacante)

  if(verificarAutor(vacante, req.user)){
    // Todo bien, el usuario es el autor de la vacante
    await vacante.deleteOne();
    res.status(200).send('Vacante eliminada correctamente')
    console.log('eliminada');

  } else {
    // No es el usuario, error
    res.status(403).send('Error')
  }
  
  

}

const verificarAutor = (vacante = {}, usuario = {}) => {
  if(!vacante.autor.equals(usuario._id)) {
      return false
  } 
  return true;
}

// Subir CV en PDF
exports.subirCV = (req,res, next) =>{
  upload(req,res, function(error){
    if(error){
        if(error instanceof multer.MulterError){
            // Error de Multer = tamaño maximo de archivo
            if(error.code === 'LIMIT_FILE_SIZE') {
                req.flash('error', 'El archivo es muy grande: Máximo 500kb ');
            } else {
                // Por si se presenta otro error de Multer
                req.flash('error', error.message)
            }
        } else {
            // Si se presenta otro error que no sea de Multer
            req.flash('error', error.message);
        }
        res.redirect('back');
        return;
    } else {
        return next();
      }
  }); 
}
// Opciones de Multer
const configuracionMulter = {
  limits : { fileSize : 500000 },
  storage: fileStorage = multer.diskStorage({
      destination: (req,file,cb)=>{
          cb(null, __dirname+'../../public/uploads/cv')
      }, 
      filename: (req,file,cb) =>{
          const extension = file.mimetype.split('/')[1];
          cb(null, `${nanoid()}.${extension}`)
      }
  }),
  fileFilter(req,file,cb) {
      if(file.mimetype === 'application/pdf'){
          // el callback se ejecuta como true o false : true cuando la imagen se acepta
          cb(null, true)
      } else {
          cb(new Error('Formato no Válido'))
      }
  }
}
// Funcion Upload
const upload = multer(configuracionMulter).single('cv');

// Guardar candidatos en la BD
exports.contactar = async(req,res,next) => {

  const vacante = await Vacante.findOne({url: req.params.url}) 

  // Si no existe la vacante
  if (!vacante) {
    return next();
  }
  // Todo Ok, creamos el objeto candidato
  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv : req.file.filename
  }
  // Almacenar la vacante
  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();

  // Mensaje Flash y redirect
  req.flash('correcto','Se envio tu CV Correctamente');
  res.redirect('/');
}

exports.mostrarCandidatos = async (req,res, next)=>{
  const vacante = await Vacante.findById(req.params.id).lean();
  // verificar que sea el usuario que creo la vacante
  if(vacante.autor =! req.user._id.toString()){ return next()} ;
  // verificar que la vacante existe
  if(!vacante) return next();

  res.render('candidatos', {
  nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
  tagline: `${vacante.empresa}`,
  cerrarSesion: true,
  nombre: req.user.nombre,
  imagen: req.user.imagen,
  candidatos : vacante.candidatos
  });

}

exports.buscarVacantes = async (req,res,next) =>{
  const vacantes = await Vacante.find({
    $text: {
      $search: req.body.q
    }
  }).lean();

  // mostrar vacante
  res.render('home', {
    nombrePagina: `Resultado de la Búsqueda: ${req.body.q}`,
    barra: true,
    vacantes
  })
}