const dateFormatter = (date) => {
var fechaOriginal = new Date(date);


var dia = fechaOriginal.getUTCDate();
var mes = fechaOriginal.getUTCMonth();
var anio = fechaOriginal.getUTCFullYear();

if(isNaN (dia) || isNaN (mes) || isNaN (anio)) return null;
  


var nombresMeses = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

var nombreMes = nombresMeses[mes];

var fechaFormateada = dia + " de " + nombreMes + " del " + anio;

return fechaFormateada;
};

module.exports = dateFormatter;