import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, Lock, MapPin, Sparkles, CloudFog } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { audioSystem } from '../utils/audioSystem';
import '../styles/chapters.css';

const chaptersList = [
  {
    id: 'delhi',
    chapterNum: 'CHAPTER 01',
    name: 'Delhi',
    status: 'available',
    tagline: 'Miniature metropolis of ancient sandstone, roaring metro tracks, and street-smart secrets.',
    badge: 'PLAYABLE NOW',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    levelsCount: 5,
    difficulty: 'Adventurer'
  },
  {
    id: 'mumbai',
    chapterNum: 'CHAPTER 02',
    name: 'Mumbai',
    status: 'locked',
    tagline: 'Coastal sea mist, local train platform sprints, and monsoon seaside riddles.',
    badge: 'COMING SOON',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    levelsCount: 5,
    difficulty: 'Mysterious'
  },
  {
    id: 'kolkata',
    chapterNum: 'CHAPTER 03',
    name: 'Kolkata',
    status: 'locked',
    tagline: 'Hooghly river mist, vintage yellow taxi chases, and historic street coffee riddles.',
    badge: 'IN DEVELOPMENT',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
    levelsCount: 5,
    difficulty: 'Enigma'
  },
  {
    id: 'jaipur',
    chapterNum: 'CHAPTER 04',
    name: 'Jaipur',
    status: 'locked',
    tagline: 'Pink City dawn haze, royal astronomical sundials, and bazaar mysteries.',
    badge: 'PLANNED',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    levelsCount: 5,
    difficulty: 'Legendary'
  }
];

export default function ChapterSelectionPage() {
  const navigate = useNavigate();
  const { completedCount, totalLevels } = useGame();

  const handleSelectDelhi = () => {
    audioSystem.playClick();
    navigate('/delhi');
  };

  return (
    <div className="chapters-page-container">
      {/* Header */}
      <header className="chapters-header">
        <div className="chapters-emblem">
          <CloudFog size={16} color="var(--accent-amber)" />
          <span>THE FOGGED CITY UNIVERSE</span>
        </div>

        <h1 className="chapters-title">Select Your Chapter</h1>

        <p className="chapters-subtitle">
          Enter the mysterious fogged cities of India. Explore living miniature streets, 
          discover hidden clues, and solve funny contemporary urban riddles.
        </p>
      </header>

      {/* Chapters Grid */}
      <div className="chapters-grid" role="region" aria-label="Available Chapters">
        {chaptersList.map((chapter) => {
          const isAvailable = chapter.status === 'available';

          return (
            <article
              key={chapter.id}
              className={`chapter-game-card ${isAvailable ? 'active-chapter' : 'locked-chapter'}`}
              onClick={isAvailable ? handleSelectDelhi : undefined}
            >
              {/* Artwork Box */}
              <div className="chapter-artwork-box">
                <img 
                  src={chapter.image} 
                  alt={chapter.name} 
                  className="chapter-artwork-img" 
                />
                <div className="chapter-artwork-overlay" />

                <span className={`chapter-badge ${isAvailable ? 'available' : 'locked'}`}>
                  {chapter.badge}
                </span>
              </div>

              {/* Details */}
              <div className="chapter-details">
                <span className="chapter-num">{chapter.chapterNum}</span>
                <h2 className="chapter-name">{chapter.name}</h2>
                <p className="chapter-desc">{chapter.tagline}</p>

                <div className="chapter-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <MapPin size={14} color="var(--accent-amber)" />
                    <span>{chapter.levelsCount} Playable Levels</span>
                  </div>

                  {isAvailable ? (
                    <button 
                      type="button" 
                      className="btn-enter-chapter"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDelhi();
                      }}
                    >
                      <span>ENTER DELHI</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <Lock size={14} />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
