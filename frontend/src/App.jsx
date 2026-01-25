import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./auth/Login";
import Register from "./auth/Register";
import PasswordReset from "./auth/PasswordReset";
import PasswordResetConfirm from "./auth/PasswordResetConfirm";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatLayout from "./chat/ChatLayout";

// ✅ Footer pages
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 🔓 Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />

          {/* 🔁 Root redirect */}
          <Route path="/" element={<Navigate to="/chat" replace />} />

          {/* 🔐 Protected Chat Route */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
          />

          {/* ❌ Fallback (optional but recommended) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}