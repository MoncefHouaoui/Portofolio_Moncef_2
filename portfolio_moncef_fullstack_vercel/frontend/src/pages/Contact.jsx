import { useState } from 'react';
import { apiFetch } from '../utils/api.js';

export default function Contact() {
  const [formData, setFormData] = useState({ email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
  event.preventDefault();
  setStatus('');
  setError('');
  setIsLoading(true);

  try {
    const response = await fetch('https://formspree.io/f/mnjrjqgr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }),
    });

    if (!response.ok) {
      throw new Error("Impossible d’envoyer le message pour le moment.");
    }

    setStatus('Message envoyé avec succès.');
    setFormData({ email: '', subject: '', message: '' });
  } catch (err) {
    setError(err.message || 'Impossible d’envoyer le message pour le moment.');
  } finally {
    setIsLoading(false);
  }
}

  return (
    <section className="contact-page page-enter">
      <div className="contact-card">
        <p className="eyebrow">Contact</p>
        <h1>Me contacter</h1>
        <p className="contact-intro">
          Une question, une proposition ou une opportunité ? Tu peux m’envoyer un message directement depuis ce formulaire.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Adresse e-mail <span aria-hidden="true">*</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ton.email@exemple.fr"
              required
            />
          </label>

          <label>
            Objet
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Objet du message"
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Écris ton message ici..."
              rows="8"
              required
            />
          </label>

          {status && <p className="form-success">{status}</p>}
          {error && <p className="form-error">{error}</p>}

          <button className="button primary form-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </section>
  );
}
