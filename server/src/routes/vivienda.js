const express = require('express');
const router = express.Router();

const pool = require('../../database');

router.get('/editarPerfil/:run', async (req, res) =>{
    const {run} = req.params;
    const datos = await pool.query('SELECT run, rol, domicilio, num_habitantes, subsector_id FROM vivienda WHERE run=?',[run]);
    const consulta1 = await pool.query('SELECT * FROM subsector');
    const consulta2 = await pool.query('SELECT * FROM sector');
    const info = [consulta1, consulta2, datos[0]];
    console.log(info[2]);
    res.render('vivienda/editarPerfil',{info});
});

router.post('/editarPerfil', async (req,res)=>{ //enviar correo
    const newdatos = req.body;
    await pool.query('INSERT INTO solicitud_modificacion (run, estado, rol, domicilio, num_habitantes, subsector_id) VALUES (?,"en espera",?,?,?,?)', [newdatos.run,newdatos.rol,newdatos.domicilio,newdatos.num_habitantes,newdatos.subsector]);
    res.flash('success','La solicitud ha sido enviada');
    res.redirect('/profile');
});


//ALERTA
router.get('/alerta/:rol', async (req,res)=>{
    const { rol } = req.params;
    //NO PERMITIR INGRESAR ALERTAS MAS DE 1 VEZ A LA SEMANA
    await pool.query('INSERT INTO alerta (rol) values (?)',[rol]);
    res.flash('success','La alerta ha sido enviada con exito');
    res.redirect('/profile');
});


module.exports= router;