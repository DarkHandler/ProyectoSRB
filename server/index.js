const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const { database  } = require('./keys');
const pool = require('./database');

//Initializations
const app = express();
require('./src/lib/passport'); //nuestra app se entera de la autenticacion que estamos creando


//Settings
app.set('port',process.env.PORT || 4000);

app.set('views',path.join(__dirname,'./src/views')); //le dire a node donde esta la carpeta views, _dirname devuelve la direccion del archivo que se esta ejecutando
app.engine('.hbs',exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layout'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./src/lib/handlebars')
}));
app.set('view engine', '.hbs') //define after



//Middlewares --> funciones que se ejecutan cada vez que hay una peticion, uno es Morgan
app.use(session({
    secret: 'dimaosession',
    resave: false, //para que no se empieze a renovar la sesion
    saveUninitialized: false, //para que no se vuelva a establecer la session
    store: new MySQLStore(database) //donde guardaremos la session (en nuestra bd)
}));
app.use(flash());
app.use(morgan('dev')); //para mostrar un determinado tipo de mensaje en consola
app.use(express.json()); //es para poder aceptar formatos json
app.use(express.urlencoded({extended:false}));
app.use(passport.initialize()); //inicia
app.use(passport.session()); //donde va a guardar los datos



//Global Variables --> vars. que toda mi app necesite, como el nombre

app.use((req, res, next) => {
    app.locals.success = req.flash('success'); //variable global para mensaje exitoso en todas las rutas o vistas
    app.locals.message = req.flash('message'); 
    app.locals.user = req.user; //variable global de sesion del usuario
    next();
});


//Routes --> las URLs de nuestro servidor
app.use('/',require('./src/routes/index')); //ruta principal del servidor
app.use('/',require('./src/routes/authentication'));
app.use('/',require('./src/routes/vivienda'));
app.use('/',require('./src/routes/admin'));


//Public aqui van los archivos...
app.use(express.static(path.join(__dirname,'src/public')))



//Starting the server
app.listen(app.get('port'),() =>{
    console.log('Server on port',app.get('port'));
});
