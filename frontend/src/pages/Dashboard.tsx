import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { health, documents, tags, conversations, memories } from '../api/client';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [dbStatus, setDbStatus] = useState<string>('…');
  const [counts, setCounts] = useState<{ documents: number; tags: number; conversations: number; memories: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = await health();
        if (!cancelled) setDbStatus(h.database === 'connected' ? 'Connected' : 'Disconnected');
        const [docRes, tagRes, convRes, memRes] = await Promise.all([
          documents.list().then((r) => r.data),
          tags.list().then((r) => r.data),
          conversations.list().then((r) => r.data),
          memories.list().then((r) => r.data),
        ]);
        if (!cancelled) {
          setCounts({
            documents: docRes.pagination.total,
            tags: tagRes.tags.length,
            conversations: convRes.conversations.length,
            memories: memRes.memories.length,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : 'Failed to load');
          setDbStatus('Error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      {err && <p className={styles.error}>{err}</p>}
      <div className={styles.status}>
        <span className={styles.statusLabel}>Database:</span>
        <span className={dbStatus === 'Connected' ? styles.statusOk : styles.statusBad}>{dbStatus}</span>
      </div>
      <div className={styles.grid}>
        <Link to="/documents" className={styles.card}>
          <span className={styles.cardTitle}>Documents</span>
          <span className={styles.cardCount}>{counts?.documents ?? '—'}</span>
        </Link>
        <Link to="/tags" className={styles.card}>
          <span className={styles.cardTitle}>Tags</span>
          <span className={styles.cardCount}>{counts?.tags ?? '—'}</span>
        </Link>
        <Link to="/conversations" className={styles.card}>
          <span className={styles.cardTitle}>Conversations</span>
          <span className={styles.cardCount}>{counts?.conversations ?? '—'}</span>
        </Link>
        <Link to="/memories" className={styles.card}>
          <span className={styles.cardTitle}>Memories</span>
          <span className={styles.cardCount}>{counts?.memories ?? '—'}</span>
        </Link>
      </div>
    </div>
  );
}
