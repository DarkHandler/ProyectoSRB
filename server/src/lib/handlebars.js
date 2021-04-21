const { format } = require('timeago.js');

const helpers = {};

helpers.timeago = (timestamp)=>{  //metodo creado por mi
    return format(timestamp); //fecha la convierto a formato de dias atras
};

helpers.ifequals = (arg1, arg2, options) => {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
};


module.exports=helpers;