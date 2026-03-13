"use client";

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <h1 style={{ fontSize: '3rem', color: '#1e293b', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#64748b' }}>Page non trouvée</p>
      <a href="/" style={{ marginTop: '2rem', color: '#2563eb', textDecoration: 'underline' }}>Retour à l’accueil</a>
    </div>
  );
}
