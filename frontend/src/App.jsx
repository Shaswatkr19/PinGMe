import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/login";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatLayout from "./chat/ChatLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Root redirects to chat */}
        <Route 
          path="/" 
          element={<Navigate to="/chat" replace />} 
        />

        {/* Main chat route */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}