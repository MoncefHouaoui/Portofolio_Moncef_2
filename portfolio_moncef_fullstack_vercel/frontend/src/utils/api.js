const API_URL = import.meta.env.VITE_API_URL || '';

export { API_URL };

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error('Impossible de contacter le backend. Lance le projet avec npm run dev depuis le dossier principal.');
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    const shortText = text.trim().slice(0, 80);
    throw new Error(
      shortText.startsWith('<!doctype') || shortText.startsWith('<html')
        ? 'Réponse non JSON reçue. Vérifie que le backend tourne bien sur http://localhost:3001 et que tu ouvres le frontend via http://localhost:5173.'
        : 'Réponse inattendue du serveur.'
    );
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Une erreur est survenue.');
  }

  return data;
}
