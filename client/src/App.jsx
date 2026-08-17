import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Discover from "./pages/Discover";
import Login from "./pages/Login";
import MyShelf from "./pages/MyShelf";
import BookDetail from "./pages/BookDetail";
import Reading from "./pages/Reading";
import Statistics from "./pages/Statistics";
import Register from "./pages/Register";
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
          <Route path="/reading" element={<Reading />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
