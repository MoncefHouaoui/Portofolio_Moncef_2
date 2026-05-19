import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <section className="about-section page-enter">
        <div className="about-image-wrap">
          <img src="/assets/images/photo-moncef.png" alt="Photo de Moncef" />
        </div>
        <div className="about-text">
          <p className="eyebrow">À propos</p>
          <h1>Moncef, futur développeur web</h1>
          <p>
            Je m’appelle Moncef Houaoui et je suis actuellement en reconversion professionnelle vers le développement web. Curieux, motivé et sérieux.
            J’aime apprendre de nouvelles technologies et progresser à travers des projets concrets. 
            Mon objectif est de continuer à développer mes compétences afin de construire des applications modernes, utiles et agréables à utiliser.
          </p>
          <p>
            Je me forme principalement au développement web avec des technologies comme HTML, CSS, JavaScript et React pour la partie frontend. 
            J’ai également commencé à travailler sur la logique backend avec Node.js, Express et les API REST. 
            À travers mes projets, j’apprends à créer des interfaces propres, responsives et interactives, tout en comprenant la structure d’une application complète. 
            Je suis aussi prêt à me former sur d’autres langages, frameworks ou outils selon les besoins d’un projet ou d’une entreprise.
          </p>
        </div>
      </section>

      <section className="projects-split" id="projets">
        <Link className="project-tile project-one" to="/projet-1">
          <span>Projet 1</span>
          <small>Kasa</small>
          <small>Voir le détail du projet</small>
        </Link>
        <Link className="project-tile project-two" to="/projet-2">
          <span>Projet 2</span>
          <small>Mon Vieux Grimoire</small>
          <small>Voir le détail du projet</small>
        </Link>
      </section>
    </>
  );
}
