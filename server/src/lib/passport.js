//definiremos nuestros metodos de autenticacion
const passport = require('passport'); //permite hacer autenticacion con medios sociales, como facebook y otros
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../../database');
const helpers = require('../lib/helpers');


passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    //console.log(req.body);
    const rows = await pool.query('SELECT * FROM usuario WHERE run= ?',[username]); //reviso si esta mi usuario
    if(rows.length > 0){ //si tengo al usuario
        const user = rows[0]; //obtener usuario que encontre
        //const validPassword = await helpers.matchPassword(password, user.contrasena); //comparo la contrasena
        const validPassword = password == user.contrasena;
        if(validPassword){ //si es correcta la password
            if(user.tipo_usuario == "vivienda"){
                const vivienda = await pool.query('SELECT estado FROM vivienda WHERE run=?',[user.run]);
                if(vivienda[0].estado == "en espera"){
                    done(null, false, req.flash('warning','El estado de su postulacion aun esta pendiente')); //no le envio error ni usuario, pero le envio un mensaje..
                }else{
                    if(vivienda[0].estado == "desinscrito"){
                        done(null, false, req.flash('danger','Usted se ha desinscrito del programa de reciclaje'));
                    }else{
                        done(null, user, req.flash('success','Bienvenido '+user.nombre)); //le paso null como error
                    }
                }
            }
            done(null, user, req.flash('success','Bienvenido '+user.nombre)); //le paso null como error
        }else{
            done(null, false, req.flash('danger','Los datos ingresados son incorrectos')); //no le envio error ni usuario, pero le envio un mensaje..
        }
    }else{ //si no encontre ningun usuario
        done(null, false, req.flash('danger','Los datos ingresados son incorrectos'));
    }

})); 



//Tenemos que definir 2 partes,: para serializar el usuario y otra para deserializarlo

passport.serializeUser((user, done)=>{ //serializamos para guardar los datos del usuario
    done(null,user.run);
});


passport.deserializeUser(async (run, done)=>{
    const rows = await pool.query('SELECT * FROM usuario WHERE run = ?', [run]);
    done(null,rows[0]);
});

