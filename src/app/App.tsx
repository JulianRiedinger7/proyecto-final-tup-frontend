import { Route, Routes } from "react-router";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RegisterPage } from "../pages/RegisterPage";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoginPage } from "@/pages/LoginPage";
import { TicketsPage } from "@/pages/TicketsPage";

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="tickets" element={<TicketsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
