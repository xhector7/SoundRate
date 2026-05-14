import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const { key } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!key) {
      setStatus("error");
      setMessage("No se encontró código de verificación");
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/registration/verify-email/`,
          { key }
        );
        setStatus("success");
        setMessage("¡Correo verificado exitosamente!");
      } catch (error) {
        setStatus("error");
        setMessage("Error al verificar el correo. El enlace puede haber expirado o ya fue usado.");
      }
    };

    verifyEmail();
  }, [key]);

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4">
      <div className="text-center">
        {status === "verifying" && (
          <>
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Verificando tu correo...</p>
          </>
        )}

        {status === "success" && (
          <>
            <p className="text-green-400 mb-4">{message}</p>
            <Link to="/login" className="text-primary underline">
              Ir al inicio de sesión
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-red-400 mb-4">{message}</p>
            <Link to="/register" className="text-primary underline">
              Volver a registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
}