import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const IS_VERCEL = process.env.VERCEL === '1';
const SEED_DATA_FILE = join(__dirname, 'data', 'projects.json');
const DATA_FILE = IS_VERCEL ? join('/tmp', 'portfolio-moncef-projects.json') : SEED_DATA_FILE;
const UPLOAD_DIR = IS_VERCEL ? join('/tmp', 'portfolio-moncef-uploads') : join(__dirname, 'uploads');
const VALID_EMAIL = process.env.VALID_EMAIL;
const JWT_SECRET = process.env.JWT_SECRET;
const VALID_PASSWORD_HASH = await bcrypt.hash(process.env.VALID_PASSWORD, 10);

if (!existsSync(UPLOAD_DIR)) {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

if (!existsSync(DATA_FILE)) {
  const seedProjects = await readFile(SEED_DATA_FILE, 'utf-8');
  await writeFile(DATA_FILE, seedProjects, 'utf-8');
}

const storage = multer.diskStorage({
  destination: (request, file, callback) => callback(null, UPLOAD_DIR),
  filename: (request, file, callback) => {
    const cleanName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/-+/g, '-');
    callback(null, `${Date.now()}-${cleanName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (request, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
      return;
    }
    callback(new Error('Seules les images sont acceptées.'));
  },
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

async function readProjects() {
  const fileContent = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(fileContent);
}

async function writeProjects(projects) {
  await writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

function projectList(projects) {
  return Object.values(projects).sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return response.status(401).json({ message: 'Tu dois être connecté pour modifier ce projet.' });
  }
}



function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function smtpConfigReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendContactEmail({ email, subject, message }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const cleanSubject = subject?.trim() || 'Nouveau message depuis le portfolio';
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(cleanSubject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  await transporter.sendMail({
    from: `Portfolio de Moncef <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: cleanSubject,
    text: `Email de contact : ${email}\nObjet : ${cleanSubject}\n\nMessage :\n${message}`,
    html: `
      <h2>Nouveau message depuis le portfolio</h2>
      <p><strong>Email de contact :</strong> ${safeEmail}</p>
      <p><strong>Objet :</strong> ${safeSubject}</p>
      <p><strong>Message :</strong></p>
      <p>${safeMessage}</p>
    `
  });
}

function buildGradient(index) {
  const gradients = [
    'linear-gradient(135deg, rgba(124, 92, 255, 0.72), rgba(13, 16, 33, 0.82))',
    'linear-gradient(135deg, rgba(0, 212, 255, 0.62), rgba(13, 16, 33, 0.86))',
    'linear-gradient(135deg, rgba(255, 183, 3, 0.64), rgba(13, 16, 33, 0.86))',
    'linear-gradient(135deg, rgba(255, 107, 107, 0.66), rgba(13, 16, 33, 0.86))',
    'linear-gradient(135deg, rgba(34, 197, 94, 0.62), rgba(13, 16, 33, 0.86))',
    'linear-gradient(135deg, rgba(168, 85, 247, 0.66), rgba(13, 16, 33, 0.86))'
  ];

  return gradients[index % gradients.length];
}

function uploadedImagePaths(files = []) {
  return files.map((file) => `/uploads/${file.filename}`);
}

async function deleteUploadedFile(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) {
    return;
  }

  try {
    await unlink(join(UPLOAD_DIR, imagePath.replace("/uploads/", "")));
  } catch {
    // Le fichier peut déjà avoir été supprimé : on continue sans bloquer l application.
  }
}

function nextProjectNumber(projects) {
  const numbers = projectList(projects).map((project) => {
    const fromId = Number(String(project.id || "").replace(/\D/g, ""));
    const fromOrder = Number(project.order || 0);
    return Math.max(fromId, fromOrder);
  });

  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/login', async (request, response) => {
  const { email, password } = request.body;
  const passwordMatch = await bcrypt.compare(password ?? '', VALID_PASSWORD_HASH);

  if (email === VALID_EMAIL && passwordMatch) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
    return response.json({
      token,
      user: { email: VALID_EMAIL, name: 'Moncef' }
    });
  }

  return response.status(401).json({ message: 'Email ou mot de passe incorrect.' });
});


app.post('/api/contact', async (request, response) => {
  const { email, subject, message } = request.body;

  if (!email || !String(email).includes('@')) {
    return response.status(400).json({ message: 'Une adresse e-mail valide est requise.' });
  }

  if (!message || !String(message).trim()) {
    return response.status(400).json({ message: 'Le message ne peut pas être vide.' });
  }

  if (!smtpConfigReady()) {
    return response.status(500).json({
      message: 'Le formulaire est prêt, mais les variables SMTP ne sont pas encore configurées sur le serveur.'
    });
  }

  await sendContactEmail({ email, subject, message });
  return response.json({ message: 'Message envoyé avec succès.' });
});

app.get('/api/projects', async (request, response) => {
  const projects = await readProjects();
  return response.json(projectList(projects));
});

app.post('/api/projects', requireAuth, upload.array('images', 8), async (request, response) => {
  const projects = await readProjects();
  const nextNumber = nextProjectNumber(projects);
  const id = `projet-${nextNumber}`;
  const images = uploadedImagePaths(request.files);
  const coverImage = images[0] || '/assets/images/screen-projet-1.svg';

  const newProject = {
    id,
    order: nextNumber,
    title: `Projet ${nextNumber}`,
    name: request.body.name?.trim() || `Nouveau projet ${nextNumber}`,
    subtitle: request.body.subtitle?.trim() || 'Projet ajouté depuis l’administration du portfolio.',
    coverImage,
    images,
    gradient: buildGradient(nextNumber - 1),
    description: request.body.description?.trim() || 'Description à compléter.',
    technologies: request.body.technologies?.trim() || 'Technologies utilisées à compléter.',
    feeling: request.body.feeling?.trim() || 'Ressenti à compléter.'
  };

  projects[id] = newProject;
  await writeProjects(projects);

  return response.status(201).json(newProject);
});

app.get('/api/projects/:projectId', async (request, response) => {
  const projects = await readProjects();
  const project = projects[request.params.projectId];

  if (!project) {
    return response.status(404).json({ message: 'Projet introuvable.' });
  }

  return response.json(project);
});

app.put('/api/projects/:projectId', requireAuth, async (request, response) => {
  const projects = await readProjects();
  const project = projects[request.params.projectId];

  if (!project) {
    return response.status(404).json({ message: 'Projet introuvable.' });
  }

  const allowedFields = ['description', 'technologies', 'feeling', 'name', 'subtitle'];

  for (const field of allowedFields) {
    if (typeof request.body[field] === 'string') {
      project[field] = request.body[field].trim();
    }
  }

  projects[request.params.projectId] = project;
  await writeProjects(projects);

  return response.json(project);
});

app.post('/api/projects/:projectId/images', requireAuth, upload.array('images', 8), async (request, response) => {
  const projects = await readProjects();
  const project = projects[request.params.projectId];

  if (!project) {
    return response.status(404).json({ message: 'Projet introuvable.' });
  }

  const newImages = uploadedImagePaths(request.files);
  project.images = [...(project.images || []), ...newImages];

  if (!project.coverImage && project.images.length > 0) {
    project.coverImage = project.images[0];
  }

  projects[request.params.projectId] = project;
  await writeProjects(projects);

  return response.json(project);
});

app.delete('/api/projects/:projectId', requireAuth, async (request, response) => {
  const projects = await readProjects();
  const project = projects[request.params.projectId];

  if (!project) {
    return response.status(404).json({ message: 'Projet introuvable.' });
  }

  await Promise.all((project.images || []).map(deleteUploadedFile));
  delete projects[request.params.projectId];
  await writeProjects(projects);

  return response.json({ message: 'Projet supprimé.', projects: projectList(projects) });
});

app.delete('/api/projects/:projectId/images', requireAuth, async (request, response) => {
  const projects = await readProjects();
  const project = projects[request.params.projectId];

  if (!project) {
    return response.status(404).json({ message: 'Projet introuvable.' });
  }

  const imagesToDelete = Array.isArray(request.body.images) ? request.body.images : [];

  if (!imagesToDelete.length) {
    return response.status(400).json({ message: 'Sélectionne au moins une image à supprimer.' });
  }

  const imageSet = new Set(imagesToDelete);
  project.images = (project.images || []).filter((image) => !imageSet.has(image));
  await Promise.all(imagesToDelete.map(deleteUploadedFile));
  project.coverImage = project.images[0] || '/assets/images/screen-projet-1.svg';

  projects[request.params.projectId] = project;
  await writeProjects(projects);

  return response.json(project);
});


app.use((error, request, response, next) => {
  return response.status(400).json({ message: error.message || 'Erreur serveur.' });
});

if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend lancé sur http://localhost:${PORT}`);
  });
}

export default app;
