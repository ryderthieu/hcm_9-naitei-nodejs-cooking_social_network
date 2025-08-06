import { Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login/Login";
import NotFound from "../pages/other/NotFound/NotFound";
import Feed from "../pages/main/Feed/Feed";
import Register from "../pages/auth/Register/Register";
import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Feed />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
