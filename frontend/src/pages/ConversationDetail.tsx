import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversations as convApi, type Message } from '../api/client';
import styles from './ConversationDetail.module.css';

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await convApi.get(id);
      setMessages(data.messages);
      setTitle(data.conversation.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setError(null);
    try {
      await convApi.addMessage(id, 'user', text);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  if (!id) {
    navigate('/conversations');
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/conversations')}>
          ← Back
        </button>
        <h1 className={styles.title}>{title ?? 'Conversation'}</h1>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : (
        <>
          <div className={styles.messages}>
            {messages.length === 0 ? (
              <p className={styles.muted}>No messages yet. Send one below.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={msg.role === 'user' ? styles.msgUser : styles.msgAssistant}>
                  <span className={styles.msgRole}>{msg.role}</span>
                  <p className={styles.msgContent}>{msg.content}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSend} className={styles.form}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className={styles.input}
              disabled={sending}
            />
            <button type="submit" className={styles.sendButton} disabled={sending || !input.trim()}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
