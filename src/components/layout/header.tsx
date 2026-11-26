import { Link, NavLink } from "react-router";
import logo from "@/assets/logosolo.png";
import "./header.css";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header">
      <Link to="/" className="header-brand">
        <img src={logo} alt="Circuito Vivo" className="header-logo" />
        <span>Circuito Vivo</span>
      </Link>

      <div className="header-right">
        <nav className="header-nav">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/eventos">Cartelera</NavLink>
          {!user && (
            <>
              <NavLink to="/login">Ingreso</NavLink>
              <NavLink to="/registro">Registrate</NavLink>
            </>
          )}
        </nav>

        {user && (
          <div className="header-user-row">
            <span> {user.nombre}</span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
