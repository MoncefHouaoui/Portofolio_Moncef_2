import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api.js';

const fallbackProjects = [
  {
    id: 'projet-1',
    title: 'Projet 1',
    name: 'Kasa',
    coverImage: '/assets/images/screen-kasa.png',
    gradient: 'linear-gradient(135deg, rgba(124, 92, 255, 0.72), rgba(13, 16, 33, 0.82))'
  },
  {
    id: 'projet-2',
    title: 'Projet 2',
    name: 'Mon Vieux Grimoire',
    coverImage: '/assets/images/screen-grimoire.png',
    gradient: 'linear-gradient(135deg, rgba(0, 212, 255, 0.62), rgba(13, 16, 33, 0.86))'
  }
];

export default function Home() {
  const [projects, setProjects] = useState(fallbackProjects);

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
          setProjects(fallbackProjects);
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

  return (
    <>
      <section className="hero page-enter">
        <div className="hero-content">
          <p className="eyebrow">Développeur web en formation</p>
          <h1>Bienvenue sur mon portfolio</h1>
          <p>
            Je m’appelle Moncef. Ce portfolio présente mon parcours, mes projets et mon évolution
            dans le développement web. Passionné par la création d’interfaces modernes et par la logique
            backend, je cherche à mettre mes compétences au service de projets concrets et ambitieux.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/a-propos">Découvrir mon profil</Link>
            <Link className="button secondary" to={projects[0] ? `/${projects[0].id}` : '/projet-1'}>
              Voir mes projets
            </Link>
          </div>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="card-glow"></div>
          <p>HTML</p>
          <p>CSS</p>
          <p>JavaScript</p>
          <p>React</p>
        </div>
      </section>

      <section
        className="projects-split"
        style={{ gridTemplateColumns: `repeat(${Math.max(projects.length, 1)}, minmax(0, 1fr))` }}
      >
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/${project.id}`}
            className="project-tile"
            style={{
              backgroundImage: `${project.gradient}, url('${project.coverImage}')`
            }}
          >
            <span>{project.title}</span>
            <strong>{project.name}</strong>
            <small>Voir le détail du projet</small>
          </Link>
        ))}
      </section>
    </>
  );
}
