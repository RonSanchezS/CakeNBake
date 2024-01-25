const { app, BrowserWindow } = require('electron');
const mysql = require('mysql2');


    // Configura la conexión a la base de datos
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'pasteleria'
    });
  
    // Conéctate a la base de datos
    connection.connect((err) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
      }
      console.log('Conexión a la base de datos establecida');
  
      connection.query('SELECT * FROM ventas', (error, results, fields) => {
        if (error) {
          console.error('Error al realizar la consulta:', error);
          return;
        }
        console.log('Resultados de la consulta:', results);
      });
  
      connection.end();
    });
  
  