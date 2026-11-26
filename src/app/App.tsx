import { Route, Routes } from "react-router";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RegisterPage } from "../pages/RegisterPage";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoginPage } from "@/pages/LoginPage";
import { TicketsPage } from "@/pages/TicketsPage";
import { TicketDetailPage } from "@/pages/TicketDetailPage";
import { EventosPage } from "@/pages/EventosPage";
import { EventoDetailPage, EventoFormPage } from "@/pages/EventoPages";
import { PerfilEspectadorPage } from "@/pages/PerfilEspectadorPage";

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="eventos" element={<EventosPage />} />
        <Route path="eventos/nuevo" element={<EventoFormPage />} />
        <Route path="eventos/:eventoId" element={<EventoDetailPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
        <Route path="perfil" element={<PerfilEspectadorPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
