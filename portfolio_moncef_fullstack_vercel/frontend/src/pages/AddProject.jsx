import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { apiFetch } from '../utils/api.js';

export default function AddProject() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    description: '',
    technologies: '',
    feeling: ''
  });
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('Création du projet...');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      images.forEach((image) => formData.append('images', image));

      const data = await apiFetch('/api/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      setStatus('Projet ajouté. Redirection...');
      window.dispatchEvent(new Event('projects-updated'));
      navigate(`/${data.id}`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="add-project-page page-enter">
      <div className="add-project-card">
        <p className="eyebrow">Administration</p>
        <h1>Ajouter un projet</h1>
        <p className="login-intro">
          Remplis le formulaire pour créer un nouveau projet. Il sera ajouté automatiquement dans le header
          et dans la section projets de l’accueil.
        </p>

        <form className="project-form" onSubmit={handleSubmit}>
          <label>
            Nom du projet
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Exemple : Projet météo"
              required
            />
          </label>

          <label>
            Sous-titre
            <input
              type="text"
              value={form.subtitle}
              onChange={(event) => updateField('subtitle', event.target.value)}
              placeholder="Exemple : Application React avec API"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Décris le but du projet, les fonctionnalités et le contexte."
              rows="6"
              required
            />
          </label>

          <label>
            Technologies utilisées
            <textarea
              value={form.technologies}
              onChange={(event) => updateField('technologies', event.target.value)}
              placeholder="React, Node.js, Express, MongoDB..."
              rows="4"
              required
            />
          </label>

          <label>
            Ressenti
            <textarea
              value={form.feeling}
              onChange={(event) => updateField('feeling', event.target.value)}
              placeholder="Explique ce que tu as appris et les difficultés rencontrées."
              rows="5"
              required
            />
          </label>

          <label className="file-input-label large">
            Photo du projet
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setImages(Array.from(event.target.files || []))}
            />
            <span>{images.length ? `${images.length} image(s) sélectionnée(s)` : 'Tu peux ajouter une ou plusieurs images.'}</span>
          </label>

          {status && <p className="save-status inline-status">{status}</p>}

          <button className="button primary form-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le projet'}
          </button>
        </form>
      </div>
    </section>
  );
}
