import React, { useState } from 'react';

export default function CMS() {
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/canonical-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canonicalUrl }),
      });

      setMessage(
        response.ok
          ? 'Canonical URL updated successfully'
          : 'Failed to update canonical URL'
      );
    } catch {
      setMessage('Failed to update canonical URL');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <label htmlFor="canonical-url">Canonical URL</label>
        <input
          id="canonical-url"
          type="url"
          value={canonicalUrl}
          onChange={(event) => setCanonicalUrl(event.target.value)}
        />
        <button type="submit" disabled={saving}>
          Save
        </button>
      </form>
      {message && <p role="status">{message}</p>}
    </main>
  );
}