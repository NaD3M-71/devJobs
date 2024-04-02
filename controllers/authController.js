const mongoose = require("mongoose");
const passport =  require('passport');
// const Usuarios = require("../models/Usuarios");
const Vacante = mongoose.model("Vacante"); 
const Usuarios = mongoose.model("Usuarios"); 
const crypto = require('crypto');
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos Campos son Obligatorios'
})

//Revisar si el usuario está autenticado o no
exports.verificarUsuario = (req,res,next) =>{
    //revisar el usuario
    if(req.isAuthenticated()){
        return next(); // estan autenticados
    }
    res.redirect('/iniciar-sesion');
}


exports.mostrarPanel = async (req,res,next) =>{
    // consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id }).lean();
    res.render('administracion', {
        nombrePagina: 'Panel de administracion',
        tagline: 'Crea y administra tus vacantes desde aqui',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen : req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = async (req,res, next)=>{
    await req.logout(function(err){
        if(err){ return next(err)}

        req.flash('correcto', 'Cerraste Sesión Correctamente')
        return res.redirect('/iniciar-sesion')
    });
}

// Formulario reset password
exports.formRestablecerPassword = (req,res) =>{
    res.render('restablecer-password',{
        nombrePagina: 'Restablecer Password',
        tagline: 'Si ya tenes cuenta, ingresa tu email para recuperar tu contraseña'
        
    })
}

// Generar de Token en la BD
exports.enviarToken = async (req,res) =>{
    const usuario = await Usuarios.findOne({email: req.body.email})

    // Si el usuario no existe
    if (!usuario) {
        req.flash('error', 'No existe ningun usuario con ese Email');
        return res.redirect('/iniciar-sesion')
    }

    // Todo ok, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + (1*1000*3600); // 1ms * 1000= 1s, 1s * 3600 = 1hora 

    //Guardar el usuario
    usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`
    

    // Enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject: 'password Reset',
        resetUrl,
        archivo: 'reset'
    });
    
    // Todo ok
    req.flash('correcto', 'Revisa tu email para reestablecer tu contraseña');
    res.redirect('/iniciar-sesion')
}

// Valida si el token es valido y el usuario existe
exports.restablecerPassword = async (req,res) =>{
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if (!usuario) {
        req.flash('error', "El formulario ya no es valido, intenta de nuevo");
        return res.redirect('/reestablecer-password')
    }

    //Todo ok, mostramos formulario
    res.render('nuevo-password',{
        nombrePagina : 'Nuevo password'
    })
}

// Guardando nuevo password en la BD
exports.guardarPassword = async (req,res)=>{
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    // no existe el usuario o el tokne ya no es valido
    if (!usuario) {
        req.flash('error', "El formulario ya no es valido, intenta de nuevo");
        return res.redirect('/reestablecer-password')
    }

    // todo ok, asignar nuevo password + limpiar token y expira
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;
    // agregar a la BD
    await usuario.save();

    // redirect
    req.flash('correcto', 'Password cambiado correctamente');
    res.redirect('/iniciar-sesion');
}