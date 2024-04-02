const mongoose = require('mongoose');
require('./config/db');

const express =  require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createError = require('http-errors')
const passport =  require('./config/passport');

require('dotenv').config({path:'variables.env'});


const app = express();

//habilitar body parser || Body parser nos sirve para poder leer los body de los forms en forma de json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// // habilitar express validator (cvalidar y sanitizar campos)
// app.use(expressValidator()); DESACTUALIZADO AHORA EL CODIGO VA EN EL CONTROLLER

// habilitar Handlebars como View Engine
app.engine('handlebars',
    exphbs.engine({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);
app.set('view engine', 'handlebars');

//static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser())
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DATABASE})
}))
// inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y mensajes flash
app.use(flash());

//Crear Middleware
app.use((req,res,next)=>{
    res.locals.mensajes = req.flash();
    next();
})

app.use('/', router());

// 404 not found
app.use((req,res,next)=>{
    next(createError(404,'No Encontrado'))
});
// Administracion de los errores
app.use((error,req,res,next)=>{
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);

    // renderiza la pagina de error 
    res.render('error')
})

// Dejar que Heroku nos asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT || 5000

app.listen(port, host, ()=>{
    console.log('El servidor esta funcionando');
});

//app.listen(process.env.PUERTO);


