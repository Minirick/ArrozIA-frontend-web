import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axiosInstance from "../../../config/AxiosInstance";
import SuccessModal from "../modal/SuccessModal";
import PropTypes from "prop-types";

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
  width: 600px;
  max-width: 90%;
  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.2);
  transform: translateZ(0);
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: translateY(-10px) scale(1.03) perspective(1000px);
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
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
  flex: 1;

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }

  input,
  select {
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
`;

const FormGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const Column = styled.div`
  flex: 1;
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

const NewUser = ({ closeModal, onSave = () => {} }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol_id: "",
    finca_id: "",
  });

  const [roles, setRoles] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchRolesAndFincas = async () => {
      try {
        const rolesResponse = await axiosInstance.get("/roles");
        setRoles(rolesResponse.data.roles || []);

        const fincasResponse = await axiosInstance.get("/farms");
        setFincas(fincasResponse.data || []);
      } catch (error) {
        console.error("Error fetching roles and fincas:", error);
        setErrorMessage("Error al cargar roles y fincas. Intente nuevamente.");
      }
    };

    fetchRolesAndFincas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setErrorMessage("");
  
      // Validar que todos los campos obligatorios estén llenos
      if (
        !formData.nombre ||
        !formData.apellido ||
        !formData.email ||
        !formData.password ||
        !formData.rol_id
      ) {
        throw new Error("Todos los campos son obligatorios.");
      }

      
  
      // Registrar el usuario
      const userResponse = await axiosInstance.post("/users/register", {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
      });
  
      const userId = userResponse.data.id;
  
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario.");
      }
  
      // Registrar el rol del usuario en /user-roles/register
      const roleResponse = await axiosInstance.post("/user-roles/register", {
        usuario_id: parseInt(userId, 10),
        rol_id: parseInt(formData.rol_id, 10),
      });
  
      if (roleResponse.status !== 200 && roleResponse.status !== 201) {
        throw new Error("Error al asignar el rol al usuario.");
      }
  
      // Si se selecciona una finca, establecer la relación usuario-finca-rol
      if (formData.finca_id) {
        const dataToSend = {
          usuario_id: parseInt(userId, 10),
          rol_id: parseInt(formData.rol_id, 10),
          finca_id: parseInt(formData.finca_id, 10),
        };
  
        if (isNaN(dataToSend.finca_id)) {
          throw new Error("La finca seleccionada no es válida.");
        }
  
        const farmResponse = await axiosInstance.post("/user-farm", dataToSend);
  
        if (farmResponse.status !== 200 && farmResponse.status !== 201) {
          throw new Error("Error al establecer la relación usuario-finca-rol.");
        }
      }
  
      // Mostrar el modal de éxito
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.message || "Error creando el usuario.");
    }
  };
  

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    closeModal();
    onSave(); // Safely call onSave
  };

  return (
    <>
      <ModalOverlay>
        <ModalContent>
          <CloseButton onClick={closeModal}>×</CloseButton>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Crear Usuario
          </h2>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <form onSubmit={handleSubmit}>
            <FormGrid>
              {/* First column: Nombre, Apellido, Email */}
              <Column>
                <InputGroup>
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    maxLength={50}
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <label>Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    maxLength={50}
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    maxLength={50}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </Column>

              {/* Second column: Contraseña, Finca, Rol */}
              <Column>
                <InputGroup>
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    maxLength={50}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <label>Finca</label>
                  <select
                    name="finca_id"
                    value={formData.finca_id}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione una finca</option>
                    {fincas.map((finca) => (
                      <option key={finca.id} value={finca.id}>
                        {finca.nombre}
                      </option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup>
                  <label>Rol</label>
                  <select
                    name="rol_id"
                    value={formData.rol_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </InputGroup>
              </Column>
            </FormGrid>
            <SubmitButton type="submit">Crear</SubmitButton>
          </form>
        </ModalContent>
      </ModalOverlay>
      {showSuccessModal && (
        <SuccessModal
          onClose={handleCloseSuccessModal}
          message="¡Usuario Creado!"
        />
      )}
    </>
  );
};

NewUser.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default NewUser;