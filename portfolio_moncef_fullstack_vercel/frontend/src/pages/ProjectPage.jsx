import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { apiFetch } from '../utils/api.js';

const defaultContent = {
  id: 'projet-1',
  title: 'Projet',
  name: 'Projet',
  subtitle: 'Projet du portfolio.',
  coverImage: '/assets/images/screen-projet-1.svg',
  images: ['/assets/images/screen-projet-1.svg'],
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Décris ici l’objectif du projet, le contexte, les fonctionnalités principales et ce que l’utilisateur peut faire sur le site.',
  technologies:
    'HTML, CSS, JavaScript, React. Tu peux remplacer cette liste par les vraies technologies utilisées pour ton projet.',
  feeling:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Explique ici ce que tu as appris, les difficultés rencontrées et ce que tu améliorerais avec plus de temps.'
};

const fieldLabels = {
  description: 'Description',
  technologies: 'Technologies utilisées',
  feeling: 'Ressenti'
};

export default function ProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [content, setContent] = useState(defaultContent);
  const [draft, setDraft] = useState(defaultContent);
  const [editingField, setEditingField] = useState(null);
  const [status, setStatus] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isDeletingImages, setIsDeletingImages] = useState(false);

  const carouselImages = useMemo(() => {
    const images = content.images?.length ? content.images : [content.coverImage];
    return images.filter(Boolean);
  }, [content]);

  useEffect(() => {
    let ignore = false;

    async function loadProject() {
      try {
        const data = await apiFetch(`/api/projects/${projectId}`);

        if (!ignore) {
          setContent(data);
          setDraft(data);
          setActiveImageIndex(0);
          setImagesToDelete([]);
        }
      } catch {
        if (!ignore) {
          setContent(defaultContent);
          setDraft(defaultContent);
        }
      }
    }

    loadProject();
    return () => {
      ignore = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!status || status === 'Enregistrement...' || status === 'Ajout des images...' || status === 'Suppression du projet...' || status === 'Suppression des images...') {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setStatus('');
    }, 10000);

    return () => window.clearTimeout(timeout);
  }, [status]);

  useEffect(() => {
    if (activeImageIndex > carouselImages.length - 1) {
      setActiveImageIndex(Math.max(carouselImages.length - 1, 0));
    }
  }, [activeImageIndex, carouselImages.length]);

  function startEditing(field) {
    setEditingField(field);
    setDraft(content);
    setStatus('');
  }

  function cancelEditing() {
    setEditingField(null);
    setDraft(content);
    setStatus('');
  }

  function toggleImageSelection(image) {
    setImagesToDelete((current) => (
      current.includes(image)
        ? current.filter((selectedImage) => selectedImage !== image)
        : [...current, image]
    ));
  }

  async function saveField(field) {
    setStatus('Enregistrement...');

    try {
      const data = await apiFetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: draft[field] })
      });

      setContent(data);
      setDraft(data);
      setEditingField(null);
      setStatus('Modification enregistrée.');
      window.dispatchEvent(new Event('projects-updated'));
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function uploadImages(event) {
    event.preventDefault();

    if (!selectedImages.length) {
      setStatus('Choisis au moins une image avant d’enregistrer.');
      return;
    }

    setIsUploading(true);
    setStatus('Ajout des images...');

    try {
      const formData = new FormData();
      selectedImages.forEach((image) => formData.append('images', image));

      const data = await apiFetch(`/api/projects/${projectId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      setContent(data);
      setDraft(data);
      setSelectedImages([]);
      event.target.reset();
      setActiveImageIndex((data.images?.length || 1) - 1);
      setStatus('Images ajoutées au carrousel.');
      window.dispatchEvent(new Event('projects-updated'));
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteSelectedImages() {
    if (!imagesToDelete.length) {
      setStatus('Sélectionne au moins une image à supprimer.');
      return;
    }

    setIsDeletingImages(true);
    setStatus('Suppression des images...');

    try {
      const data = await apiFetch(`/api/projects/${projectId}/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ images: imagesToDelete })
      });

      setContent(data);
      setDraft(data);
      setImagesToDelete([]);
      setActiveImageIndex(0);
      setStatus('Image(s) supprimée(s).');
      window.dispatchEvent(new Event('projects-updated'));
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsDeletingImages(false);
    }
  }

  async function deleteProject() {
    const confirmed = window.confirm(`Supprimer définitivement le projet "${content.name}" ?`);

    if (!confirmed) {
      return;
    }

    setIsDeletingProject(true);
    setStatus('Suppression du projet...');

    try {
      await apiFetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      window.dispatchEvent(new Event('projects-updated'));
      navigate('/');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsDeletingProject(false);
    }
  }

  function previousImage() {
    setActiveImageIndex((current) => (current === 0 ? carouselImages.length - 1 : current - 1));
  }

  function nextImage() {
    setActiveImageIndex((current) => (current === carouselImages.length - 1 ? 0 : current + 1));
  }

  return (
    <article className="project-page page-enter">
      <section className="project-hero">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>{content.title} - {content.name}</h1>
          <p>{content.subtitle}</p>
          {isAuthenticated && (
            <button className="danger-button" type="button" onClick={deleteProject} disabled={isDeletingProject}>
              {isDeletingProject ? 'Suppression...' : 'Supprimer ce projet'}
            </button>
          )}
        </div>

        <div className="carousel" aria-label={`Carrousel d’images pour ${content.name}`}>
          <img src={carouselImages[activeImageIndex]} alt={`Capture ${activeImageIndex + 1} du projet ${content.name}`} />
          {carouselImages.length > 1 && (
            <div className="carousel-controls">
              <button type="button" onClick={previousImage} aria-label="Image précédente">‹</button>
              <span>{activeImageIndex + 1} / {carouselImages.length}</span>
              <button type="button" onClick={nextImage} aria-label="Image suivante">›</button>
            </div>
          )}
        </div>
      </section>

      {status && <p className="save-status">{status}</p>}

      {isAuthenticated && (
        <section className="project-admin-grid">
          <form className="image-upload-card" onSubmit={uploadImages}>
            <div>
              <h2>Ajouter des images au projet</h2>
              <p>Les images ajoutées apparaîtront automatiquement dans le carrousel.</p>
            </div>
            <label className="file-input-label">
              Choisir des images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setSelectedImages(Array.from(event.target.files || []))}
              />
            </label>
            <button className="button primary compact" type="submit" disabled={isUploading}>
              {isUploading ? 'Ajout en cours...' : 'Ajouter au carrousel'}
            </button>
          </form>

          <div className="image-delete-card">
            <div>
              <h2>Supprimer des images</h2>
              <p>Sélectionne une ou plusieurs images, puis supprime-les du carrousel.</p>
            </div>

            <div className="image-delete-grid">
              {carouselImages.map((image, index) => (
                <label className={`image-delete-item ${imagesToDelete.includes(image) ? 'selected' : ''}`} key={`${image}-${index}`}>
                  <input
                    type="checkbox"
                    checked={imagesToDelete.includes(image)}
                    onChange={() => toggleImageSelection(image)}
                  />
                  <img src={image} alt={`Image ${index + 1} du projet ${content.name}`} />
                  <span>Image {index + 1}</span>
                </label>
              ))}
            </div>

            <button className="danger-button compact-danger" type="button" onClick={deleteSelectedImages} disabled={isDeletingImages}>
              {isDeletingImages ? 'Suppression...' : 'Supprimer la sélection'}
            </button>
          </div>
        </section>
      )}

      <section className="project-details">
        {Object.entries(fieldLabels).map(([field, label]) => (
          <div className="detail-card" key={field}>
            <div className="detail-card-header">
              <h2>{label}</h2>
              {isAuthenticated && editingField !== field && (
                <button className="edit-button" type="button" onClick={() => startEditing(field)}>
                  Modifier
                </button>
              )}
            </div>

            {editingField === field ? (
              <div className="edit-area">
                <textarea
                  value={draft[field]}
                  onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                  rows="8"
                />
                <div className="edit-actions">
                  <button className="button primary compact" type="button" onClick={() => saveField(field)}>
                    Enregistrer
                  </button>
                  <button className="button secondary compact" type="button" onClick={cancelEditing}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p>{content[field]}</p>
            )}
          </div>
        ))}
      </section>
    </article>
  );
}
