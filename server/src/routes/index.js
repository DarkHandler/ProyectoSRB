const express = require('express');
const router = express.Router(); //metodo que devuelve un objeto

const pool = require('../../database');  //uso para mas tarde


router.get('/', async (req,res)=>{ //ruta principal    
    res.render('visitante/inicio');
});

router.get('/reciclaje', async (req,res)=>{ //ruta principal    
    res.render('visitante/reciclaje');
});

module.exports = router;