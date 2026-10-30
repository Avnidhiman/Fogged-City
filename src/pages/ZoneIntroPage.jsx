import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Award, 
  Target, 
  HelpCircle, 
  CheckCircle2, 
  Flame,
  AlertCircle
} from 'lucide-react';
import { delhiCityData } from '../data/cities/delhi';
import { useGame } from '../hooks/useGame';
import '../styles/zone.css';

export default function ZoneIntroPage() {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { isZoneCompleted, isZoneUnlocked, completeZone } = useGame();

  const zone = delhiCityData.zones.find(z => z.id === zoneId);

  // If zone doesn't exist
  if (!zone) {
    return (
      <div className="zone-page" style={{ textAlign: 'center' }}>
        <h2>Zone Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
          This sector does not exist in the Delhi municipal records.
        </p>
        <Link to="/delhi" className="btn-secondary">
          <ArrowLeft size={16} />
          <span>Return to Delhi Map</span>
        </Link>
      </div>
    );
  }

  const unlocked = isZoneUnlocked(zone.id);
  const completed = isZoneCompleted(zone.id);

  if (!unlocked) {
    return (
      <div className="zone-page" style={{ textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--accent-amber)" style={{ margin: '0 auto 1rem' }} />
        <h2>Sector Locked</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
          You must clear the previous zone before accessing {zone.name}.
        </p>
        <Link to="/delhi" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Map</span>
        </Link>
      </div>
    );
  }

  const handleBeginChallenge = () => {
    // Stage 1 baseline: In Stage 4 & 5, dedicated interactive minigames will be rendered
    alert(`Challenge Ready! Stage 1 initialized for ${zone.name}. Stage 4 will mount the full interactive riddle challenge.`);
  };

  return (
    <div className="zone-page">
      <motion.article 
        className="zone-intro-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ borderTop: `4px solid ${zone.color}` }}
      >
        <div className="zone-intro-header">
          <div>
            <div 
              className="zone-tag"
              style={{ 
                background: `${zone.color}20`, 
                color: zone.color,
                border: `1px solid ${zone.color}50` 
              }}
            >
              <span>Zone 0{zone.zoneNumber}</span>
              <span>•</span>
              <span>{zone.subtitle}</span>
            </div>
            <h1 className="zone-intro-title">{zone.name}</h1>
            <div className="zone-intro-subtitle">{zone.tagline}</div>
          </div>

          {completed && (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                color: 'var(--accent-green)',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Challenge Cleared</span>
            </div>
          )}
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
          {zone.description}
        </p>

        {/* Mission Objective Box */}
        <div className="zone-objective-box">
          <h4>
            <Target size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Mission Objective
          </h4>
          <p>{zone.missionObjective}</p>
        </div>

        {/* Zone Metadata Stats */}
        <div className="zone-meta-grid">
          <div className="zone-meta-item">
            <span className="zone-meta-label">Reward Points</span>
            <span className="zone-meta-val" style={{ color: 'var(--accent-amber-light)' }}>
              +{zone.pointsReward} PTS
            </span>
          </div>

          <div className="zone-meta-item">
            <span className="zone-meta-label">Challenge Format</span>
            <span className="zone-meta-val">Riddle & Trivia</span>
          </div>

          <div className="zone-meta-item">
            <span className="zone-meta-label">Estimated Fog Clearance</span>
            <span className="zone-meta-val" style={{ color: 'var(--accent-cyan-light)' }}>
              +20% Visibility
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="zone-actions">
          <Link to="/delhi" className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Map</span>
          </Link>

          <motion.button
            type="button"
            className="btn-primary"
            onClick={handleBeginChallenge}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: `linear-gradient(135deg, ${zone.color} 0%, #d97706 100%)`,
              color: '#ffffff'
            }}
          >
            <Play size={18} />
            <span>{completed ? 'Replay Challenge' : 'Begin Challenge'}</span>
          </motion.button>
        </div>
      </motion.article>
    </div>
  );
}
