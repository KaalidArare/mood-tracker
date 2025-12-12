
import { useEffect, useState } from 'react';
import "./App.css";


const MOOD_OPTIONS = ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad', 'Stressed', 'Calm'];

function App() {
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load existing mood entries
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/moods');
        const data = await res.json();
        setMoods(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load mood entries.');
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, []);

   // Save mood (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mood) {
      setError('Please select a mood.');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, note }),
      });

      const contentType = res.headers.get('content-type') || '';
      const raw = await res.text();

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        if (contentType.includes('application/json')) {
          try {
            const errData = JSON.parse(raw);
            message = errData.error || message;
          } catch {}
        } else {
          message = 'Server returned non-JSON response. (Likely Nginx/Express error page)';
        }
        throw new Error(message);
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response on success.');
      }

      const newMood = JSON.parse(raw);
      setMoods((prev) => [newMood, ...prev]);
      setMood('');
      setNote('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while saving your mood.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="full-width-box" style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Mood Tracker</h1>
      <p>Log how you’re feeling and keep a history of your moods.</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        {error && (
          <div style={{ marginBottom: '0.75rem', color: 'red' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="mood" style={{ display: 'block', marginBottom: 4 }}>
            Mood
          </label>
          <select
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Select your mood</option>
            {MOOD_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="note" style={{ display: 'block', marginBottom: 4 }}>
            Notes (optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.5rem', resize: 'vertical' }}
            placeholder="Anything you want to remember about today..."
          />
        </div>

        <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          {submitting ? 'Saving...' : 'Save Mood'}
        </button>
      </form>

      <section>
        <h2>Recent Moods</h2>
        {loading ? (
          <p>Loading...</p>
        ) : moods.length === 0 ? (
          <p>No mood entries yet. Start by submitting one above.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {moods.map((entry) => (
              <li
                key={entry.id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <strong>{entry.mood}</strong>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {new Date(entry.created_at).toLocaleString()}
                </div>
                {entry.note && <p style={{ marginTop: '0.5rem' }}>{entry.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;

