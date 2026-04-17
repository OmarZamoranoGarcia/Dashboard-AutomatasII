import "./LogoutButton.css"

export default function LogoutButton() {
    const handleLogout = () => {
        // TODO: Implementar lógica de logout cuando el login esté completo
        console.log("Logout clicked - lógica pendiente")
    }

    return (
        <button className="logout_button" onClick={handleLogout}>
            Cerrar Sesión
        </button>
    )
}
