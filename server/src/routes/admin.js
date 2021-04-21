const express = require('express');
const router = express.Router();

const pool = require('../../database');
const { isLoggedIn, isAdmin } = require('../lib/auth');



router.get('/usersInscritos', isLoggedIn, isAdmin, async(req, res)=>{
    const userInscrito = await pool.query('SELECT v.rol, v.run, u.nombre, v.telefono, v.num_habitantes, v.domicilio, u.email FROM (SELECT nombre, email, run FROM usuario) AS u INNER JOIN (SELECT rol, run, telefono, num_habitantes, domicilio FROM vivienda WHERE estado = "inscrito")AS v ON u.run = v.run');
    //console.log(userInscrito);
    res.render('admin/usersInscritos', {userInscrito});
});

router.get('/usersEspera', isLoggedIn, isAdmin, async(req, res)=>{
    const userEspera = await pool.query('SELECT v.rol, v.run, u.nombre, v.telefono, v.num_habitantes, v.domicilio, u.email FROM (SELECT nombre, email, run FROM usuario) AS u INNER JOIN (SELECT rol, run, telefono, num_habitantes, domicilio FROM vivienda WHERE estado = "en espera")AS v ON u.run = v.run');
    //console.log(userEspera);
    res.render('admin/usersEspera', {userEspera});
});

router.get('/Acept/:run', isLoggedIn, isAdmin, async (req, res) =>{
    const { run } = req.params;
    await pool.query('UPDATE vivienda SET estado = "inscrito" WHERE run = ?', [run]);
    req.flash('success','El usuario ha sido REGISTRADO correctamente');
    res.redirect('/usersEspera');
});

router.get('/Borrar/:run', isLoggedIn, isAdmin, async (req, res) =>{
    const {run} = req.params;
    await pool.query('DELETE FROM usuario WHERE run = ?', [run]);
    req.flash('success','El usuario ha sido ELIMINADO correctamente');
    res.redirect('/usersEspera');
});

router.get('/usersModificar', isLoggedIn, isAdmin, async (req, res) =>{
    const userModificar = await pool.query('SELECT user.rol, user.run, user.nombre, user.telefono, user.num_habitantes, user.domicilio, user.email FROM(SELECT v.rol, v.run, u.nombre, v.telefono, v.num_habitantes, v.domicilio, u.email FROM (SELECT nombre, email, run FROM usuario) AS u INNER JOIN (SELECT rol, run, telefono, num_habitantes, domicilio FROM vivienda WHERE estado = "inscrito")AS v ON u.run = v.run) AS user INNER JOIN (SELECT run FROM solicitud_modificacion) AS modi ON modi.run = user.run');
    res.render('admin/usersModificar', {userModificar});
});

router.get('/userCambio/:run', isLoggedIn, isAdmin, async (req, res) =>{
    const {run} = req.params;
    const datos = await pool.query('SELECT run, rol, domicilio, num_habitantes, subsector_id FROM vivienda WHERE run=?',[run]);
    const sectores = await pool.query('SELECT sub.nombre AS subsector, sec.nombre AS sector FROM (SELECT * FROM subsector WHERE subsector_id = ?)AS sub INNER JOIN sector AS sec ON sec.sector_id=sub.sector_id',[datos[0].subsector_id]);
    const cambios = await pool.query('SELECT * FROM solicitud_modificacion WHERE run = ?',[run]);
    const secCambio = await pool.query('SELECT sub.nombre AS subsector, sec.nombre AS sector FROM (SELECT * FROM subsector WHERE subsector_id = ?)AS sub INNER JOIN sector AS sec ON sec.sector_id=sub.sector_id',[cambios[0].subsector_id])
    const info = [datos[0], sectores[0],cambios[0],secCambio[0]];
    res.render('admin/userCambio', {info});
});

router.get('/borrarCambio/:run', isLoggedIn, isAdmin, async (req, res) =>{
    const {run} = req.params;
    await pool.query('DELETE FROM solicitud_modificacion WHERE run = ?',[run]);
    res.redirect('/usersModificar');
});

router.get('/realizaCambio/:run', isLoggedIn, isAdmin, async (req, res) =>{
    const {run} = req.params;
    const cambio = await pool.query('SELECT rol, domicilio, num_habitantes, subsector_id FROM solicitud_modificacion WHERE run = ?',[run]);
    await pool.query('UPDATE vivienda SET rol = ?, domicilio = ?, num_habitantes = ?, subsector_id = ? WHERE run = ?', [cambio[0].rol,cambio[0].domicilio,cambio[0].num_habitantes,cambio[0].subsector_id, run]);
    res.redirect('/borrarCambio/'+run);
});



module.exports= router;