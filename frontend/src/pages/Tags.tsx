import { useEffect, useState } from 'react';
import { tags as tagsApi, type Tag } from '../api/client';
import styles from './ListPages.module.css';

export default function Tags() {
  const [items, setItems] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await tagsApi.list();
      setItems(data.tags);
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
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await tagsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
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
        <h1 className={styles.title}>Tags</h1>
        <button type="button" className={styles.primaryButton} onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Add tag'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {showForm && (
        <form onSubmit={handleCreate} className={styles.form}>
          <input
            placeholder="Tag name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.primaryButton} disabled={creating}>
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>No tags yet. Add one above.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((tag) => (
            <li key={tag.id} className={styles.listItem}>
              <div className={styles.listMain}>
                <span className={styles.listTitle}>{tag.name}</span>
                <span className={styles.listMeta}>{tag.slug}{tag.description ? ` · ${tag.description}` : ''}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
