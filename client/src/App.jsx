import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Discover from "./pages/Discover";
import Login from "./pages/Login";
import MyShelf from "./pages/MyShelf";
import BookDetail from "./pages/BookDetail";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-shelf" element={<MyShelf />} />
          <Route path="/shelf/:shelfItemId" element={<BookDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
