/**
 * THE FOGGED CITY — CHAPTER 01: DELHI
 * Geographically accurate landmark definitions and mystery riddles.
 * Coordinates format: [longitude, latitude] for MapLibre GL JS / GeoJSON standard.
 *
 * Optional per-riddle fields used by the team role tools (see README):
 *   riddle.audio       { src, label?, transcript? }  -> Voice Lore play/pause
 *   riddle.cipherNotes string[]                      -> extra Cipher tips
 *   riddle.seekerNotes string[]                      -> extra Seeker tips
 */

export const delhiChapterData = {
  id: 'delhi',
  chapterNumber: 1,
  chapterTitle: 'CHAPTER 01 — DELHI',
  name: 'Delhi',
  tagline: 'An ancient capital shrouded in winter fog, where three millennia of empires rest beneath roaring modern boulevards.',
  mapConfig: {
    initialCenter: [77.2167, 28.6271], // Centered at Jantar Mantar
    initialZoom: 13.6,
    minZoom: 11.5,
    maxZoom: 17.5,
    pitch: 35,
    bearing: -15
  },
  stats: {
    totalLevels: 5,
    difficulty: 'Explorer',
    totalScore: 1250
  },
  levels: [
    {
      id: 'jantar-mantar',
      levelNumber: 1,
      name: 'Jantar Mantar',
      subtitle: 'The Celestial Sundial',
      district: 'Connaught Place Outer',
      coordinates: [77.2167, 28.6271], // Real Longitude, Latitude
      zoomTarget: 15.5,
      pitchTarget: 45,
      bearingTarget: -20,
      isDefaultUnlocked: true, // First playable level!
      pointsReward: 250,
      accentColor: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.6)',
      objective: 'Decode the ancient astronomical gnomon piercing Delhi’s winter haze.',
      narrative: 'In 1724, Maharaja Jai Singh II of Jaipur constructed thirteen monumental masonry instruments on the plains of Delhi. Long before atomic clocks and GPS, this silent red sandstone observatory tracked the dance of planets with uncanny precision.',
      riddle: {
        title: 'The Great Gnomon of Time',
        question: 'I stand 27 meters tall, my central hypotenuse pointing directly toward the North Pole. My shadow slides across carved marble quadrants, measuring local time to an accuracy of two seconds. What is my classical name?',
        hint: 'It translates from Sanskrit as "The Supreme Instrument" — look for the largest structure in the complex.',
        options: [
          { id: 'opt-1', text: 'Samrat Yantra (The Supreme Instrument)', isCorrect: true },
          { id: 'opt-2', text: 'Ram Yantra (The Cylindrical Gauge)', isCorrect: false, explanation: 'The Ram Yantra measures altitude and azimuth, but lacks the giant triangular gnomon.' },
          { id: 'opt-3', text: 'Jai Prakash (The Mirror of Heavens)', isCorrect: false, explanation: 'Jai Prakash consists of concave hemispherical bowls, not a 27-meter triangle.' },
          { id: 'opt-4', text: 'Misra Yantra (The Mixed Device)', isCorrect: false, explanation: 'The Misra Yantra was built to measure noon in multiple global observatories simultaneously.' }
        ],
        discoveryLore: 'The colossal shadow aligns with the meridian! The solar coordinates are calibrated, and the morning smog begins to recede along the ceremonial axis towards India Gate.',
        historicalFact: 'Jai Singh chose masonry rather than brass instruments because metal would warp and expand in Delhi’s brutal summer heat and winter chill.'
      }
    },
    {
      id: 'india-gate',
      levelNumber: 2,
      name: 'India Gate',
      subtitle: 'The Sentinel of Kartavya Path',
      district: 'Central Vista',
      coordinates: [77.2295, 28.6129],
      zoomTarget: 15.2,
      pitchTarget: 40,
      bearingTarget: 10,
      isDefaultUnlocked: false,
      unlockRequirementId: 'jantar-mantar',
      pointsReward: 250,
      accentColor: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.6)',
      objective: 'Inspect the sandstone archway where thousands gather under midnight mist.',
      narrative: 'Designed by Sir Edwin Lutyens and completed in 1931, this 42-meter triumphal arch commemorates soldiers who fought in WWI and the Third Anglo-Afghan War. Today, it stands as the emotional heart of Kartavya Path.',
      riddle: {
        title: 'The Unquenched Flame',
        question: 'Beneath the great arch, an inverted bayonet and soldier’s helmet stood vigil over an eternal flame for five continuous decades. What was this legendary memorial flame named?',
        hint: 'Its Hindi name translates to "The Immortal Soldier\'s Flame".',
        options: [
          { id: 'opt-1', text: 'Amar Jawan Jyoti', isCorrect: true },
          { id: 'opt-2', text: 'Shaheed Smarak Deep', isCorrect: false, explanation: 'Shaheed Smarak is located near Patna, not beneath the central India Gate arch.' },
          { id: 'opt-3', text: 'Kargil Vijay Jyoti', isCorrect: false, explanation: 'The Kargil flame is preserved at Dras War Memorial in Ladakh.' },
          { id: 'opt-4', text: 'Muktijoddha Deep', isCorrect: false, explanation: 'This honors the 1971 liberation campaign in Eastern India.' }
        ],
        discoveryLore: 'The ceremonial flame blazes through the mist! Sunlight reflects across the water channels of Kartavya Path, lifting the fog over Connaught Place.',
        historicalFact: 'In January 2022, after 50 years under the arch, the flame was ceremoniously merged with the eternal flame at the adjacent National War Memorial.'
      }
    },
    {
      id: 'connaught-place',
      levelNumber: 3,
      name: 'Connaught Place',
      subtitle: 'The Concentric Colonnades',
      district: 'Rajiv Chowk',
      coordinates: [77.2195, 28.6328],
      zoomTarget: 15.6,
      pitchTarget: 42,
      bearingTarget: 45,
      isDefaultUnlocked: false,
      unlockRequirementId: 'india-gate',
      pointsReward: 250,
      accentColor: '#e2e8f0',
      accentGlow: 'rgba(226, 232, 240, 0.6)',
      objective: 'Navigate the circular Georgian colonnades above India’s busiest metro junction.',
      narrative: 'Conceived by Robert Tor Russell, this grand circular marketplace was inspired by the Royal Crescent in Bath. Beneath its pristine white Palladian pillars lies Rajiv Chowk, the beating transit heart where millions cross paths daily.',
      riddle: {
        title: 'The Subterranean Market',
        question: 'Directly beneath the central park of Connaught Place lies India’s first underground air-conditioned market, famed for brass artifacts, apparel, and electronics. What is it called?',
        hint: 'It shares its name with the municipal council governing the capital.',
        options: [
          { id: 'opt-1', text: 'Palika Bazaar', isCorrect: true },
          { id: 'opt-2', text: 'Janpath Market', isCorrect: false, explanation: 'Janpath is an outdoor street flea market located south of CP.' },
          { id: 'opt-3', text: 'Shankar Market', isCorrect: false, explanation: 'Shankar Market is an above-ground corridor market famed for textiles.' },
          { id: 'opt-4', text: 'Chor Bazaar', isCorrect: false, explanation: 'Chor Bazaar operates on Sunday mornings near Delhi Gate, far from CP.' }
        ],
        discoveryLore: 'The underground passages echo with vibrant street life! The mist clears from the central roundabout, pointing towards the historic walls of Old Delhi.',
        historicalFact: 'Palika Bazaar opened in 1978 and can accommodate an estimated 15,000 visitors inside its air-conditioned subterranean concourses.'
      }
    },
    {
      id: 'old-delhi',
      levelNumber: 4,
      name: 'Old Delhi & Chandni Chowk',
      subtitle: 'The Walled City of Shahjahanabad',
      district: 'Old Delhi',
      coordinates: [77.2410, 28.6562],
      zoomTarget: 15.4,
      pitchTarget: 38,
      bearingTarget: -10,
      isDefaultUnlocked: false,
      unlockRequirementId: 'connaught-place',
      pointsReward: 250,
      accentColor: '#f97316',
      accentGlow: 'rgba(249, 115, 22, 0.6)',
      objective: 'Unravel the 17th-century secrets simmering in the alleys of Chandni Chowk.',
      narrative: 'Founded in 1639 by Emperor Shah Jahan as his new imperial capital, Shahjahanabad was a world of silver merchants, fragrant spices, and architectural poetry designed by Princess Jahanara Begum.',
      riddle: {
        title: 'The Moonlit Boulevard',
        question: 'Chandni Chowk originally featured a wide canal running down its center with a reflecting pool that shimmered in the night sky. What does the name "Chandni Chowk" literally mean?',
        hint: '"Chand" is the Hindi word for Moon.',
        options: [
          { id: 'opt-1', text: 'Moonlight Square', isCorrect: true },
          { id: 'opt-2', text: 'Silver Merchant Market', isCorrect: false, explanation: 'Silver trade gave birth to Dariba Kalan, but Chandni Chowk refers to celestial reflection.' },
          { id: 'opt-3', text: 'Golden Lantern Lane', isCorrect: false, explanation: 'Golden lanterns were used on festival nights, but do not form the avenue\'s name.' },
          { id: 'opt-4', text: 'Royal Imperial Way', isCorrect: false, explanation: 'The imperial procession road was called Faiz Bazaar.' }
        ],
        discoveryLore: 'The fragrance of roasted spices and steaming desi ghee jalebis cuts through the dense fog! The northern gate opens toward the southern monuments.',
        historicalFact: 'Princess Jahanara Begum designed the market with a central canal fed by the Yamuna River, creating mirror-like moonlight reflections that enchanted travelers from across Eurasia.'
      }
    },
    {
      id: 'qutub-minar',
      levelNumber: 5,
      name: 'Qutub Minar',
      subtitle: 'The Tower of Victory',
      district: 'Mehrauli',
      coordinates: [77.1855, 28.5244],
      zoomTarget: 15.6,
      pitchTarget: 48,
      bearingTarget: 30,
      isDefaultUnlocked: false,
      unlockRequirementId: 'old-delhi',
      pointsReward: 250,
      accentColor: '#10b981',
      accentGlow: 'rgba(16, 185, 129, 0.6)',
      objective: 'Unlock the final mystery at Delhi’s oldest medieval archaeological sanctuary.',
      narrative: 'Rising 72.5 meters into the southern sky of Mehrauli, Qutub Minar is the world’s tallest brick minaret. At its base stands an ancient metallurgical miracle: a 1,600-year-old iron pillar that has never rusted.',
      riddle: {
        title: 'The Rustless Enigma',
        question: 'Within the Qutub complex stands an iron pillar forged in the 4th century CE during the Gupta Dynasty. Despite sixteen centuries of monsoon rains and desert winds, it has resisted corrosion. What scientific layer protects it?',
        hint: 'Ancient Indian metallurgists created a thin protective film of iron, phosphorus, and hydrogen.',
        options: [
          { id: 'opt-1', text: 'A crystalline protective oxide layer of iron hydrogen phosphate (Misawite)', isCorrect: true },
          { id: 'opt-2', text: 'An electroplated outer shell of pure molten brass', isCorrect: false, explanation: 'Electroplating was only developed in the 19th century, fifteen hundred years later!' },
          { id: 'opt-3', text: 'A secret lacquer coating made from Himalayan cedar sap', isCorrect: false, explanation: 'Organic sap would decompose within decades under harsh Delhi weathering.' },
          { id: 'opt-4', text: 'Meteoric nickel alloy found only in celestial meteorites', isCorrect: false, explanation: 'Chemical analysis confirms it is forged of wrought iron with high phosphorus content.' }
        ],
        discoveryLore: 'THE SMOG IS CONQUERED! The final mystery of Delhi is resolved. The entire capital from Mehrauli to Chandni Chowk gleams in crystal-clear golden light!',
        historicalFact: 'Archaeological tests revealed that ancient Indian iron-smiths used charcoal in their blast furnaces, introducing high phosphorus into the wrought iron which reacted with Delhi humidity to create an impervious shield.'
      }
    }
  ]
};
