const { app, BrowserWindow } = require("electron");
const mysql = require("mysql2");
const dateFormatter = require("../../../utils/dateFormatter");

let clientes = [];

let todosLosClientes = [];

function getDataInicio() {
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
          console.log(results);
          todosLosClientes = results;
          const tbody = document.querySelector("#tbody-clientes");
          tbody.innerHTML = "";
          todosLosClientes.forEach((cliente) => {
            console.log(cliente);
            const nombreCliente = cliente.nombre_cliente
              ? cliente.nombre_cliente
              : "Sin nombre";

            tbody.innerHTML += `
            <tr onClick="mostrarModal('${nombreCliente}', '${cliente.id_cliente}')">
            <td>${cliente.id_cliente}</td>
          <td>${nombreCliente}</td>
          <td>${cliente.carnet}</td>
          <td>${cliente.total_gastado}</td>
          <td class="edicion">
          <a onclick="event.stopPropagation()" href="../formulario/crear.html?clienteId=${cliente.id_cliente}&nombre=${nombreCliente}&carnet=${cliente.carnet}">
            <svg class="editar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>
          </a>
          <button onclick="eliminarCliente('${nombreCliente}')">
              <svg class="eliminar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>
            </button> 
          </td>
        </tr>
      `;
          });
        } else {
          resolve([]);
        }
      }
    );
    connection.end();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getDataInicio();

  const selectOrden = document.getElementById("selectOrden");

  selectOrden.addEventListener("change", async () => {
    const selectedValue = selectOrden.value;

    switch (selectedValue) {
      case "1":
        let clientesAlfabeticamente = getData();
        clientesAlfabeticamente = clientesAlfabeticamente.sort((a, b) => {
          const nombreClienteA = a.nombre_cliente
            ? a.nombre_cliente.toLowerCase()
            : "sin nombre";
          const nombreClienteB = b.nombre_cliente
            ? b.nombre_cliente.toLowerCase()
            : "sin nombre";

          if (
            nombreClienteA === "sin nombre" &&
            nombreClienteB === "sin nombre"
          ) {
            return 0; // Si ambos son "sin nombre", no cambian su orden relativo
          } else if (nombreClienteA === "sin nombre") {
            return 1; // Si a es "sin nombre", a va al final
          } else if (nombreClienteB === "sin nombre") {
            return -1; // Si b es "sin nombre", b va al final
          } else {
            return nombreClienteA.localeCompare(nombreClienteB);
          }
        });
        updateTableBody(clientesAlfabeticamente);
        break;

      case "2":
        let clientesPorCarnet = getData();
        clientesPorCarnet = clientesPorCarnet.sort((a, b) => {
          const carnetA = a.carnet ? a.carnet.toLowerCase() : "";
          const carnetB = b.carnet ? b.carnet.toLowerCase() : "";

          if (carnetA === "0" && carnetB === "0") {
            return 0; // Si ambos son "sin nombre", no cambian su orden relativo
          } else if (carnetA === "0") {
            return 1; // Si a es "sin nombre", a va al final
          } else if (carnetB === "0") {
            return -1; // Si b es "sin nombre", b va al final
          } else {
            return carnetA.localeCompare(carnetB);
          }
        });
        updateTableBody(clientesPorCarnet);

        break;
      case "3":
        let clientesPorTotalDecompra = getData();
        clientesPorTotalDecompra = clientesPorTotalDecompra.sort(
          (a, b) => a.total_gastado - b.total_gastado
        );
        clientesPorTotalDecompra = clientesPorTotalDecompra.reverse();
        updateTableBody(clientesPorTotalDecompra);
        break;
      case "4":
        let clientesPorId = getData();
        clientesPorId = clientesPorId.sort(
          (a, b) => a.id_cliente - b.id_cliente
        );
        updateTableBody(clientesPorId);
        break;

      // Puedes agregar más casos según tus necesidades de ordenamiento en el futuro
      default:
        // Manejo de un valor no reconocido
        break;
    }
  });
});

const getData = () => {
  return todosLosClientes;
};

const updateTableBody = (clientes) => {
  const tbody = document.querySelector("#tbody-clientes");
  tbody.innerHTML = "";
  clientes.forEach((cliente) => {
    const nombreCliente = cliente.nombre_cliente
      ? cliente.nombre_cliente
      : "Sin nombre";

    tbody.innerHTML += `
      <tr onClick="mostrarModal('${nombreCliente}', '${cliente.id_cliente}')">
        <td>${cliente.id_cliente}</td>
        <td>${nombreCliente}</td>
        <td>${cliente.carnet}</td>
        <td>${cliente.total_gastado}</td>
        <td class="edicion">
        <a onclick="event.stopPropagation()" href="../formulario/crear.html?clienteId=${cliente.id_cliente}&nombre=${nombreCliente}&carnet=${cliente.carnet}">
          <svg class="editar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>
        </a>
          <button onclick="eliminarCliente('${nombreCliente}')">
            <svg class="eliminar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>
          </button>
        </td>
      </tr>
    `;
  });
};

modalVisible = false;

function mostrarModal(nombreCliente, id_cliente) {
  if (id_cliente) {
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
        `SELECT  c.nombre AS nombre_cliente,
        v.precio AS precio,
        v.fecha AS fecha_venta,
        v.detalle AS detalle_venta,
        v.fecha_entrega AS fecha_entrega,
        v.metodo_pago AS metodo_pago
    FROM
        Ventas v
    JOIN
        Cliente c ON v.id_usuario = c.id
    WHERE
        c.id = ?;`,
        [id_cliente],
        (error, results, fields) => {
          if (error) {
            console.error("Error al realizar la consulta:", error);
            reject(error);
            return;
          }
          if (results.length > 0) {
            console.log(results);
            const tbody = document.querySelector("#tbody-modal");
            tbody.innerHTML = "";
            results.forEach((venta) => {
              console.log(venta);
              
              tbody.innerHTML += `
              <tr>
                <td>${venta.nombre_cliente}</td>
                <td>${venta.precio}</td>
                <td>${venta.detalle_venta}</td>
                <td>${dateFormatter(venta.fecha_venta)}</td>
                <td>${dateFormatter(venta.fecha_entrega)}</td>
                <td>${venta.metodo_pago}</td>
              </tr>
            `;
            });
          } else {
            const tbody = document.querySelector("#tbody-modal");
            tbody.innerHTML = "";
            alert("No hay ventas registradas para este cliente");
          }
        }
      );
      connection.end();
    });
  }
  const clienteNombre = document.getElementById("cliente-nombre");
  clienteNombre.innerHTML = "Compras de " + nombreCliente;
  const miModal = document.getElementById("miModal");
  modalVisible = !modalVisible;
  console.log(modalVisible);
  if (modalVisible) {
    miModal.style.display = "flex";
    miModal.style.justifyContent = "center";
    miModal.style.alignItems = "center";
  } else {
    miModal.style.display = "none";
  }
}

function eliminarCliente(nombreCliente) {

  //stop propagation
  event.stopPropagation();

  // Pregunta al usuario si está seguro de eliminar algo
  if (
    confirm(`¿Estás seguro de que deseas eliminar el cliente ${nombreCliente}?`)
  ) {
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
        "DELETE FROM cliente WHERE nombre = ?",
        [nombreCliente],
        (error, results, fields) => {
          if (error) {
            alert("No puedes eliminar un cliente con compras registradas");
            return;
          }
          getDataInicio();
        }
      );

      connection.end();
    });

    console.log("El elemento ha sido eliminado.");
  } else {
    // Si el usuario hace clic en "Cancelar" o cierra el diálogo, no hagas nada
    console.log("La eliminación ha sido cancelada.");
  }
}

/* Código para cambiar el sentido de las flechas en el th */
function cambiarFlecha(columnId) {
  let flecha = document.getElementById("arrow-" + columnId);
  let flechaAbajo = flecha.classList.contains("down");

  if (flechaAbajo) {
    flecha.classList.remove("down");
    flecha.classList.add("up");
  } else {
    flecha.classList.remove("up");
    flecha.classList.add("down");
  }
  switch (columnId) {
    case "nombre":
      let clientesAlfabeticamente = getData();
      if (flechaAbajo) {
        clientesAlfabeticamente = clientesAlfabeticamente.sort((a, b) => {
          const nombreClienteA = a.nombre_cliente
            ? a.nombre_cliente.toLowerCase()
            : "sin nombre";
          const nombreClienteB = b.nombre_cliente
            ? b.nombre_cliente.toLowerCase()
            : "sin nombre";

          if (
            nombreClienteA === "sin nombre" &&
            nombreClienteB === "sin nombre"
          ) {
            return 0; // Si ambos son "sin nombre", no cambian su orden relativo
          } else if (nombreClienteA === "sin nombre") {
            return 1; // Si a es "sin nombre", a va al final
          } else if (nombreClienteB === "sin nombre") {
            return -1; // Si b es "sin nombre", b va al final
          } else {
            return nombreClienteA.localeCompare(nombreClienteB);
          }
        });
      } else {
        clientesAlfabeticamente = clientesAlfabeticamente.sort((a, b) => {
          const nombreClienteA = a.nombre_cliente
            ? a.nombre_cliente.toLowerCase()
            : "sin nombre";
          const nombreClienteB = b.nombre_cliente
            ? b.nombre_cliente.toLowerCase()
            : "sin nombre";

          if (
            nombreClienteA === "sin nombre" &&
            nombreClienteB === "sin nombre"
          ) {
            return 0; // Si ambos son "sin nombre", no cambian su orden relativo
          } else if (nombreClienteA === "sin nombre") {
            return -1; // Si a es "sin nombre", a va al inicio
          } else if (nombreClienteB === "sin nombre") {
            return 1; // Si b es "sin nombre", b va al inicio
          } else {
            return nombreClienteB.localeCompare(nombreClienteA);
          }
        });
      }
      updateTableBody(clientesAlfabeticamente);
      break;
    case "carnet":
      let clientesPorCarnet = getData();
      if (flechaAbajo) {
        clientesPorCarnet = clientesPorCarnet.sort((a, b) => {
          const carnetA = a.carnet ? a.carnet.toLowerCase() : "";
          const carnetB = b.carnet ? b.carnet.toLowerCase() : "";

          if (carnetA === "0" && carnetB === "0") {
            return 0; // Si ambos son "sin nombre", no cambian su orden relativo
          } else if (carnetA === "0") {
            return 1; // Si a es "sin nombre", a va al final
          } else if (carnetB === "0") {
            return -1; // Si b es "sin nombre", b va al final
          } else {
            return carnetA.localeCompare(carnetB);
          }
        });
      } else {
        clientesPorCarnet = clientesPorCarnet.sort((a, b) => {
          const carnetA = a.carnet ? a.carnet.toLowerCase() : "";
          const carnetB = b.carnet ? b.carnet.toLowerCase() : "";

          if (carnetA === "0" && carnetB === "0") {
            return 0; // Si ambos son "sin nombre", no cambian su orden relativo
          } else if (carnetA === "0") {
            return -1; // Si a es "sin nombre", a va al inicio
          } else if (carnetB === "0") {
            return 1; // Si b es "sin nombre", b va al inicio
          } else {
            return carnetB.localeCompare(carnetA);
          }
        });
      }
      updateTableBody(clientesPorCarnet);
      break;
    case "total":
      let clientesPorTotalDecompra = getData();
      if (flechaAbajo) {
        clientesPorTotalDecompra = clientesPorTotalDecompra.sort(
          (a, b) => a.total_gastado - b.total_gastado
        );
      } else {
        clientesPorTotalDecompra = clientesPorTotalDecompra.sort(
          (a, b) => b.total_gastado - a.total_gastado
        );
      }
      updateTableBody(clientesPorTotalDecompra);
      break;
    case "id":
      let clientesPorId = getData();
      if (flechaAbajo) {
        clientesPorId = clientesPorId.sort(
          (a, b) => a.id_cliente - b.id_cliente
        );
      } else {
        clientesPorId = clientesPorId.sort(
          (a, b) => b.id_cliente - a.id_cliente
        );
      }
      updateTableBody(clientesPorId);
      break;
  }
}
