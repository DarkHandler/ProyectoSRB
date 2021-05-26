const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); //para correo

const pool = require('../../database');
const { isLoggedIn, isVivienda } = require('../lib/auth');

//instancia de nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'dimao.sa27@gmail.com',
        pass: 'aquilescastro1'
    }
});


router.get('/editarPerfil/:run', isLoggedIn, isVivienda, async (req, res) =>{
    const {run} = req.params;
    const datos = await pool.query('SELECT run, rol, domicilio, num_habitantes, subsector_id FROM vivienda WHERE run=?',[run]);
    const consulta1 = await pool.query('SELECT * FROM subsector');
    const consulta2 = await pool.query('SELECT * FROM sector');
    const info = [consulta1, consulta2, datos[0]];
    console.log(info[2]);
    res.render('vivienda/editarPerfil',{info});
});

router.post('/editarPerfil', isLoggedIn, isVivienda,  async (req,res)=>{ //enviar correo
    const newdatos = req.body;
    await pool.query('INSERT INTO solicitud_modificacion (run, estado, rol, domicilio, num_habitantes, subsector_id) VALUES (?,"en espera",?,?,?,?)', [newdatos.run,newdatos.rol,newdatos.domicilio,newdatos.num_habitantes,newdatos.subsector]);
    const dato0 = await pool.query('SELECT nombre FROM subsector WHERE subsector_id =?', [newdatos.subsector]);
    const dato1 = await pool.query('SELECT email FROM usuario WHERE run =?', [newdatos.run]);
    const { email } = dato1[0]
    const { nombre } = dato0[0];

    contentHTML = `
        <h1>Se recibido su solicitud de modificacion de datos</h1>
        <p>Pronto se realizara su solicitud y se informara a traves de este mismo correo</p>
        <p>los datos a modificar son:</p>
        <ul>
            <li>rol: ${newdatos.rol}</li>
            <li>domicilio: ${newdatos.domicilio}</li>
            <li>numero de habitantes: ${newdatos.num_habitantes}</li>
            <li>subsector: ${nombre}</li>
        </ul>
    `;

    var MailOptions = {
        from: "DMAO-I.MunicipalidadS.A. <dimao.sa27@gmail.com>", //como te llega el correo
        to: "dimao.sa27@gmail.com", //email,
        subject: "Se ha enviado la solicitud",
        html: contentHTML
    };
    
    await transporter.sendMail(MailOptions, (error, info) =>{
        if(error){
            console.log(error);
        }else{
            console.log("Email enviado");
        }
    });

    req.flash('success','La solicitud ha sido ENVIADA correctamente');
    res.redirect('/profile');
});


//ALERTA
router.get('/alerta/:rol', isLoggedIn, isVivienda, async (req,res)=>{
    const { rol } = req.params;
    //NO PERMITIR INGRESAR ALERTAS MAS DE 1 VEZ A LA SEMANA
    await pool.query('INSERT INTO alerta (rol) values (?)',[rol]);
    req.flash('success','La alerta ha sido enviada con exito');
    res.redirect('/profile');
});


//GET DESINCRIBIRSE
router.get('/desinscribirme/:run', isLoggedIn, isVivienda, async(req,res)=>{
    res.render("vivienda/form-desinscripcion"); //implementar vista otro dia
});

//POST DESINSCRIBIRSE
router.post('/desinscribirme', isLoggedIn, isVivienda, async (req,res)=>{ //formulario de desincripcion automatica
    const {motivo} = req.body; // tengo la descripcion
    const {user} = req; //obtengo los datos de la session del usuario
    const {run} = user; //tengo el run
    //console.log(run);
    //console.log(descripcion);
    
    //const dato = await pool.query('SELECT email FROM usuario WHERE run =?', [run]); 
    await pool.query('INSERT INTO desincripcion values (?,?)',[run],[motivo]);
    await pool.query('UPDATE vivienda SET estado="desinscrito" WHERE run=?', [run]); //ESTE ESTA OK
    const email  = "dimao.sa27@gmail.com"; //dato[0]; le enviamos un correo al admin de que un user se desinscribio

    contentHTML = `
        <h1>Un usuario se ha Desinscrito en el Progama de reciclaje selectivo</h1>
        <ul>
        <li>Usuario desinscrito: ${run} </li>
        <li>Correo de contacto: ???</li>
        <li>Motivo: ${motivo} </li>
        </ul>
    `;//falta colocar el contacto o colocar el motivo

    var MailOptions = {
        from: "DMAO-I.MunicipalidadS.A. <dimao.sa27@gmail.com>",
        to: email,
        subject: "Ha sido desinscrito",
        html: contentHTML
    };

    await transporter.sendMail(MailOptions, (error, info) =>{
        if(error){
            console.log(error);
        }else{
            console.log("Email enviado");
        }
    });

    req.flash('success','Usted se ha sido DESINSCRITO correctamente');
    //res.redirect('/logout');
    res.send("hola");
});

module.exports= router;