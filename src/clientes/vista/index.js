const { app, BrowserWindow } = require("electron");
const mysql = require("mysql2");

document.addEventListener("DOMContentLoaded", () => {
  getData().then((results) => {
    updateTableBody(results);
  });
});

const getData = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "pasteleria",
    });

    connection.connect((err) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        reject(err);
        return;
      }
      console.log("Conexión a la base de datos establecida");

      connection.query(
        `SELECT
        c.id AS id_cliente,
        c.carnet AS carnet,
        c.nombre AS nombre_cliente,
        COALESCE(SUM(v.precio), 0) AS total_gastado
    FROM
        cliente c
    LEFT JOIN
        ventas v ON c.id = v.id_usuario
    GROUP BY
        c.id, c.nombre
    ORDER BY
        total_gastado DESC;`,
        (error, results, fields) => {
          if (error) {
            console.error("Error al realizar la consulta:", error);
            reject(error);
            return;
          }
          if (results.length > 0) {
            resolve(results);
          } else {
            resolve([]);
          }
        }
      );
      connection.end();
    });
  });
};

const updateTableBody = (clientes) => {
    const tbody = document.querySelector("#tbody-clientes");
    tbody.innerHTML = "";
    clientes.forEach((cliente) => {
      tbody.innerHTML += `
        <tr>
          <td>${cliente.id_cliente}</td>
          <td>${cliente.nombre_cliente}</td>
          <td>${cliente.carnet}</td>
          <td>${cliente.total_gastado}</td>
        </tr>
      `;
    });
  }