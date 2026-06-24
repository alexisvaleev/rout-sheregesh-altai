export const lightColors = {
  primary: '#0D7C5F',
  primaryLight: '#10A070',
  accent: '#F4A261',
  accentLight: '#F7B96D',

  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceAlt: '#E9ECEF',

  text: '#1C1B1A',
  textSecondary: '#6C757D',
  textOnPrimary: '#FFFFFF',

  success: '#2D9F6E',
  warning: '#F4A261',
  error: '#C44B4B',

  routeLine: '#0D7C5F',
  routeLineActive: '#F4A261',
  markerColor: '#0D7C5F',

  border: '#DEE2E6',
  shadow: 'rgba(0, 0, 0, 0.08)',

  level: {
    bronze: '#CD7F32',
    silver: '#A0A0A0',
    gold: '#F4A261',
    platinum: '#5BA3D9',
    diamond: '#B366CC',
  },

  mapStyle: [
    { elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9b2a6' }] },
    { featureType: 'administrative.land_parcel', elementType: 'geometry.stroke', stylers: [{ color: '#dcd2be' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#dfd2ae' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#dfd2ae' }] },
    { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#a5b076' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f5f1e6' }] },
    { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#b9d3c2' }] },
  ],
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  primary: '#10A070',
  primaryLight: '#34D399',
  accent: '#F4A261',
  accentLight: '#F7B96D',

  background: '#0D0D0D',
  surface: '#1C1C1E',
  surfaceAlt: '#2C2C2E',

  text: '#F2F2F2',
  textSecondary: '#B0B0B0',
  textOnPrimary: '#FFFFFF',

  success: '#34D399',
  warning: '#F4A261',
  error: '#E57373',

  routeLine: '#10A070',
  routeLineActive: '#F4A261',
  markerColor: '#10A070',

  border: '#3A3A3C',
  shadow: 'rgba(0, 0, 0, 0.4)',

  level: {
    bronze: '#CD7F32',
    silver: '#A0A0A0',
    gold: '#F4A261',
    platinum: '#5BA3D9',
    diamond: '#B366CC',
  },

  // Dark-adapted map tiles — same style, slightly darker base
  mapStyle: [
    { elementType: 'geometry', stylers: [{ color: '#242424' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#d4c9b8' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#3a3a3a' }] },
    { featureType: 'administrative.land_parcel', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a2a' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
    { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#2d4a2d' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
    { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#1a3a4a' }] },
  ],
};
