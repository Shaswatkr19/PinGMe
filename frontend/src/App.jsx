// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatLayout from "./chat/ChatLayout";
import "./chat/ChatLayout.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}