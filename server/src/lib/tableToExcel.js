module.exports = {

    convertArrayOfObjectsToCSV(args) {
      var result, ctr, keys, columnDelimiter, lineDelimiter, data;
  
      data = args.data || null;
      if (data == null || !data.length) {
          return null;
      }
  
      columnDelimiter = args.columnDelimiter || ';';
      lineDelimiter = args.lineDelimiter || '\n';
  
      keys = Object.keys(data[0]);
  
      result = '';
      result += keys.join(columnDelimiter);
      result += lineDelimiter;
  
      data.forEach(function(item) {
          ctr = 0;
          keys.forEach(function(key) {
              if (ctr > 0) result += columnDelimiter;
  
              result += item[key];
              ctr++;
          });
          result += lineDelimiter;
      });
      // alert(result);
      return result;
    },
  
    downloadCSV(data,archivo,convertArrayOfObjectsToCSV) {
      
      var csv = convertArrayOfObjectsToCSV({
        data: data
      }); 
      var fs = require('fs');
      fs.writeFile("src/public/excels/"+archivo, csv, function(err) {
        if (err) {
          return console.log(err);
        }
        console.log("El archivo fue creado correctamente");
      });
    
    }
  }
  