export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: 'natural' | 'cultural' | 'gastronomic' | 'active' | 'event' | 'complex';
  imageUrl?: string;
}

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface RouteDifficulty {
  label: 'easy' | 'medium' | 'hard';
  color: string;
}

export interface Tariff {
  id: string;
  name: string; // "BASIC" | "PRO" | "PARTY"
  label: string; // "Start Grelka"
  color: string; // hex badge color
  emoji: string; // icon/emoji
  description: string;
  price: number;
  features: string[];
  badge?: string; // "Популярный"
  imageUrl?: string; // мини-фото для карточки тарифа
}

export interface Route {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string; // e.g. "3 дня"
  distance: number; // km
  difficulty: RouteDifficulty;
  season: 'winter' | 'summer' | 'all-season';
  tags: string[];
  coordinates: RouteCoordinate[];
  pointsOfInterest: PointOfInterest[];
  imageUrl?: string;
  price?: number; // фиксированная цена (если без тарифов)
  tariffs?: Tariff[]; // набор тарифов (если есть выбор)
  completedCount: number;
  rating: number; // 1-5
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'map' | 'star' | 'trophy' | 'mountain' | 'compass' | 'fire' | 'camera' | 'award';
  requirement: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface RouteProgress {
  routeId: string;
  completed: boolean;
  progress: number; // 0-100
  photosCollected: number;
  pointsEarned: number;
  startedAt?: string;
  completedAt?: string;
}

export interface UserLevel {
  level: number;
  title: string;
  minPoints: number;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: UserLevel;
  totalPoints: number;
  routesCompleted: number;
  totalDistance: number;
  achievements: Achievement[];
  routeProgress: RouteProgress[];
  wishlistedRouteIds: string[];
}

export interface Review {
  id: string;
  routeId: string;
  author: string;
  avatar: string;
  rating: number; // 1-5
  text: string;
  date: string;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
