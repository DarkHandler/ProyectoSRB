const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (password)=>{ //para encriptar cuando se postule
    const salt = await bcrypt.genSalt(10); //para poder generar un hash y ejecutarlo 10 veces
    const hash = await bcrypt.hash(password, salt); //final password
    return hash;
};

//comparar contrasena hash con la que esta en la base de datos
helpers.matchPassword = async (password, savedPassword)=>{ //para compara passwd del login
    try{
        return await bcrypt.compare(password, savedPassword); //tratando de logearse y la que tengo en bd lo retorna el resultado
    }catch(e){
        console.log(e); //mostrar error
    }
};


module.exports=helpers;