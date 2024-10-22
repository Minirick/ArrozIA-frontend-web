import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axiosInstance from "../../../../config/AxiosInstance";
import SuccessModal from "../../modal/SuccessModal";  // Importamos el modal de éxito

// Estilos de modal y elementos
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.2);
  transform: translateZ(0);
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: translateY(-10px) scale(1.03) perspective(1000px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #ff6b6b;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #ddd;
    box-sizing: border-box;
    font-size: 16px;
    transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;

    &:focus {
      box-shadow: 0px 0px 8px 2px rgba(39, 174, 96, 0.3);
      transform: translateY(-3px);
      outline: none;
    }
  }

  textarea {
    resize: vertical;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-family: "Roboto", sans-serif;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: #218838;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h2`
  text-align: center;
  font-size: 24px;
  margin-bottom: 30px;
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
`;

const EditInsumoModal = ({ show, closeModal, insumo, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: insumo?.nombre || "",
    unidad_id: insumo?.unidad_id || "",
    costo_unitario: insumo?.costo_unitario || "",
    descripcion: insumo?.descripcion || "",
  });

  const [unidades, setUnidades] = useState([]);  // Estado para guardar las unidades de medida
  const [showSuccessModal, setShowSuccessModal] = useState(false);  // Estado para mostrar el modal de éxito
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchInsumo = async () => {
      try {
        const response = await axiosInstance.get(`/input/${insumo.id}`);  // Solicitud GET a /input/{input_id}
        const fetchedInsumo = response.data;

        // Asignamos los datos obtenidos al estado
        setFormData({
          nombre: fetchedInsumo.nombre,
          unidad_id: fetchedInsumo.unidad.id,  // Usamos fetchedInsumo.unidad.id para establecer el ID de la unidad
          costo_unitario: fetchedInsumo.costo_unitario,
          descripcion: fetchedInsumo.descripcion,
        });
      } catch (error) {
        console.error("Error al obtener el insumo:", error);
        setErrorMessage("Error al cargar los datos del insumo.");
      }
    };

    const fetchUnidades = async () => {
      try {
        const response = await axiosInstance.get("/input_units");  // Ajustar la ruta según el backend
        setUnidades(response.data);  // Asignar los datos obtenidos al estado de unidades
      } catch (error) {
        console.error("Error al obtener las unidades de medida:", error);
        setErrorMessage("Error al cargar las unidades de medida.");
      }
    };

    if (insumo) {
      fetchInsumo();  // Llamamos a la función para obtener los datos del insumo
      fetchUnidades();  // Cargamos las unidades desde el backend
    }
  }, [insumo]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validación para el campo 'nombre' con límite de 100 caracteres
    if (name === "nombre" && value.length > 100) {
      setErrorMessage("El campo 'Nombre' no puede exceder los 100 caracteres.");
    } else {
      setFormData({ ...formData, [name]: value });
      setErrorMessage("");  // Limpiar el mensaje de error cuando es válido
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validar antes de enviar
    if (formData.nombre.length > 100) {
      setErrorMessage("No se puede enviar porque se superó el límite de 100 caracteres en el campo 'Nombre'.");
      return;
    }

    try {
      setErrorMessage("");
      // Realiza una solicitud PUT para actualizar el insumo
      await axiosInstance.put(`/update/input/${insumo.id}`, formData);
      console.log("Insumo actualizado correctamente");

      setShowSuccessModal(true);  // Mostrar el modal de éxito después de guardar
    } catch (error) {
      console.error("Error al editar el insumo:", error);
      setErrorMessage("Error inesperado al editar el insumo.");
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    closeModal(); // Cierra el modal de edición
    onSave(); // Actualiza la tabla de insumos sin cambiar de sección
  };

  return (
    <>
      {show && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}>×</CloseButton>
            <Title>Editar Insumo</Title>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            <form onSubmit={handleSubmit}>
              <InputGroup>
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <label>Unidad de Medida</label>
                <select
                  name="unidad_id"
                  value={formData.unidad_id}  // El valor será preseleccionado basado en el estado
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar Unidad</option>
                  {unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre}
                    </option>
                  ))}
                </select>
              </InputGroup>

              <InputGroup>
                <label>Costo Unitario</label>
                <input
                  type="number"
                  step="0.01"
                  name="costo_unitario"
                  value={formData.costo_unitario}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                />
              </InputGroup>

              <SubmitButton type="submit">Guardar Cambios</SubmitButton>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          onClose={handleCloseSuccessModal}
          message="¡Insumo editado exitosamente!"
        />
      )}
    </>
  );
};

export default EditInsumoModal;
