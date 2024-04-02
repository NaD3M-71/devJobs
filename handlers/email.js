const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util')

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: process.env.mailerUser,
        pass: process.env.mailerPass
    }
})

// Utilizar templates de Handlebars para el mail
// Templates de Handlebars
transport.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        partialsDir: __dirname + '/../views/emails',
        layoutsDir: __dirname + '/../views/emails',
        defaultLayout: 'reset.handlebars',
    },
    viewPath: __dirname + '/../views/emails',
    extName: '.handlebars'
}));

exports.enviar = async (opciones)=>{
    const opcionesEmail = {
        from: 'DevJobs <noreply@devjobs.com>',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context: {
            resetUrl: opciones.resetUrl
        }
    }
    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail)
}
