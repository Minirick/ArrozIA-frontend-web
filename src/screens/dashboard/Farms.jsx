import React, { useContext, useState, useEffect } from "react";
import Header from "../../components/dashboard/Header";
import { AuthContext } from "../../config/AuthProvider";
import FarmMain from "../../components/dashboard/farms/FarmMain";
import AllotmentMain from "./Lands";
import "../../css/Farms.scss";
import { Navigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material"; 

const Farms = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [selectedFarm, setSelectedFarm] = useState(() => {
    const savedFarm = localStorage.getItem("selectedFarm");
    return savedFarm ? JSON.parse(savedFarm) : null;
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false); 

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const welcomeShown = localStorage.getItem("welcomeShown");

    // Verificar valores en consola
    console.log("Token:", token);
    console.log("Bienvenida mostrada antes:", welcomeShown);

    if (token && !welcomeShown) {
      setShowSnackbar(true);
      localStorage.setItem("welcomeShown", "true");
      console.log("Bienvenida mostrada ahora:", localStorage.getItem("welcomeShown"));
    }
  }, []);

  // Guardar selectedFarm en el almacenamiento local para que persista entre cargas de página
  useEffect(() => {
    if (selectedFarm) {
      localStorage.setItem("selectedFarm", JSON.stringify(selectedFarm));
    }
  }, [selectedFarm]);

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="content-area">
      <Header title="Fincas" />
      <div className="layout">
        <AllotmentMain selectedFarm={selectedFarm} isDarkMode={isDarkMode} />
        <FarmMain
          selectedFarm={selectedFarm}
          setSelectedFarm={setSelectedFarm}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Snackbar para mostrar el mensaje de bienvenida */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000} // Mostrar por 3 segundos
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} 
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          ¡Iniciaste sesión con éxito, bienvenido!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Farms;
