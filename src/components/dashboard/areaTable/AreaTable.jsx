import React, { useEffect, useState } from "react";
import AreaTableAction from "./AreaTableAction";
import "./AreaTable.scss";
import axiosInstance from '../../../config/AxiosInstance';  // Importar la instancia de Axios

// Encabezados de la tabla
const TABLE_HEADS = [
  "Nombre",
  "Apellido",
  "Email",
  "",
];

const AreaTable = () => {
  const [tableData, setTableData] = useState([]);  // Estado para los datos de la tabla
  const [loading, setLoading] = useState(true);  // Estado para la carga de datos

  // useEffect para cargar datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/users');  // Realiza la solicitud al endpoint 
        const data = response.data;  // Acceder directamente a response.data
        setTableData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);  // El array vacío asegura que esto solo se ejecute una vez al montar el componente

  return (
    <section className="content-area-table">
      <div className="data-table-info">
        <h4 className="data-table-title"></h4>
      </div>
      <div className="data-table-diagram">
        {loading ? (  // Muestra un mensaje de carga mientras se cargan los datos
          <p> Cargando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                {TABLE_HEADS?.map((th, index) => (
                  <th key={index}>{th}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData?.map((dataItem) => (  // Usa los datos cargados en lugar de los estáticos
                <tr key={dataItem.id}>
                  <td>{dataItem.nombre}</td>
                  <td>{dataItem.apellido}</td>
                  <td>{dataItem.email}</td>
                  <td className="dt-cell-action">
                    <AreaTableAction />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AreaTable;
