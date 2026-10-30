import React from 'react';
import { Link } from 'react-router-dom';
import { CloudOff, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <CloudOff size={64} color="var(--accent-amber)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '0.75rem' }}>
        Lost in the Delhi Smog
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '2rem', lineHeight: '1.6' }}>
        The visibility dropped to zero meters and this sector vanished from the map. Head back to the central hub.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn-secondary">
          <Home size={16} />
          <span>Home Hub</span>
        </Link>
        <Link to="/delhi" className="btn-primary">
          <Compass size={16} />
          <span>Delhi Map</span>
        </Link>
      </div>
    </div>
  );
}
