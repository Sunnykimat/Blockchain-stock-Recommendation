// ─────────────────────────────────────────────
//  App.jsx – Root component with React Router & AuthContext
// ─────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import SearchStock from "./pages/SearchStock";
import Recommendations from "./pages/Recommendations";
import BlockchainVerify from "./pages/BlockchainVerify";
import History from "./pages/History";
import Settings from "./pages/Settings";
import AppLayout from "./components/AppLayout";
import { fetchCurrentUser, logoutUser } from "./services/api";

export const AuthContext = React.createContext(null);

function ProtectedLayout({ isAuthenticated }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <AppLayout />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("ss_token")
  );

  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("ss_user");
    return cached ? JSON.parse(cached) : null;
  });

  // Fetch full user identity on mount if token exists
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser().then((userData) => {
        if (userData) {
          setUser(userData);
          localStorage.setItem("ss_user", JSON.stringify(userData));
        } else {
          setIsAuthenticated(false);
        }
      });
    }
  }, [isAuthenticated]);

  const login = (token, userData) => {
    localStorage.setItem("ss_token", token);
    if (userData) {
      localStorage.setItem("ss_user", JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem("ss_token");
    localStorage.removeItem("ss_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem("ss_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes wrapped in AppLayout */}
          <Route
            path="/"
            element={<ProtectedLayout isAuthenticated={isAuthenticated} />}
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<SearchStock />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="blockchain" element={<BlockchainVerify />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
