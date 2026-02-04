import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>◇</span>
          <span>AI Knowledge Base</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.navActive : styles.navLink)}>
            Dashboard
          </NavLink>
          <NavLink to="/documents" className={({ isActive }) => (isActive ? styles.navActive : styles.navLink)}>
            Documents
          </NavLink>
          <NavLink to="/tags" className={({ isActive }) => (isActive ? styles.navActive : styles.navLink)}>
            Tags
          </NavLink>
          <NavLink to="/conversations" className={({ isActive }) => (isActive ? styles.navActive : styles.navLink)}>
            Conversations
          </NavLink>
          <NavLink to="/memories" className={({ isActive }) => (isActive ? styles.navActive : styles.navLink)}>
            Memories
          </NavLink>
        </nav>
        <div className={styles.user}>
          <span className={styles.userEmail}>{user?.email ?? '—'}</span>
          <button type="button" onClick={handleLogout} className={styles.logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
