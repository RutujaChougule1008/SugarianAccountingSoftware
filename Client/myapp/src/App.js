import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import routes from './Pages/RouterConfig';
import Navbar from './Pages/Navbar/Navbar';
import ComponentUtility from "./Components/CompoentsConfig";
import LoginForm from './Pages/Login/Login';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const location = useLocation();
  const { pathname } = location;

  const hideNavbarPaths = ['/', '/company-list'];

  const isAuthenticated = sessionStorage.getItem('username') !== null;

  return (
    <div className="App">

      {!hideNavbarPaths.includes(pathname) && <Navbar />}
      
      <Routes>

        <Route path="/" element={<LoginForm />} />

        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={<route.element />} />
        ))}
        
        {ComponentUtility.map((route, index) => (
          <Route 
            key={index} 
            path={route.path} 
            element={isAuthenticated ? <route.element /> : <Navigate to="/" />} 
          />
        ))}
      </Routes>
    </div>
  );
}

export default AppWrapper;
