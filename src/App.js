import { Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/Login';
import SuperAdminDashboard from './pages/Super Admin Dashboard';
import AdminDashboard from './pages/Admin Dashboard';
import EmployeeDashboard from './pages/Employee Dashboard';
import CompanyDashboard from './pages/Company Dashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="*" element={<LoginPage />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/company" element={<CompanyDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
