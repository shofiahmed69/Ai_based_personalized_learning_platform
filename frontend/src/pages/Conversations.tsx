import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { conversations as convApi, type Conversation } from '../api/client';
import styles from './ListPages.module.css';

export default function Conversations() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await convApi.list();
      setItems(data.conversations);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const { data } = await convApi.create();
      setItems((prev) => [data.conversation, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  function formatDate(s: string) {
    try {
      return new Date(s).toLocaleString();
    } catch {
      return s;
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Conversations</h1>
        <button type="button" className={styles.primaryButton} onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating…' : 'New conversation'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>No conversations yet. Start one above.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((conv) => (
            <li key={conv.id} className={styles.listItem}>
              <Link to={`/conversations/${conv.id}`} className={styles.listLink}>
                <span className={styles.listTitle}>{conv.title || 'Untitled conversation'}</span>
                <span className={styles.listMeta}>{formatDate(conv.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
