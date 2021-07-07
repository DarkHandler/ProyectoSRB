const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const pool = require('../../database');
const { isLoggedIn, isAdmin } = require('../lib/auth');
const { convertArrayOfObjectsToCSV, downloadCSV } = require('../lib/tableToExcel');

//instancia de nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'dimao.sa27@gmail.com',//colocar un correo
        pass: 'aquilescastro1'//colocar la contraseña
    }
});



router.get('/usersInscritos', isLoggedIn, isAdmin, async (req, res) => {
    const userInscrito = await pool.query('select * from userinscrito_reciclo');
    //console.log(userInscrito);
    res.render('admin/usersInscritos', { userInscrito });
});

router.get('/usersEspera', isLoggedIn, isAdmin, async (req, res) => {
    const userEspera = await pool.query('SELECT v.rol, v.run, u.nombre, v.telefono, v.num_habitantes, v.domicilio, u.email FROM (SELECT nombre, email, run FROM usuario) AS u INNER JOIN (SELECT rol, run, telefono, num_habitantes, domicilio FROM vivienda WHERE estado = "en espera")AS v ON u.run = v.run');
    //console.log(userEspera);
    res.render('admin/usersEspera', { userEspera });
});

router.get('/corroboracion', isLoggedIn, isAdmin, async(req, res)=>{
    const reciclaje = await pool.query('select rol,DATE_FORMAT(fecha_reciclaje,  "%Y-%m-%d" ) as fecha_reciclaje from corroboracion');
    console.log(reciclaje);
    res.render('admin/corroboracion', {reciclaje});
});

router.get('/usersAlertas/:page', isLoggedIn, isAdmin, async(req,res)=>{
    const {page} = req.params; //numero de pagina
    const LIMIT = 10; //voy sacando de a 10 elementos en pagina
    const OFFSET = (page-1) * LIMIT; //desde donde partire para sacar datos de la query
    const data = await pool.query('SELECT v.rol,v.estado,DATE_FORMAT(v.fecha_alerta,  "%Y-%m-%d" ) as fecha_alerta FROM vistaAlertas as v');
    const total_query = await pool.query('SELECT COUNT(*) as total FROM vistaAlertas');
    const defdata = [data, page, total_query];
    res.render('admin/usersAlertas',{ defdata });
});

router.get('/Acept/:run', isLoggedIn, isAdmin, async (req, res) => { //ENVIAR CORREO O QUE ADMIN CONTACTE A POSTULANTE
    const { run } = req.params;
    await pool.query('UPDATE vivienda SET estado = "inscrito" WHERE run = ?', [run]);
    const dato = await pool.query('SELECT email FROM usuario WHERE run =?', [run]);
    const { email } = dato[0]
    contentHTML = `
        <h1>Ha sido Aceptado en el Progama de reciclaje selectivo</h1>
        <p>ya puede ingresar como usuario a la pagina web: <a href="http://localhost:4000/login">DMAO-I.MunicipalidadS.A.</a></p>
        <p>con tu rut y contraseña</p>
    `;

    var MailOptions = {
        from: "DMAO-I.MunicipalidadS.A. <dimao.sa27@gmail.com>",
        to: email,
        subject: "Se ha aceptado su solicitud",
        html: contentHTML
    };

    await transporter.sendMail(MailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email enviado");
        }
    });

    req.flash('success', 'El usuario ha sido REGISTRADO correctamente');
    res.redirect('/usersEspera');
});


router.get('/Borrar/:run', isLoggedIn, isAdmin, async (req, res) => { //ENVIAR CORREO O QUE ADMIN CONTACTE A POSTULANTE
    const { run } = req.params;
    const dato = await pool.query('SELECT email FROM usuario WHERE run =?', [run]);
    await pool.query('DELETE FROM usuario WHERE run = ?', [run]);
    //await pool.query('UPDATE vivienda SET estado="desinscrito" WHERE run=?', [run]);
    const { email } = dato[0];

    contentHTML = `
        <h1>Ha sido Rechazado en el Progama de reciclaje selectivo</h1>
        <p>si quiere saber sobre su rechazo contactenos a :</p> 
    `;//falta colocar el contacto o colocar el motivo

    var MailOptions = {
        from: "DMAO-I.MunicipalidadS.A. <dimao.sa27@gmail.com>",
        to: email,
        subject: "Se ha rechazado su solicitud",
        html: contentHTML
    };

    await transporter.sendMail(MailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email enviado");
        }
    });

    req.flash('success', 'El usuario ha sido ELIMINADO correctamente');
    res.redirect('/usersEspera');
});

router.get('/usersModificar', isLoggedIn, isAdmin, async (req, res) => {
    const userModificar = await pool.query('SELECT user.rol, user.run, user.nombre, user.telefono, user.num_habitantes, user.domicilio, user.email FROM(SELECT v.rol, v.run, u.nombre, v.telefono, v.num_habitantes, v.domicilio, u.email FROM (SELECT nombre, email, run FROM usuario) AS u INNER JOIN (SELECT rol, run, telefono, num_habitantes, domicilio FROM vivienda WHERE estado = "inscrito")AS v ON u.run = v.run) AS user INNER JOIN (SELECT run FROM solicitud_modificacion) AS modi ON modi.run = user.run');
    res.render('admin/usersModificar', { userModificar });
});


router.get('/userCambio/:run', isLoggedIn, isAdmin, async (req, res) => {
    const { run } = req.params;
    const datos = await pool.query('SELECT run, rol, domicilio, num_habitantes, subsector_id FROM vivienda WHERE run=?', [run]);
    const sectores = await pool.query('SELECT sub.nombre AS subsector, sec.nombre AS sector FROM (SELECT * FROM subsector WHERE subsector_id = ?)AS sub INNER JOIN sector AS sec ON sec.sector_id=sub.sector_id', [datos[0].subsector_id]);
    const cambios = await pool.query('SELECT * FROM solicitud_modificacion WHERE run = ?', [run]);
    const secCambio = await pool.query('SELECT sub.nombre AS subsector, sec.nombre AS sector FROM (SELECT * FROM subsector WHERE subsector_id = ?)AS sub INNER JOIN sector AS sec ON sec.sector_id=sub.sector_id', [cambios[0].subsector_id])
    const info = [datos[0], sectores[0], cambios[0], secCambio[0]];
    res.render('admin/userCambio', { info });
});

router.get('/borrarCambio/:run', isLoggedIn, isAdmin, async (req, res) => { //ENVIAR CORREO O QUE ADMIN CONTACTE A POSTULANTE
    const { run } = req.params;
    await pool.query('DELETE FROM solicitud_modificacion WHERE run = ?', [run]);

    const dato = await pool.query('SELECT email FROM usuario WHERE run =?', [run]);
    const { email } = dato[0]
    contentHTML = `
        <h1>Se ha rechazado su solicitud de cambio de informacion</h1>
        <p>tu informacion no ha cambiado, si desea saber los motivos por los que no se ha aceptado contactenos:</p>
    `;//falta colocar el contacto o colocar el motivo

    var MailOptions = {
        from: "DMAO-I.MunicipalidadS.A. <dimao.sa27@gmail.com>",
        to: email,
        subject: "Se ha rechazado su solicitud de cambio de informacion",
        html: contentHTML
    };

    await transporter.sendMail(MailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email enviado");
        }
    });

    res.redirect('/usersModificar');
});

router.get('/realizaCambio/:run', isLoggedIn, isAdmin, async (req, res) => { //ENVIAR CORREO O QUE ADMIN CONTACTE A POSTULANTE
    const { run } = req.params;
    const cambio = await pool.query('SELECT rol, domicilio, num_habitantes, subsector_id FROM solicitud_modificacion WHERE run = ?', [run]);
    await pool.query('UPDATE vivienda SET rol = ?, domicilio = ?, num_habitantes = ?, subsector_id = ? WHERE run = ?', [cambio[0].rol, cambio[0].domicilio, cambio[0].num_habitantes, cambio[0].subsector_id, run]);
    const dato0 = await pool.query('SELECT nombre FROM subsector WHERE subsector_id =?', [cambio[0].subsector_id]);
    const dato1 = await pool.query('SELECT email FROM usuario WHERE run =?', [run]);
    const { email } = dato1[0];
    const { nombre } = dato0[0];

    contentHTML = `
        <h1>Se ha aceptado su solicitud de cambio de informacion</h1>
        <p>su datos son los siguientes:</p>
        <ul>
            <li>rol: ${cambio[0].rol}</li>
            <li>domicilio: ${cambio[0].domicilio}</li>
            <li>numero de habitantes: ${cambio[0].num_habitantes}</li>
            <li>subsector: ${nombre}</li>
        </ul>
    `;

    var MailOptions = {
        from: "DMAO-I.MunicipalidadS.A. <dimao.sa27@gmail.com>",
        to: email,
        subject: "Se ha Aceptado su solicitud de cambio de informacion",
        html: contentHTML
    };

    await transporter.sendMail(MailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email enviado");
        }
    });

    await pool.query('DELETE FROM solicitud_modificacion WHERE run = ?', [run]);
    res.redirect('/usersModificar/');
});

//DESINSCRIBIR USUARIOS VIVIENDA
router.get('/desinscribir/:run', isLoggedIn, isAdmin, async (req, res) => { //ENVIAR CORREO O QUE ADMIN
    const { run } = req.params;
    const dato = await pool.query('SELECT email FROM usuario WHERE run =?', [run]);
    await pool.query('UPDATE vivienda SET estado="desinscrito" WHERE run=?', [run]);
    const { email } = dato[0];

    contentHTML = `
        <h1>Ha sido Desinscrito en el Progama de reciclaje selectivo</h1>
        <p>si quiere saber sobre su desinscripcion contactenos a :</p> 
    `;//falta colocar el contacto o colocar el motivo

    var MailOptions = {
        from: "DMAO-I.MunicipalidadS.A. <dimao.sa27@gmail.com>",
        to: email,
        subject: "Ha sido desinscrito",
        html: contentHTML
    };

    await transporter.sendMail(MailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email enviado");
        }
    });

    req.flash('success', 'El usuario ha sido DESINSCRITO correctamente');
    res.redirect('/usersInscritos');
});



//*******DESCARGAS DE ARCHIVO */
router.get('/Descagar/UsersInscritos', isLoggedIn, isAdmin, async (req, res) => {
    const userInscrito = await pool.query('SELECT * FROM userinscrito_reciclo');
    downloadCSV(userInscrito, "usuariosInscritos.csv", convertArrayOfObjectsToCSV);
    res.redirect('/usersInscritos');
});
router.get('/Descagar/UsersEspera', isLoggedIn, isAdmin, async (req, res) => {
    const userEspera = await pool.query('SELECT v.rol, v.run, u.nombre, v.telefono, v.num_habitantes, v.domicilio, u.email FROM (SELECT nombre, email, run FROM usuario) AS u INNER JOIN (SELECT rol, run, telefono, num_habitantes, domicilio FROM vivienda WHERE estado = "en espera")AS v ON u.run = v.run');
    downloadCSV(userEspera, "usuariosEspera.csv", convertArrayOfObjectsToCSV);
    res.redirect('/UsersEspera');
});
router.get('/Descagar/UsersAlertas', isLoggedIn, isAdmin, async (req, res) => {
    const userAlerta = await pool.query('SELECT v.run, u.nombre, v.domicilio, DATE_FORMAT(a.fecha_alerta,  "%Y-%m-%d" ) AS fecha_alerta FROM alerta AS a INNER JOIN vivienda AS v ON a.rol=v.rol INNER JOIN usuario AS u ON v.run=u.run');
    downloadCSV(userAlerta, "usuariosAlertas.csv", convertArrayOfObjectsToCSV);
    res.redirect('/usersAlertas/1');
});
router.get('/Descagar/reciclaje', isLoggedIn, isAdmin, async (req, res) =>{
    const reciclaje = await pool.query('select rol,DATE_FORMAT(fecha_reciclaje,  "%Y-%m-%d" ) as fecha_reciclaje from corroboracion'); 
    downloadCSV(reciclaje,"reciclaje.csv",convertArrayOfObjectsToCSV);
    res.redirect('/corroboracion');
});
/**TERMINO DE DESCARGAS DE ARCHIVO */


router.get('/eliminarArchivo/:archivo', isLoggedIn, isAdmin, async (req, res) => {

    const { archivo } = req.params; //numero de pagina
    var fs = require('fs');
    fs.unlink('src/public/excels/' + archivo + '.csv', function (err) {
        if (err) { return; }
        //console.log('File deleted!');
    });
    switch (archivo) {
        case 'usuariosAlertas': { res.redirect('/usersAlertas/1'); }
        case 'reciclaje': { res.redirect('/corroboracion'); }
    }
});

router.get('/usersAlertas/:page', isLoggedIn, isAdmin, async (req, res) => {
    const { page } = req.params; //numero de pagina
    const LIMIT = 10; //voy sacando de a 10 elementos en pagina
    const OFFSET = (page - 1) * LIMIT; //desde donde partire para sacar datos de la query
    const data = await pool.query('SELECT v.run, u.nombre, v.domicilio, DATE_FORMAT(a.fecha_alerta,  "%Y-%m-%d" ) AS fecha_alerta FROM alerta AS a INNER JOIN vivienda AS v ON a.rol=v.rol INNER JOIN usuario AS u ON v.run=u.run LIMIT ?,?', [OFFSET, LIMIT]);
    const total_query = await pool.query('SELECT COUNT(*) as total FROM alerta');
    const defdata = [data, page, total_query];
    res.render('admin/usersAlertas', { defdata });
});

//----------------------------
router.get('/codigo', isLoggedIn, isAdmin, async (req, res) => {
    const Obj = await pool.query('SELECT * FROM codigo limit 1');
    console.log(Obj);
    var codigo;
    try {
        codigo = Obj[0].codigo;
    } catch (error) {
        codigo = "NO EXISTE CODIGO"
    }
    res.render('admin/codigo', { codigo });
});

router.get('/generarCodigo', isLoggedIn, isAdmin, async (req, res) => {
    var RNG = require('../lib/RNG.js');
    var fecha = new Date();
    var rng = new RNG(parseInt(fecha.getFullYear + (fecha.getMonth + 1) + fecha.getDate));
    var codigo = await rng.generarCodigo();
    await pool.query('DELETE FROM codigo WHERE 1');
    await pool.query('Insert into codigo values( ? )', [codigo]);
    res.redirect('/codigo');
});

module.exports = router;