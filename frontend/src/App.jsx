import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import UserDashboard from './pages/UserDashboard';
import PGDetails from './pages/PGDetails';
import DonorDashboard from './pages/DonorDashboard';
import About from './pages/About';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/pg/:id" element={<PGDetails />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/donor-dashboard" element={<DonorDashboard />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" theme="colored" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
