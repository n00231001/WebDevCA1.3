import { Routes, Route } from "react-router";
import AppLayout from "@/components/AppLayout";
import FilesPage from "@/pages/FilesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AccountPage from "@/pages/AccountPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Which page to show for each URL
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* These pages need a logged in user, and share the header in AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<FilesPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
