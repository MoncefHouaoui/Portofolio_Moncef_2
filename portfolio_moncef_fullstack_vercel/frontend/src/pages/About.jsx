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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer pretium, lorem sed
            feugiat commodo, nibh sem fermentum risus, vitae facilisis neque risus id lorem.
            Suspendisse potenti. Praesent sed sapien ac lorem interdum tincidunt.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Remplace ce texte par ton
            parcours, tes objectifs, tes qualités et ce que tu recherches dans une alternance ou un
            stage.
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
