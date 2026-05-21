import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';

export default function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#contenu-principal">
        Aller au contenu principal
      </a>

      <Header />

      <main id="contenu-principal" tabIndex="-1">
        <Outlet />
      </main>
    </div>
  );
}