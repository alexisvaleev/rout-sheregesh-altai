export const Colors = {
  // Fresh nature theme — emerald + warm orange
  primary: '#0D7C5F',
  primaryLight: '#10A070',
  accent: '#F4A261', // тёплый оранж
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
    {
      elementType: 'geometry',
      stylers: [{ color: '#ebe3cd' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#523735' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#f5f1e6' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#c9b2a6' }],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#dcd2be' }],
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#dfd2ae' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [{ color: '#a5b076' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#f5f1e6' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [{ color: '#b9d3c2' }],
    },
  ],
};
