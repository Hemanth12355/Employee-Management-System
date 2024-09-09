import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import AdminDashboard from './pages/Admin Dashboard';
import SuperAdminDashboard from './pages/Super Admin Dashboard';
import CompanyDashboard from './pages/Company Dashboard';
import EmployeeDashboard from './pages/Employee Dashboard';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="super-admin" element={<SuperAdminDashboard />} />
      <Route path="company" element={<CompanyDashboard />} />
      <Route path="employee" element={<EmployeeDashboard />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
