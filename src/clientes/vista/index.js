const { app, BrowserWindow } = require("electron");
const mysql = require("mysql2");

let clientes = [];

document.addEventListener("DOMContentLoaded", () => {
  getData().then((results) => {
    updateTableBody(results);
  });

  const selectOrden = document.getElementById("selectOrden");

  selectOrden.addEventListener("change", async () => {
    const selectedValue = selectOrden.value;

    switch (selectedValue) {
      case "1":
        getData().then((results) => {
          clientes = results;

          // Función de comparación para ordenar alfabéticamente, colocando "Sin nombre" al final
          const compareAlfabeticamente = (a, b) => {
            const nombreClienteA = a.nombre_cliente ? a.nombre_cliente.toLowerCase() : "sin nombre";
            const nombreClienteB = b.nombre_cliente ? b.nombre_cliente.toLowerCase() : "sin nombre";

            if (nombreClienteA === "sin nombre" && nombreClienteB === "sin nombre") {
              return 0; // Si ambos son "sin nombre", no cambian su orden relativo
            } else if (nombreClienteA === "sin nombre") {
              return 1; // Si a es "sin nombre", a va al final
            } else if (nombreClienteB === "sin nombre") {
              return -1; // Si b es "sin nombre", b va al final
            } else {
              return nombreClienteA.localeCompare(nombreClienteB);
            }
          };

          const clientesOrdenadosAlfabeticamente = clientes.sort(compareAlfabeticamente);

          updateTableBody(clientesOrdenadosAlfabeticamente);
        });
        break;

      case "2":
        getData().then((results) => {
          clientes = results;

          // Función de comparación para ordenar por número de carnet
          const compareByCarnet = (a, b) => {
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
          };

          const clientesOrdenadosPorCarnet = clientes.sort(compareByCarnet);

          updateTableBody(clientesOrdenadosPorCarnet);
        });
        break;
      case "3":
        getData().then((results) => {
          ventas = results;
        
          // Función de comparación para ordenar por total de compra de menor a mayor
          const compareByTotalCompra = (a, b) => {
            return a.precio - b.precio;
          };
        
          const ventasOrdenadasPorTotalCompra = ventas.sort(compareByTotalCompra);
        
          updateTableBody(ventasOrdenadasPorTotalCompra);
        });
        
        break;
      case "4":
        getData().then((results) => {
          clientes = results;

          // Función de comparación para ordenar por ID de menor a mayor
          const compareById = (a, b) => {
            return a.id_cliente - b.id_cliente;
          };

          const clientesOrdenadosPorId = clientes.sort(compareById);

          updateTableBody(clientesOrdenadosPorId);
        
        });
        break;

      // Puedes agregar más casos según tus necesidades de ordenamiento en el futuro
      default:
        // Manejo de un valor no reconocido
        break;
    }
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
    const nombreCliente = cliente.nombre_cliente ? cliente.nombre_cliente : "Sin nombre";

    tbody.innerHTML += `
      <tr>
        <td>${cliente.id_cliente}</td>
        <td>${nombreCliente}</td>
        <td>${cliente.carnet}</td>
        <td>${cliente.total_gastado}</td>
      </tr>
    `;
  });
};

