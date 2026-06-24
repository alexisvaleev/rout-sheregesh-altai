import { Platform } from 'react-native';
import LeafletMapNative from './LeafletMap.native';
import LeafletMapWeb from './LeafletMap.web';
import { Route } from '../types';

export interface LeafletMapProps {
  routes: Route[];
  selectedRouteId?: string | null;
  onMarkerPress?: (routeId: string) => void;
  style?: any;
}

const Component = Platform.select({
  web: LeafletMapWeb,
  default: LeafletMapNative,
});

export default Component;
