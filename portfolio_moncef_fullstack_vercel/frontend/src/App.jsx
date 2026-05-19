import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';

export default function App() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
