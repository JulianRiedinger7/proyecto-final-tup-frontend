import { Link, NavLink } from "react-router";
import logo from "@/assets/logosolo.png";
import "./header.css";

export function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-brand">
        <img src={logo} alt="Circuito Vivo" className="header-logo" />
        <span>Circuito Vivo</span>
      </Link>

      <nav className="header-nav">
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/login">Ingreso</NavLink>
        <NavLink to="/registro">Registrate</NavLink>
      </nav>
    </header>
  );
}
