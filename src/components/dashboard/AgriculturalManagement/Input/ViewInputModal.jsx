import React from "react";
import ReactDOM from "react-dom";
import "../../../../css/ViewModal.scss"; // Asegúrate de importar tu SCSS

const ViewInsumoModal = ({ show, closeModal, insumo }) => {
  if (!show || !insumo) return null;

  // Verifica que `insumo` esté definido y tiene los valores correctos
  const { nombre, unidad_id, costo_unitario, descripcion } = insumo;

  // Utiliza ReactDOM.createPortal para renderizar el modal en el body
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeModal}>×</button>
        <h2 className="title">Detalles del Insumo</h2>
        <div className="details">
          <p><strong>Nombre:</strong> {nombre}</p>
          <p><strong>Unidad de Medida (ID):</strong> {unidad_id}</p>
          <p><strong>Costo Unitario:</strong> {costo_unitario}</p>
          <p><strong>Descripción:</strong> {descripcion || "Sin descripción"}</p>
        </div>
      </div>
    </div>,
    document.body // Renderiza el modal directamente en el body
  );
};

export default ViewInsumoModal;