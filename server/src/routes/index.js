const express = require('express');
const router = express.Router(); //metodo que devuelve un objeto

const pool = require('../../database');  //uso para mas tarde


router.get('/', async (req,res)=>{ //ruta principal    
    res.render('visitante/inicio');
});

//const datos = await pool.query('select s.nombre, count(co.rol) as veces_recicla from sector as s inner join subsector as subs on s.sector_id=subs.sector_id inner join vivienda as v on v.subsector_id=subs.subsector_id inner join corroboracion as co on v.rol=co.rol group by s.nombre;');

router.get('/reciclaje', async (req,res)=>{ //ruta principal
    const datos = await pool.query('SELECT DATE_FORMAT(fecha_reciclaje,  "%Y-%m-%d" )"X", COUNT(*) "Y" FROM corroboracion WHERE fecha_reciclaje BETWEEN DATE_SUB((SELECT MAX(fecha_reciclaje) FROM corroboracion),INTERVAL 1 MONTH) AND (SELECT MAX(fecha_reciclaje) FROM corroboracion) GROUP BY fecha_reciclaje');
    const total = await pool.query('SELECT COUNT(*) "Total" FROM corroboracion WHERE fecha_reciclaje BETWEEN DATE_SUB((SELECT MAX(fecha_reciclaje) FROM corroboracion),INTERVAL 1 MONTH) AND (SELECT MAX(fecha_reciclaje) FROM corroboracion)');
    const info = [datos,total];
    res.render('visitante/reciclaje',{info});
});

module.exports = router;