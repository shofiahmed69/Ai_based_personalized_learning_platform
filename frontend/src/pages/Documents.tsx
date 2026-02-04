import { useEffect, useState } from 'react';
import { documents as docsApi, type Document } from '../api/client';
import styles from './ListPages.module.css';

export default function Documents() {
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [filename, setFilename] = useState('');
  const [fileType, setFileType] = useState('TEXT');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await docsApi.list();
      setItems(data.items);
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
    if (!title.trim() || !filename.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await docsApi.create({
        title: title.trim(),
        original_filename: filename.trim(),
        file_type: fileType,
        storage_path: `/uploads/${filename.trim()}`,
        file_size_bytes: 0,
      });
      setTitle('');
      setFilename('');
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
        <h1 className={styles.title}>Documents</h1>
        <button type="button" className={styles.primaryButton} onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Add document'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {showForm && (
        <form onSubmit={handleCreate} className={styles.form}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            required
          />
          <input
            placeholder="Original filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className={styles.input}
            required
          />
          <select value={fileType} onChange={(e) => setFileType(e.target.value)} className={styles.select}>
            <option value="TEXT">TEXT</option>
            <option value="PDF">PDF</option>
            <option value="MARKDOWN">MARKDOWN</option>
            <option value="CODE">CODE</option>
            <option value="DOCX">DOCX</option>
          </select>
          <button type="submit" className={styles.primaryButton} disabled={creating}>
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>No documents yet. Add one above.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((doc) => (
            <li key={doc.id} className={styles.listItem}>
              <div className={styles.listMain}>
                <span className={styles.listTitle}>{doc.title}</span>
                <span className={styles.listMeta}>
                  {doc.original_filename} · {doc.file_type} · {doc.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
