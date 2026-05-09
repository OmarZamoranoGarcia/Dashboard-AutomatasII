import "./LogoutButton.css"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function LogoutButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    }

    return (
        <button className="logout_button" onClick={handleLogout}>
            Cerrar Sesión
        </button>
    )
}
