const { app, BrowserWindow } = require("electron");
const mysql = require("mysql2");
const dateFormatter = require("../../../utils/dateFormatter");

let ventas = [];

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pasteleria",
});

// Conéctate a la base de datos
connection.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("Conexión a la base de datos establecida");

  connection.query(
    "select c.nombre, p.precio, COALESCE(p.fecha, '') as fecha, COALESCE(p.fecha_entrega, '') as fecha_entrega, COALESCE(p.detalle, '') as detalle, p.metodo_pago from ventas p join cliente c where c.id = p.id_usuario order by fecha desc",
    (error, results, fields) => {
      if (error) {
        console.error("Error al realizar la consulta:", error);
        return;
      }
      if (results.length > 0) {
        const tbody = document.querySelector("#tbody-ventas");
        tbody.innerHTML = "";
        results.forEach((venta) => {
          tbody.innerHTML += `
          <tr>
            <td>${venta.nombre}</td>
            <td>${venta.metodo_pago}</td>
            <td>${venta.detalle ?? "No hay detalle"}</td>
            <td>${venta.precio ?? "No hay precio"}</td>
            <td>${dateFormatter(venta.fecha) ?? "No hay fecha"}</td>
            <td>${dateFormatter(venta.fecha_entrega) ?? "No hay fecha"}</td>
          </tr>
        `;
        });
      }
      console.log("Resultados de la consulta:", results);
    }
  );

  connection.end();
});

document.addEventListener("DOMContentLoaded", () => {
  const selectOrden = document.getElementById("selectOrden");

  selectOrden.addEventListener("change", async () => {
    const selectedValue = selectOrden.value;

    switch (selectedValue) {
      case "1":
        getData().then((results) => {
          ventas = results;
          const ventasPorMetodoPago = ventas.sort((a, b) => {
            if (a.metodo_pago > b.metodo_pago) {
              return -1; // Cambiado a -1 para ordenar de forma descendente
            }
            if (a.metodo_pago < b.metodo_pago) {
              return 1; // Cambiado a 1 para ordenar de forma descendente
            }
            return 0;
          });
          updateTableBody(ventasPorMetodoPago);
        });
        break;
      case "2":
        // Lógica para ordenar por Precio
        getData().then((results) => {
          ventas = results;
          const ventasPorPrecio = ventas.sort((a, b) => b.precio - a.precio); // Cambiado a b.precio - a.precio para ordenar de forma descendente
          updateTableBody(ventasPorPrecio);
        });
        break;
      case "3":
        // Lógica para ordenar por Detalle
        getData().then((results) => {
          ventas = results;
          const ventasPorDetalle = ventas.sort((a, b) => {
            if (a.detalle > b.detalle) {
              return -1; // Cambiado a -1 para ordenar de forma descendente
            }
            if (a.detalle < b.detalle) {
              return 1; // Cambiado a 1 para ordenar de forma descendente
            }
            return 0;
          });
          updateTableBody(ventasPorDetalle);
        });
        break;
      case "4":
        // Lógica para ordenar por Fecha de pedido
        getData().then((results) => {
          ventas = results;
          const ventasPorFechaPedido = ventas.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          ); // Cambiado a new Date(b.fecha) - new Date(a.fecha) para ordenar de forma descendente
          console.log(ventasPorFechaPedido);

          updateTableBody(ventasPorFechaPedido);
        });
        break;
      case "5":
        // Lógica para ordenar por Fecha de entrega
        getData().then((results) => {
          ventas = results;
          const ventasPorFechaEntrega = ventas.sort(
            (a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega)
          ); // Cambiado a new Date(b.fecha_entrega) - new Date(a.fecha_entrega) para ordenar de forma descendente
          console.log(ventasPorFechaEntrega);

          updateTableBody(ventasPorFechaEntrega);
        });
        break;
      case "6":
        getData().then((results) => {
          updateTableBody(results);
        });
        break;
      default:
        // Manejo de un valor no reconocido
        break;
    }
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

        connection.query("SELECT * FROM ventas", (error, results, fields) => {
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
        });
        connection.end();
      });
    });
  };
});

function updateTableBody(ventas) {
  const tbody = document.querySelector("#tbody-ventas");
  tbody.innerHTML = "";
  ventas.forEach((venta) => {
    tbody.innerHTML += `
      <tr>
        <td>${venta.id}</td>
        <td>${venta.metodo_pago}</td>
        <td>${venta.precio}</td>
        <td>${venta.detalle ?? "No hay detalle"}</td>
        <td>${dateFormatter(venta.fecha) ?? "No hay fecha"}</td>
        <td>${dateFormatter(venta.fecha_entrega) ?? "No hay fecha"}</td>
      </tr>
    `;
  });
}
