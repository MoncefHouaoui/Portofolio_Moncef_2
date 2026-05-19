import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import AddProject from './pages/AddProject.jsx';
import Contact from './pages/Contact.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="a-propos" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="me-contacter" element={<Contact />} />
            <Route path="ajouter-projet" element={<AddProject />} />
            <Route path=":projectId" element={<ProjectPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
