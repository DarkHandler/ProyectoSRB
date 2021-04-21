const express = require('express');
const router = express.Router();
const pool = require('../../database');
const helpers = require('../lib/helpers');

const passport = require('passport'); //voy a importar toda la biblioteca
const { isLoggedIn, isVivienda, isNotLoggedIn } = require('../lib/auth'); //para saber si esta loggeado


//POSTULACION
router.get('/signup', isNotLoggedIn, async (req, res)=>{
    const consulta1 = await pool.query('SELECT * FROM subsector');
    const consulta2 = await pool.query('SELECT * FROM sector');
    const info = [consulta1, consulta2];
    res.render('auth/signup',{info});
});

router.post('/signup', isNotLoggedIn,async (req,res)=>{ //presiono el boton postular
    //hacer metodo de verificacion
    const datos = req.body; //aca falta un dato para la tabla usuario -> el tipo usuario
    datos.tipo_usuario="vivienda";
    //ENCRIPTACION
    datos.contrasena = await helpers.encryptPassword(datos.contrasena);
    //INSERCION DE DATOS
    await pool.query('INSERT INTO usuario(run,nombre,tipo_usuario,email,contrasena) VALUES (?,?,?,?,?)',[datos.run,datos.nombre,datos.tipo_usuario,datos.correo,datos.contrasena]); //a usuario
    await pool.query('INSERT INTO vivienda(rol,domicilio,num_habitantes,telefono,subsector_id,run) VALUES (?,?,?,?,?,?)',[datos.rol,datos.domicilio,datos.num_habitantes,datos.telefono,datos.subsector,datos.run]); //a vivienda
    
    req.flash('success','Estaremos en contacto con usted para informarle del estado de su postulacion');
    res.redirect('/');   //aqui hay que enviarle alguna vista de alerta que diga se le estara comunicando de su postulacion
});




//INICIO DE SESION
router.get('/login', isNotLoggedIn, (req, res)=>{
    res.render('auth/login');
});

router.post('/login', isNotLoggedIn,(req, res, next)=>{
    
    passport.authenticate('local.login',{
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash:true
    })(req, res, next);
});

//USUARIO EN SESION
router.get('/profile', isLoggedIn , isVivienda , async(req, res) => { //primero se ejecuta isLoggedIn, sino next
    const {user} = req;
    var vivienda = await pool.query("SELECT rol, domicilio, num_habitantes, telefono, fecha_incorporacion, subsector_id FROM vivienda where run=?",[user.run]);
    vivienda = vivienda[0];
    res.render('vivienda/profile',{vivienda});
});


//CERRAR SESION
router.get('/logout', isLoggedIn,(req, res)=>{
    req.logOut(); //passport nos da este metodo
    res.redirect('/login');
});


module.exports= router;