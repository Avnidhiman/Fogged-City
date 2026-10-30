/**
 * Cities Index Registry
 * Central hub for all playable and preview cities in Fogged City.
 */
import { delhiCityData } from './delhi';

export const allCities = [
  {
    id: 'delhi',
    name: 'Delhi',
    subtitle: 'The Smog Capital',
    state: 'NCT of Delhi',
    status: 'available',
    releaseBadge: 'Playable Now',
    totalZones: 5,
    tagline: 'Pierce through winter smog, metro scrambles, and street protests.',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: 'Landmark',
    data: delhiCityData
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    subtitle: 'City of Dreams & Coastal Fog',
    state: 'Maharashtra',
    status: 'coming-soon',
    releaseBadge: 'Coming Soon',
    totalZones: 5,
    tagline: 'Sea mist, local train scrambles, and monsoon seaside riddles.',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    icon: 'Waves',
    data: null
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    subtitle: 'The Pink City Haze',
    state: 'Rajasthan',
    status: 'coming-soon',
    releaseBadge: 'Coming Soon',
    totalZones: 5,
    tagline: 'Desert dawn mist, royal palace secrets, and bazaar mysteries.',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    icon: 'Castle',
    data: null
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    subtitle: 'City of Joy & River Mist',
    state: 'West Bengal',
    status: 'coming-soon',
    releaseBadge: 'Coming Soon',
    totalZones: 5,
    tagline: 'Hooghly fog, yellow taxi chases, tramway tales, and adda riddles.',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    icon: 'Sparkles',
    data: null
  }
];

export function getCityById(cityId) {
  return allCities.find(c => c.id === cityId) || null;
}

export { delhiCityData };
