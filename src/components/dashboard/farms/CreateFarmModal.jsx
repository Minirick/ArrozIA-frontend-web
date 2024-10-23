import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axiosInstance from "../../../config/AxiosInstance";
import SuccessModal from "../modal/SuccessModal";
import MapsLeaflet from "./MapsLeaflet";
import { API_URL } from '../../../config/apiConfig'; // Asegúrate de que este sea correcto
import AsyncSelect from 'react-select/async';

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

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }

  input {
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

const SuggestionBox = styled.ul`
  list-style: none;
  background: white;
  border: 1px solid #ddd;
  max-height: 150px;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
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
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: #218838;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  }
`;
const NewFarm = ({ closeModal, addFarm }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    area_total: "",
    latitud: null,
    longitud: null,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCity, setSelectedCity] = useState(null); // Nuevo estado para la ciudad seleccionada
  const [initialOptions, setInitialOptions] = useState([]); // Estado para opciones iniciales

  useEffect(() => {
    const fetchInitialCities = async () => {
      try {
        const defaultQuery = "an"; // Cambia "an" por cualquier par de caracteres relevantes
        const response = await axiosInstance.get(`${API_URL}/City/search/${defaultQuery}`);
        const options = response.data.map((city) => ({
          value: city.id,
          label: city.name,
        }));
        setInitialOptions(options);
      } catch (error) {
        console.error("Error fetching initial cities:", error);
        setInitialOptions([]);
      }
    };
  
    fetchInitialCities();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const fetchCities = async (inputValue) => {
  if (!inputValue || inputValue.length < 2) {
    return [];
  }
  try {
    const response = await axiosInstance.get(`${API_URL}/City/search/${inputValue}`);
    const options = response.data.map((city) => ({
      value: city.id,
      label: city.name,
    }));
    return options;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

  

  const handleSelectCity = async (selectedOption) => {
    setSelectedCity(selectedOption);
    if (selectedOption) {
      const cityName = selectedOption.label;
      try {
        // Realiza una solicitud a Nominatim para obtener coordenadas
        const response = await axiosInstance.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}, Colombia&format=json`);
        const locationData = response.data[0]; // Toma el primer resultado
  
        if (locationData) {
          // Actualiza los datos del formulario
          setFormData({
            ...formData,
            ubicacion: cityName,
            latitud: locationData.lat,
            longitud: locationData.lon,
          });
        } else {
          console.error("No se encontraron coordenadas para la ciudad:", cityName);
        }
      } catch (error) {
        console.error("Error al obtener coordenadas por nombre de ciudad:", error);
      }
    } else {
      // Si se elimina la selección
      setFormData({
        ...formData,
        ubicacion: "",
        latitud: null,
        longitud: null,
      });
    }
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setErrorMessage("");


       // Convertir valores numéricos a números (area_total, latitud, longitud)
    const farmData = {
      ...formData,
      area_total: formData.area_total ? parseFloat(formData.area_total) : null,
      latitud: formData.latitud ? parseFloat(formData.latitud) : null,
      longitud: formData.longitud ? parseFloat(formData.longitud) : null,
    }

      const response = await axiosInstance.post("/register-farm", formData);
      setShowSuccessModal(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage("Error al crear la finca.");
      } else {
        setErrorMessage("Error inesperado al crear la finca.");
      }
    }
  };

  const handleCloseSuccessModal = async () => {
    setShowSuccessModal(false);
    await addFarm();
    closeModal();
  };

  return (
    <>
      <ModalOverlay>
        <ModalContent>
          <CloseButton onClick={closeModal}>×</CloseButton>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Crear Finca</h2>
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
                maxLength={50} // según BD es el tope
              />
            </InputGroup>
            <InputGroup>
              <label>Área Total (m²)</label>
              <input
                type="number"
                name="area_total"
                value={formData.area_total}
                onChange={handleChange}
                required // Campo obligatorio
                min={0}  // Evita valores negativos
              />
            </InputGroup>
            <InputGroup>
              <label>Municipio / Vereda</label>
              <AsyncSelect
                cacheOptions
                loadOptions={fetchCities}
                defaultOptions={true}
                onChange={handleSelectCity}
                placeholder="Selecciona Municipio / Vereda..."
                isClearable
                value={selectedCity}
                menuPortalTarget={document.body} // Añade esta línea
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: '10px',
                    padding: '2px',
                    borderColor: '#ddd',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#aaa',
                    },
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Asegura que el menú esté por encima
                }}
              />
            </InputGroup>
            {/* Mapa actualizado con la latitud y longitud del municipio seleccionado */}
            <MapsLeaflet formData={formData} setFormData={setFormData} />
            <SubmitButton type="submit">Crear</SubmitButton>
          </form>
        </ModalContent>
      </ModalOverlay>
      {showSuccessModal && (
        <SuccessModal message="¡Finca Creada!" onClose={handleCloseSuccessModal} />
      )}
    </>
  );
};

export default NewFarm;