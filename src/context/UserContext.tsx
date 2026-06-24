import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import { UserProfile, Achievement, RouteProgress, UserLevel } from '../types';
import { ACHIEVEMENTS, LEVELS } from '../data/achievements';
import { ROUTES } from '../data/routes';

// ─── Константы ───────────────────────────────────────────────────────────────────

const DEFAULT_LEVEL: UserLevel = LEVELS[0];

const initialAchievements: Achievement[] = ACHIEVEMENTS.map((a) => ({
  ...a,
  unlocked: false,
}));

const initialProgress: RouteProgress[] = [];

const GUEST_PROFILE: UserProfile = {
  id: 'guest',
  name: 'Гость',
  avatar: '',
  level: DEFAULT_LEVEL,
  totalPoints: 0,
  routesCompleted: 0,
  totalDistance: 0,
  achievements: initialAchievements,
  routeProgress: initialProgress,
  wishlistedRouteIds: [],
};

// ─── Тестовый профиль (все ранги / ачивки) ──────────────────────────────────────

const TEST_ACHIEVEMENTS: Achievement[] = ACHIEVEMENTS.map((a) => ({
  ...a,
  unlocked: true,
  unlockedAt: new Date().toISOString(),
}));

const TEST_PROGRESS: RouteProgress[] = ROUTES.map((r, i) => ({
  routeId: r.id,
  completed: true,
  progress: 100,
  photosCollected: i + 1,
  pointsEarned: Math.round(r.distance * 10),
  completedAt: new Date().toISOString(),
  startedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
}));

const TEST_PROFILE: UserProfile = {
  id: 'test-user',
  name: 'Тестовый пользователь',
  avatar: '',
  level: LEVELS[4], // Легенда Шерегеша — Алтая
  totalPoints: 7000,
  routesCompleted: ROUTES.length,
  totalDistance: ROUTES.reduce((s, r) => s + r.distance, 0),
  achievements: TEST_ACHIEVEMENTS,
  routeProgress: TEST_PROGRESS,
  wishlistedRouteIds: ['route-1', 'route-6'],
};

// ─── State ───────────────────────────────────────────────────────────────────

interface UserState {
  profile: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type UserAction =
  | { type: 'LOGIN_AS_TEST' }
  | { type: 'LOGOUT' }
  | { type: 'COMPLETE_ROUTE'; routeId: string; distance: number }
  | { type: 'ADD_PHOTO'; routeId: string }
  | { type: 'TOGGLE_WISHLIST'; routeId: string };

function getLevel(points: number): UserLevel {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (points >= lvl.minPoints) {
      current = lvl;
    }
  }
  return current;
}

function checkAchievements(
  profile: UserProfile,
  achievements: Omit<Achievement, 'unlocked' | 'unlockedAt'>[]
): Achievement[] {
  return achievements.map((ach) => {
    const existing = profile.achievements.find((a) => a.id === ach.id);
    if (existing?.unlocked) return existing;

    let unlocked = false;
    switch (ach.id) {
      case 'ach-1':
        unlocked = profile.routesCompleted >= 1;
        break;
      case 'ach-2':
        unlocked = profile.routesCompleted >= 3;
        break;
      case 'ach-3':
        unlocked =
          profile.routeProgress.filter((r) => r.completed).length >= 5;
        break;
      case 'ach-4':
        unlocked =
          profile.routeProgress.reduce(
            (sum, r) => sum + r.photosCollected,
            0
          ) >= 5;
        break;
      case 'ach-5':
        unlocked = profile.totalDistance >= 100;
        break;
      case 'ach-6':
        unlocked = profile.totalDistance >= 500;
        break;
      case 'ach-7':
        unlocked = false;
        break;
      case 'ach-8':
        unlocked = false;
        break;
    }

    return {
      ...ach,
      unlocked: unlocked || (existing?.unlocked ?? false),
      unlockedAt:
        unlocked && !existing?.unlocked
          ? new Date().toISOString()
          : existing?.unlockedAt,
    } as Achievement;
  });
}

const initialState: UserState = {
  profile: GUEST_PROFILE,
  isAuthenticated: false,
  isLoading: false,
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'LOGIN_AS_TEST':
      return {
        ...state,
        profile: TEST_PROFILE,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        profile: GUEST_PROFILE,
        isAuthenticated: false,
      };

    case 'COMPLETE_ROUTE': {
      if (!state.isAuthenticated) return state;

      const { routeId, distance } = action;
      const existingIdx = state.profile.routeProgress.findIndex(
        (r) => r.routeId === routeId
      );

      let newProgress: RouteProgress[];
      if (existingIdx >= 0) {
        newProgress = [...state.profile.routeProgress];
        newProgress[existingIdx] = {
          ...newProgress[existingIdx],
          completed: true,
          progress: 100,
          pointsEarned: Math.round(distance * 10),
          completedAt: new Date().toISOString(),
        };
      } else {
        newProgress = [
          ...state.profile.routeProgress,
          {
            routeId,
            completed: true,
            progress: 100,
            photosCollected: 0,
            pointsEarned: Math.round(distance * 10),
            completedAt: new Date().toISOString(),
            startedAt: new Date().toISOString(),
          },
        ];
      }

      const totalPoints = newProgress.reduce(
        (sum, r) => sum + (r.pointsEarned || 0),
        0
      );
      const routesCompleted = newProgress.filter((r) => r.completed).length;
      const totalDistance = state.profile.totalDistance + distance;
      const newLevel = getLevel(totalPoints);
      const newAchievements = checkAchievements(
        { ...state.profile, routeProgress: newProgress, totalDistance, routesCompleted },
        ACHIEVEMENTS
      );

      return {
        ...state,
        profile: {
          ...state.profile,
          totalPoints,
          routesCompleted,
          totalDistance,
          level: newLevel,
          achievements: newAchievements,
          routeProgress: newProgress,
        },
      };
    }

    case 'ADD_PHOTO': {
      if (!state.isAuthenticated) return state;

      const { routeId } = action;
      const newProgress = state.profile.routeProgress.map((r) => {
        if (r.routeId === routeId) {
          return { ...r, photosCollected: r.photosCollected + 1 };
        }
        return r;
      });
      return {
        ...state,
        profile: { ...state.profile, routeProgress: newProgress },
      };
    }

    case 'TOGGLE_WISHLIST': {
      if (!state.isAuthenticated) return state;
      const { routeId } = action;
      const exists = state.profile.wishlistedRouteIds.includes(routeId);
      return {
        ...state,
        profile: {
          ...state.profile,
          wishlistedRouteIds: exists
            ? state.profile.wishlistedRouteIds.filter((id) => id !== routeId)
            : [...state.profile.wishlistedRouteIds, routeId],
        },
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface UserContextType {
  profile: UserProfile;
  isAuthenticated: boolean;
  loginAsTest: () => void;
  logout: () => void;
  completeRoute: (routeId: string, distance: number) => void;
  addPhoto: (routeId: string) => void;
  toggleWishlist: (routeId: string) => void;
  isWishlisted: (routeId: string) => boolean;
  isRouteCompleted: (routeId: string) => boolean;
  getRouteProgress: (routeId: string) => RouteProgress | undefined;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const loginAsTest = useCallback(() => {
    dispatch({ type: 'LOGIN_AS_TEST' });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const completeRoute = useCallback((routeId: string, distance: number) => {
    dispatch({ type: 'COMPLETE_ROUTE', routeId, distance });
  }, []);

  const addPhoto = useCallback((routeId: string) => {
    dispatch({ type: 'ADD_PHOTO', routeId });
  }, []);

  const toggleWishlist = useCallback((routeId: string) => {
    dispatch({ type: 'TOGGLE_WISHLIST', routeId });
  }, []);

  const isWishlisted = useCallback(
    (routeId: string) => {
      return state.profile.wishlistedRouteIds.includes(routeId);
    },
    [state.profile.wishlistedRouteIds]
  );

  const isRouteCompleted = useCallback(
    (routeId: string) => {
      return state.profile.routeProgress.some(
        (r) => r.routeId === routeId && r.completed
      );
    },
    [state.profile.routeProgress]
  );

  const getRouteProgress = useCallback(
    (routeId: string) => {
      return state.profile.routeProgress.find(
        (r) => r.routeId === routeId
      );
    },
    [state.profile.routeProgress]
  );

  const value = useMemo(
    () => ({
      profile: state.profile,
      isAuthenticated: state.isAuthenticated,
      loginAsTest,
      logout,
      completeRoute,
      addPhoto,
      toggleWishlist,
      isWishlisted,
      isRouteCompleted,
      getRouteProgress,
    }),
    [
      state.profile,
      state.isAuthenticated,
      loginAsTest,
      logout,
      completeRoute,
      addPhoto,
      toggleWishlist,
      isWishlisted,
      isRouteCompleted,
      getRouteProgress,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
