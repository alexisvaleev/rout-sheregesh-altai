import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Route, Region as RegionType } from '../types';
import LeafletMap from './LeafletMap';

interface RouteMapProps {
  routes: Route[];
  selectedRouteId?: string | null;
  activeRouteId?: string | null;
  initialRegion: RegionType;
  onMarkerPress?: (routeId: string) => void;
  style?: any;
}

export default function RouteMap(props: RouteMapProps) {
  const { routes, selectedRouteId, onMarkerPress, style } = props;

  return (
    <LeafletMap
      routes={routes}
      selectedRouteId={selectedRouteId}
      onMarkerPress={onMarkerPress}
      style={[styles.container, style]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
