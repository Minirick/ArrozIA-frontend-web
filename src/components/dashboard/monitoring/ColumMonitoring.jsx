import React, { useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import MonitoringCard from "./MonitoringCard";
import DeleteModal from "../modal/DeleteModal"; // Modal de eliminación
import SuccessModal from "../modal/SuccessModal"; // Modal de éxito
import axiosInstance from "../../../config/AxiosInstance";
import styled from "styled-components";

const localizer = momentLocalizer(moment);

// Estilo para hacer que el contenedor ocupe toda la altura
const MonitoringContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MonitoringCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  flex-grow: 1; /* Permite que este contenedor crezca según el espacio disponible */
  overflow-y: auto; /* Añade scroll si hay muchas cards */
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }

  .button__text {
    margin-right: 10px;
  }

  .button__icon svg {
    width: 24px;
    height: 24px;
  }
`;

const CalendarWrapper = styled.div`
  flex-grow: 2; /* Permite que el calendario ocupe el espacio necesario */
  margin-top: 20px;
`;

const ColumMonitoring = ({ selectedCrop, monitorings, onOpenModal, refreshMonitorings }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [monitoringToDelete, setMonitoringToDelete] = useState(null);

  // Abre el modal de confirmación de eliminación
  const handleDeleteClick = (monitoring) => {
    setMonitoringToDelete(monitoring);
    setIsDeleteModalOpen(true);
  };

  // Cierra el modal de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMonitoringToDelete(null);
  };

  // Maneja la eliminación del monitoreo
  const handleDeleteMonitoring = async (id) => {
    try {
      await axiosInstance.delete(`/monitoring/${id}`);
      closeDeleteModal(); // Cierra el modal de confirmación de eliminación
      setShowSuccessModal(true); // Muestra el modal de éxito
      refreshMonitorings(); // Actualiza la lista de monitoreos
    } catch (error) {
      console.error("Error al eliminar el monitoreo:", error);
    }
  };

  // Cierra el modal de éxito
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  // Eventos para el calendario
  const events = monitorings.map((monitoring) => ({
    title: monitoring.tipo,
    start: new Date(monitoring.fechaInicio),
    end: new Date(monitoring.fechaFin),
  }));

  return (
    <MonitoringContainer>
      {selectedCrop ? (
        <>
          <Header>
            <h2>Monitoreos para {selectedCrop.cropName}</h2>
            <AddButton onClick={onOpenModal}>
              <span className="button__text">Agregar</span>
              <span className="button__icon">
                <svg
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="12" x2="12" y1="5" y2="19"></line>
                  <line x1="5" x2="19" y1="12" y2="12"></line>
                </svg>
              </span>
            </AddButton>
          </Header>
          
          <MonitoringCardsContainer>
            {monitorings.length > 0 ? (
              monitorings.map((monitoring) => (
                <MonitoringCard
                  key={monitoring.id}
                  monitoring={monitoring}
                  onEdit={refreshMonitorings}
                  onDelete={() => handleDeleteClick(monitoring)}
                />
              ))
            ) : (
              <p>No hay monitoreos disponibles.</p>
            )}
          </MonitoringCardsContainer>

          <CalendarWrapper>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%", width: "100%" }}
            />
          </CalendarWrapper>
        </>
      ) : (
        <p>Seleccione un cultivo para ver los monitoreos.</p>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && monitoringToDelete && (
        <DeleteModal
          show={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={() => handleDeleteMonitoring(monitoringToDelete.id)}
          title="Eliminar Monitoreo"
          message="¿Estás seguro de que deseas eliminar este monitoreo?"
          cancelText="Cancelar"
          confirmText="Eliminar"
        />
      )}

      {/* Modal de éxito de eliminación */}
      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          onClose={closeSuccessModal}
          message="¡Monitoreo eliminado exitosamente!"
        />
      )}
    </MonitoringContainer>
  );
};

export default ColumMonitoring;
