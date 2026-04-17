import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History'; // <-- Add this import

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-netflix-dark text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/history" element={<History />} /> {/* <-- Add this route */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}