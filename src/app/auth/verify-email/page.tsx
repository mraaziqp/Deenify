"use client";
import { useState } from 'react';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Email verified! You can now sign in.');
      } else {
        setStatus(data.error || 'Verification failed.');
      }
    } catch {
      setStatus('Verification failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Verify Your Email</h2>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Verification Token"
          value={token}
          onChange={e => setToken(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-primary text-white p-2 rounded">Verify</button>
      </form>
      {status && <div className="mt-4 text-center text-sm text-red-600">{status}</div>}
    </div>
  );
}
