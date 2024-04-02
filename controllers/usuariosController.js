const mongoose = require("mongoose");
const Usuario = mongoose.model('Usuarios');
const multer = require("multer");
const { nanoid }= require('nanoid');
const {
    body,
    validationResult
} = require('express-validator');



exports.subirImagen = (req,res,next) =>{
    upload(req,res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                // Error de Multer = tamaño maximo de archivo
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 200kb ');
                } else {
                    // Por si se presenta otro error de Multer
                    req.flash('error', error.message)
                }
            } else {
                // Si se presenta otro error que no sea de Multer
                req.flash('error', error.message);
            }
            res.redirect('/adminstracion');
            return;
        } else {
            return next();
        }
    });
    next(); 
}
// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 200000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,cb)=>{
            cb(null, __dirname+'../../public/uploads/perfiles')
        }, 
        filename: (req,file,cb) =>{
            const extension = file.mimetype.split('/')[1];
            cb(null, `${nanoid()}.${extension}`)
        }
    }),
    fileFilter(req,file,cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true)
        } else {
            cb(new Error('Formato no Válido'))
        }
    }
}
// Defino Funcion upload()
const upload = multer(configuracionMulter).single('imagen');


exports.formCrearCuenta = (req,res) =>{
    res.render('crear-cuenta',{
        nombrePagina: 'Crea tu cuenta en DevJobs',
        tagline: ' Comienza a publicar tus vacantes gratis, solo tienes que crear una cuenta'
    })
};

exports.validarRegistro = async (req,res, next) =>{
    //sanitizar los campos
    const rules= [
        body('nombre').not().isEmpty().withMessage('El nombre es Obligatorio').escape(),
        body('email').isEmail().withMessage('El email es Obligatorio').normalizeEmail(),
        body('password').not().isEmpty().withMessage('La Contraseña es Obligatoria').escape(),
        body('confirmar').not().isEmpty().withMessage('Confirmar la Contraseña es Obligatorio').escape(),
        body('confirmar').equals(req.body.password).withMessage('Las contraseñas no son iguales')

    ];
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores =  validationResult(req);
    //si hay errores 
    if(!errores.isEmpty()){
        req.flash('error', errores.array().map(error => error.msg));
        res.render('crear-cuenta',{
            nombrePagina:'Crea una Cuenta en DevJobs',
            tagline:'Comienza a publicar tus vacantes gratis, solo tienes que crear una cuenta',
            mensajes: req.flash()
        })
    }
    // console.log(errores);
    //Si toda las validaciones son correctas
    next();
}

exports.crearUsuario = async (req,res, next) =>{
    //crear usuarios
    const usuario = new Usuario(req.body);
    

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error );   
        res.redirect('/crear-cuenta');
    }

};

exports.formIniciarSesion = async (req,res,next) =>{
    res.render('iniciar-sesion',{
        nombrePagina: 'Inicia Sesion en DevJobs',
    })
}

// Form editar el perfil
exports.formEditarPerfil = (req,res)=>{
    res.render('editar-perfil', {
        pagina: "Edita tu Perfil",
        usuario: req.user.toObject(),
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        cerrarSesion:true
    })
}

// Guardar cambios editar perfil
exports.editarPerfil = async (req,res)=>{
    const usuario =  await Usuario.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(usuario.password) {
         req.body.password;
    }
    if(req.file){
        usuario.imagen = req.file.filename
    };
    
    await usuario.save();

    req.flash('correcto', 'Cambios Guardados Correctamente');

    // redirect
    res.redirect('/administracion')
}

// Sanitizar y validar form de editar perfil

exports.validarPerfil = async (req,res,next)=>{
    // sanitizar
    const rules = [
        body("nombre")
        .not().isEmpty().withMessage("El nombre es obligatorio")
        .escape(),
        body("email")
            .isEmail().withMessage("No tiene formato de Email. Ej xxxx@yyy.zz")
            .normalizeEmail(),
            body('password').optional().escape(),

];

    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en DevJobs',
            usuario: req.user.toObject(),
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}


