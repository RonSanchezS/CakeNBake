const { app, BrowserWindow } = require("electron");
const mysql = require("mysql2");
const dateFormatter = require("../../../utils/dateFormatter");

let ventas = [];

let todasLasVentas = [];

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
    "select c.id, c.nombre, p.precio, COALESCE(p.fecha, '') as fecha, COALESCE(p.fecha_entrega, '') as fecha_entrega, COALESCE(p.detalle, '') as detalle, p.metodo_pago from ventas p join cliente c where c.id = p.id_usuario order by fecha desc",/*ver esto*/
    (error, results, fields) => {
      if (error) {
        console.error("Error al realizar la consulta:", error);
        return;
      }
      if (results.length > 0) {
        todasLasVentas = results;
        const tbody = document.querySelector("#tbody-ventas");
        tbody.innerHTML = "";
        results.forEach((venta) => {
          tbody.innerHTML += `
          <tr>
            <td>${venta.id}</td>
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
        let ventasPorMetodoPago = getData();
        ventasPorMetodoPago = ventasPorMetodoPago.sort((a, b) => {
          const metodoPagoA = a.metodo_pago.toLowerCase(); // Convertir a minúsculas para evitar diferencias por mayúsculas/minúsculas
          const metodoPagoB = b.metodo_pago.toLowerCase();

          return metodoPagoA.localeCompare(metodoPagoB);
        });
        updateTableBody(ventasPorMetodoPago);
        break;
      case "2":
        let ventasPorPrecio = getData();
        ventasPorPrecio = ventasPorPrecio.sort((a, b) => b.precio - a.precio); // Cambiado a b.precio - a.precio para ordenar de forma descendente
        updateTableBody(ventasPorPrecio);
        // Lógica para ordenar por Precio
        break;
      case "3":
        let ventasPorDetalle = getData();
        ventasPorDetalle = ventasPorDetalle.sort((a, b) => {
          if (a.detalle > b.detalle) {
            return -1; // Cambiado a -1 para ordenar de forma descendente
          }
          if (a.detalle < b.detalle) {
            return 1; // Cambiado a 1 para ordenar de forma descendente
          }
          return 0;
        }
        );
        updateTableBody(ventasPorDetalle);
        // Lógica para ordenar por Detalle
        break;
      case "4":
        let ventasPorFechaPedido = getData();
        ventasPorFechaPedido = ventasPorFechaPedido.sort((a, b) => {
          const dateA = new Date(a.fecha);
          const dateB = new Date(b.fecha);

          // Manejo de elementos sin fecha
          if (isNaN(dateA) && isNaN(dateB)) {
            return 0; // Si ambos no tienen fecha, no cambian su orden relativo
          } else if (isNaN(dateA)) {
            return 1; // Si a no tiene fecha, a va al final
          } else if (isNaN(dateB)) {
            return -1; // Si b no tiene fecha, b va al final
          } else {
            return dateB - dateA; // Ordenamiento descendente por fecha
          }
        });
        updateTableBody(ventasPorFechaPedido);
        // Lógica para ordenar por Fecha de pedido
        break;
      case "5":
        // Lógica para ordenar por Fecha de entrega
        getData2().then((results) => {
          updateTableBody(results);
        });
        break;
      case "6":
        let ventasPorID = getData();
        ventasPorID = ventasPorID.sort((a, b) => a.id - b.id);
        updateTableBody(ventasPorID);
        break;
      default:
        // Manejo de un valor no reconocido
        break;
    }
  });

  const getData = () => {
    return todasLasVentas;
  };
  const getData2 = () => {
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

        connection.query("select c.id, c.nombre, p.precio, COALESCE(p.fecha, '') as fecha, COALESCE(p.fecha_entrega, '') as fecha_entrega, COALESCE(p.detalle, '') as detalle, p.metodo_pago from ventas p join cliente c where c.id = p.id_usuario order by fecha_entrega desc", (error, results, fields) => {
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

/* Código para cambiar el sentido de la flecha y el orden de los datos de ventas */
function cambiarOrden(columnId) {
  let flecha = document.getElementById("arrow-" + columnId);
  let flechaAbajo = flecha.classList.contains("down");

  if (flechaAbajo) {
    flecha.classList.remove("down");
    flecha.classList.add("up");
  } else {
    flecha.classList.remove("up");
    flecha.classList.add("down");
  }
}