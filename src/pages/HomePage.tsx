import logo from "@/assets/CircuitoVivoLogo.png";

export function HomePage() {
  return (
    <div className="flex flex-col w-full relative overflow-hidden py-10 px-gutter-mobile items-center justify-between min-h-[580px] ">
      {/* Auras de fondo */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-tertiary-container/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-48 bg-secondary-container/25 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-space-sm">
        <div className="relative flex items-center justify-center mb-space-lg">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/40 via-tertiary/20 to-secondary-container/40 rounded-full blur-2xl scale-125 animate-pulse" />
          <div className="relative p-space-xs rounded-full bg-surface-container-low/60 backdrop-blur-sm shadow-xxl">
            <img
              src={logo}
              alt="Circuito Vivo"
              className="w-[170px] h-[179px] object-contain drop-shadow-[0_0_100px_rgba(1,1,1,1)] select-none transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        <h1 className="font-headline-xl-mobile text-5xl md:text-7xl leading-tight tracking-tight font-bold !text-white">
          Circuito Vivo
        </h1>
        <p>Conectá con la música, viví el show</p>
      </div>
    </div>
  );
}
