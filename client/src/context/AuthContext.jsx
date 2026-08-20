import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [shelfBookIds, setShelfBookIds] = useState(new Set());

  const fetchShelf = async () => {
    const token = localStorage.getItem("shelflifeToken");

    if (!token) {
      setShelfBookIds(new Set());
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/shelf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const ids = new Set(
        (data.shelfItems || []).map((item) => item.GoogleBooksId),
      );

      setShelfBookIds(ids);
    } catch (err) {
      console.error("Fetch shelf error:", err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("shelflifeToken");
    const savedUser = localStorage.getItem("shelflifeUser");

    if (savedToken && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
        fetchShelf();
      } catch (err) {
        console.error("Unable to restore login session:", err);
        localStorage.removeItem("shelflifeToken");
        localStorage.removeItem("shelflifeUser");
      }
    }
  }, []);

  const login = (token, account) => {
    localStorage.setItem("shelflifeToken", token);
    localStorage.setItem("shelflifeUser", JSON.stringify(account));

    setCurrentUser(account);
    setIsLoggedIn(true);
    fetchShelf();
  };

  const logout = () => {
    localStorage.removeItem("shelflifeToken");
    localStorage.removeItem("shelflifeUser");

    setCurrentUser(null);
    setIsLoggedIn(false);
    setShelfBookIds(new Set());
  };

  const addToShelfIds = (googleBooksId) => {
    setShelfBookIds((prev) => new Set(prev).add(googleBooksId));
  };

  const removeFromShelfIds = (googleBooksId) => {
    setShelfBookIds((prev) => {
      const next = new Set(prev);
      next.delete(googleBooksId);
      return next;
    });
  };

  const value = {
    isLoggedIn,
    currentUser,
    shelfBookIds,
    fetchShelf,
    login,
    logout,
    addToShelfIds,
    removeFromShelfIds,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
