module.exports = {

    isLoggedIn(req, res, next){
        if(req.isAuthenticated()){ //metodo de passport que nos han poblado desde el objeto request
            //si existe la sesion
            return next();
        }
        return res.redirect('/login');
    },

    isNotLoggedIn(req, res, next){
        if(!req.isAuthenticated()){ 
            return next();
        }
        return res.redirect('/');
    },

    isAdmin(req, res, next){ //metodo para preguntar si es que es admin
        const {user} = req;
        if(user.tipo_usuario == 'admin'){
                return next();
        }
        return res.redirect('/'); //significa que es vivienda
    },

    isVivienda(req, res, next){ //metodo para preguntar si es que es admin
        const {user} = req;
        if(user.tipo_usuario == 'vivienda'){
                return next();
        }
        return res.redirect('/'); //significa que es admin
    }

}; //objeto con un metodo para saber si el usuario esta loggeado o no
