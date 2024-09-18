import React from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../../../../screens/farm/Finca2.scss';

const AllotmentTable = ({ lands, onAddLote, onEditLote, onDeleteLote, onViewCrops, onSelectAllotment, selectedAllotment }) => {

  // Estilos en línea para el botón
  const buttonStyle = {
    backgroundColor: '#f3f7fe',
    color: '#14B814',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    width: '100px',
    height: '45px',
    transition: '0.3s',
  };

  const buttonHoverStyle = {
    backgroundColor: '#14B814',
    boxShadow: '0 0 0 5px rgba(20, 184, 20, 0.4)',  // Un verde más claro y con transparencia
    color: '#fff',
  };

  return (
    <div className="lote-table-container">
      <div className="header">
        <button onClick={onAddLote} className="add-lote-btn">
          <AddCircleIcon />
        </button>
      </div>
      <hr className="separator" />
      <table className="lote-table">
        <thead>
          <tr>
            <th>Cultivos</th>
            <th>Nombre del lote</th>
            <th>Latitud</th>
            <th>Longitud</th>
            <th>Área</th>
            <th>Unidad de área</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lands.length > 0 ? (
            lands.map((lote, index) => (
              <tr 
                key={index} 
                onClick={() => onSelectAllotment(lote)} // Seleccionar el lote cuando se hace clic en una fila
                style={{
                  backgroundColor: selectedAllotment && selectedAllotment.id === lote.id ? '#f0f8ff' : 'transparent', // Resaltar el lote seleccionado
                  cursor: 'pointer'
                }}
              >
                <td>
                  <button
                    onClick={onViewCrops}
                    style={buttonStyle}
                    onMouseEnter={(e) => {
                      Object.assign(e.target.style, buttonHoverStyle);
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.target.style, buttonStyle);
                    }}
                  >
                    Gestionar Cultivo
                  </button>
                </td>
                <td>{lote.nombre}</td>
                <td>{lote.latitud}</td>
                <td>{lote.longitud}</td>
                <td>{lote.area}</td>
                <td>{lote.unidad_area ? lote.unidad_area.unidad : 'Sin unidad'}</td>
                <td>
                  <button onClick={(e) => { e.stopPropagation(); onEditLote(lote); }}>
                    <EditIcon style={{ color: '#007BFF' }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteLote(lote); }}>
                    <DeleteIcon style={{ color: '#FF4D4F' }} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No hay lotes disponibles. Agrega un nuevo lote.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllotmentTable;