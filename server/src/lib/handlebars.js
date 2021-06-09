const { format } = require('timeago.js');

const helpers = {};

helpers.timeago = (timestamp)=>{  //metodo creado por mi
    return format(timestamp); //fecha la convierto a formato de dias atras
};

helpers.ifequals = (arg1, arg2, options) => {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
};

helpers.eachpage = (page, total, options) => {
    var inicio = parseInt(page);
    var totalpagina, fin;
    if(inicio < 5){
        inicio=1;
    }else{
        inicio=inicio-4;
    }
    totalpagina = Math.ceil(total/10); //numero de paginas total 
    fin = inicio+10;
    if(fin > totalpagina){ //si tengo menos queries asigno cantidad maxima de pagina
        fin=totalpagina;
    }
    var ret="";
    for (var i = inicio, j = fin; i < j; i++) {
      ret = ret + options.fn(i);
    }
    return ret;
};


module.exports=helpers;