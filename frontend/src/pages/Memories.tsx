import { useEffect, useState } from 'react';
import { memories as memApi, type Memory } from '../api/client';
import styles from './ListPages.module.css';

export default function Memories() {
  const [items, setItems] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('preference');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await memApi.list();
      setItems(data.memories);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await memApi.create({ type, key: key.trim(), value: value.trim() });
      setKey('');
      setValue('');
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Memories</h1>
        <button type="button" className={styles.primaryButton} onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Add memory'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {showForm && (
        <form onSubmit={handleCreate} className={styles.form}>
          <select value={type} onChange={(e) => setType(e.target.value)} className={styles.select}>
            <option value="preference">preference</option>
            <option value="context">context</option>
            <option value="interest">interest</option>
            <option value="correction">correction</option>
            <option value="fact">fact</option>
          </select>
          <input
            placeholder="Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={styles.input}
            required
          />
          <input
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.primaryButton} disabled={creating}>
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>No memories yet. Add one above.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((mem) => (
            <li key={mem.id} className={styles.listItem}>
              <div className={styles.listMain}>
                <span className={styles.listTitle}>{mem.key}</span>
                <span className={styles.listMeta}>
                  {mem.type} · {mem.value}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
