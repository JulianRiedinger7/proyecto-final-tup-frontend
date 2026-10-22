import "./HomePage.css";
import logo from "@/assets/CircuitoVivoLogo.png";

export function HomePage() {
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={logo} className="base" width="170" height="179" alt="" />
        </div>
        <div>
          <h1>Circuito Vivo</h1>
          <p>Conectá con la música, viví el show</p>
        </div>
        <div className="flex flex-row gap-3 justify-center">
          <button type="button" className="sign-log">
            Registrate
          </button>
          <button type="button" className="sign-log">
            Ingresá
          </button>
        </div>
      </section>

      <div className="ticks"></div>
    </>
  );
}
