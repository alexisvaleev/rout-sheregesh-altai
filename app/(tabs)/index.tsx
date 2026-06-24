import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/context/ThemeContext';
import { ThemeColors } from '../../src/constants/themes';
import { ROUTES, getCombinedRegion, ROUTE_SEASONS } from '../../src/data/routes';
import { useUser } from '../../src/context/UserContext';
import RouteCard from '../../src/components/RouteCard';
import RouteMap from '../../src/components/RouteMap';
import { Route } from '../../src/types';

type SortKey = 'default' | 'price' | 'rating' | 'distance' | 'duration';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'По умолчанию' },
  { key: 'price', label: 'По цене' },
  { key: 'rating', label: 'По рейтингу' },
  { key: 'distance', label: 'По длине' },
];

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAP_HEIGHT = SCREEN_HEIGHT * 0.45;

export default function MapScreen() {
  const router = useRouter();
  const { isRouteCompleted } = useUser();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [showSort, setShowSort] = useState(false);
  const Colors = useThemeColors();

  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  // Сбрасываем выбранный маршрут при возврате на карту
  // Иначе после route/[id] → назад, selectedRouteId остаётся старым,
  // плавающая карточка не скрывается, а карта остаётся с highlight тура
  useFocusEffect(
    useCallback(() => {
      setSelectedRouteId(null);
    }, [])
  );

  const filteredRoutes = useMemo(() => {
    let result = activeSeason === 'all' ? [...ROUTES] : ROUTES.filter((r) => r.season === activeSeason);

    if (sortKey !== 'default') {
      result.sort((a, b) => {
        switch (sortKey) {
          case 'price': {
            const aPrice = a.tariffs ? Math.min(...a.tariffs.map((t) => t.price)) : a.price ?? 0;
            const bPrice = b.tariffs ? Math.min(...b.tariffs.map((t) => t.price)) : b.price ?? 0;
            return aPrice - bPrice;
          }
          case 'rating':
            return b.rating - a.rating;
          case 'distance':
            return a.distance - b.distance;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [activeSeason, sortKey]);

  const initialRegion = useMemo(() => getCombinedRegion(), []);

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Filters row: season + sort */}
      <View style={styles.filterRow}>
        {ROUTE_SEASONS.map((s) => (
          <Pressable
            key={s.key}
            style={[
              styles.filterChip,
              activeSeason === s.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveSeason(s.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeSeason === s.key && styles.filterChipTextActive,
              ]}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}

        {/* Sort button */}
        <Pressable
          style={[styles.filterChip, styles.sortChip, showSort && styles.sortChipActive]}
          onPress={() => setShowSort(!showSort)}
        >
          <Ionicons
            name="funnel-outline"
            size={14}
            color={showSort ? Colors.textOnPrimary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.filterChipText,
              showSort && styles.filterChipTextActive,
              { fontSize: 12 },
            ]}
          >
            {SORT_OPTIONS.find((o) => o.key === sortKey)?.label || 'Сортировка'}
          </Text>
        </Pressable>
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[
                styles.sortOption,
                sortKey === opt.key && styles.sortOptionActive,
              ]}
              onPress={() => {
                setSortKey(opt.key);
                setShowSort(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortKey === opt.key && styles.sortOptionTextActive,
                ]}
              >
                {opt.label}
              </Text>
              {sortKey === opt.key && (
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Routes count */}
      <Text style={styles.routesCount}>
        {filteredRoutes.length} маршрут(ов)
      </Text>
    </View>
  );

  const renderRouteItem = useCallback(
    ({ item }: { item: Route }) => (
      <RouteCard
        route={item}
        completed={isRouteCompleted(item.id)}
        onPress={(route) => {
          setSelectedRouteId(route.id);
          router.push(`/route/${route.id}`);
        }}
      />
    ),
    [router, isRouteCompleted]
  );

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <RouteMap
          routes={filteredRoutes}
          selectedRouteId={selectedRouteId}
          initialRegion={initialRegion}
          onMarkerPress={(routeId) => setSelectedRouteId(routeId)}
        />

        {/* Floating selected route info */}
        {selectedRouteId && (() => {
          const route = ROUTES.find((r) => r.id === selectedRouteId);
          if (!route) return null;
          return (
            <Pressable
              style={styles.floatingInfo}
              onPress={() => router.push(`/route/${route.id}`)}
            >
              <View style={styles.floatingInfoText}>
                <Text style={styles.floatingTitle}>{route.title}</Text>
                <Text style={styles.floatingSubtitle}>
                  {route.duration} · {route.distance} км · {route.tariffs ? 'от ' + Math.min(...route.tariffs.map(t => t.price)).toLocaleString('ru-RU') : route.price?.toLocaleString('ru-RU')} ₽
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </Pressable>
          );
        })()}
      </View>

      {/* Routes List */}
      <View style={styles.listContainer}>
        {renderHeader()}
        <FlatList
          data={filteredRoutes}
          keyExtractor={(item) => item.id}
          renderItem={renderRouteItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}

const hexToRgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const getStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
  },
  listContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    backgroundColor: C.background,
    zIndex: 10,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
  },
  filterChipTextActive: {
    color: C.textOnPrimary,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  sortChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  sortDropdown: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
    borderWidth: 1,
    borderColor: C.border,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: C.surfaceAlt,
  },
  sortOptionText: {
    fontSize: 14,
    color: C.text,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  routesCount: {
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 4,
  },
  floatingInfo: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  floatingInfoText: {
    flex: 1,
  },
  floatingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  floatingSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
});
