import React, { useState } from 'react';

export default function App() {
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setMessage('Comment added successfully');
      setComment('');
    } catch {
      setMessage('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <textarea
          aria-label="Add a comment"
          placeholder="Add a comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <button type="submit" disabled={submitting}>
          Submit
        </button>
      </form>
      {message && <p role="status">{message}</p>}
    </main>
  );
}