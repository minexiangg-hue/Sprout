import React, { useState } from 'react';

export default function CMS() {
  const [altText, setAltText] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/alt-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText }),
      });

      setMessage(
        response.ok
          ? 'Alt text updated successfully'
          : 'Failed to update alt text'
      );
    } catch {
      setMessage('Failed to update alt text');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="alt-text">Alt text</label>
      <input
        id="alt-text"
        type="text"
        value={altText}
        onChange={(event) => setAltText(event.target.value)}
      />
      <button type="submit" disabled={saving}>
        Save
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}