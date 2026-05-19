import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { apiFetch } from '../utils/api.js';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function loadProjects() {
      try {
        const data = await apiFetch('/api/projects');
        if (!ignore) {
          setProjects(data);
        }
      } catch {
        if (!ignore) {
          setProjects([
            { id: 'projet-1', title: 'Projet 1' },
            { id: 'projet-2', title: 'Projet 2' }
          ]);
        }
      }
    }

    loadProjects();
    window.addEventListener('projects-updated', loadProjects);

    return () => {
      ignore = true;
      window.removeEventListener('projects-updated', loadProjects);
    };
  }, []);

  function handleAuthClick() {
    if (isAuthenticated) {
      logout();
      navigate('/');
      return;
    }

    navigate('/login');
  }

  return (
    <header className="header">
      <NavLink to="/" className="logo" aria-label="Retour à la page d'accueil">
        Portfolio de Moncef
      </NavLink>

      <div className="header-right">
        <nav className="navigation" aria-label="Navigation principale">
          <NavLink to="/" end>Accueil</NavLink>
          <NavLink to="/a-propos">À propos</NavLink>
          <NavLink to="/me-contacter">Me contacter</NavLink>
          {projects.map((project) => (
            <NavLink key={project.id} to={`/${project.id}`}>{project.title}</NavLink>
          ))}
          {isAuthenticated && <NavLink to="/ajouter-projet">Ajouter un projet</NavLink>}
        </nav>

        <button className="auth-button" type="button" onClick={handleAuthClick}>
          {isAuthenticated ? 'Se déconnecter' : 'Se connecter'}
        </button>
      </div>
    </header>
  );
}
