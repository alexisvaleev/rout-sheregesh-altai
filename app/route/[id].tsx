import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/context/ThemeContext';
import { ThemeColors } from '../../src/constants/themes';
import { ROUTES } from '../../src/data/routes';
import { useUser } from '../../src/context/UserContext';
import { Tariff, Review } from '../../src/types';
import ReviewSection from '../../src/components/ReviewSection';
import { ROUTE_REVIEWS } from '../../src/data/reviews';
import LeafletMap from '../../src/components/LeafletMap';
import PhoneAuthModal from '../../src/components/PhoneAuthModal';
import RouteGallery from '../../src/components/RouteGallery';
import { ROUTE_PRICING_IMAGES } from '../../src/data/routePhotos';
import SeasonIndicator from '../../src/components/SeasonIndicator';
import WeatherWidget from '../../src/components/WeatherWidget';
import { ROUTE_PHOTOS } from '../../src/data/routePhotos';

const MAP_HEIGHT = 280;

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  natural: 'leaf-outline',
  cultural: 'business-outline',
  gastronomic: 'restaurant-outline',
  active: 'bicycle-outline',
  event: 'calendar-outline',
  complex: 'business-outline',
};

const CATEGORY_LABELS: Record<string, string> = {
  natural: 'Природная локация',
  cultural: 'Культурный объект',
  gastronomic: 'Гастрономия',
  active: 'Активный отдых',
  event: 'Событие',
  complex: 'Туристический комплекс',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Лёгкий',
  medium: 'Средний',
  hard: 'Сложный',
};

export default function RouteDetailScreen() {
  const [showAuth, setShowAuth] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, isAuthenticated, completeRoute, isRouteCompleted, toggleWishlist, isWishlisted } = useUser();
  const Colors = useThemeColors();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const route = useMemo(() => ROUTES.find((r) => r.id === id), [id]);

  // Загружаем отзывы для маршрута
  useEffect(() => {
    setReviews(ROUTE_REVIEWS[id ?? ''] ?? []);
  }, [id]);

  if (!route) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Маршрут не найден</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Вернуться к карте</Text>
        </Pressable>
      </View>
    );
  }

  const completed = isRouteCompleted(route.id);
  const progress = profile.routeProgress.find(
    (r) => r.routeId === route.id
  );

  const handleCompleteRoute = () => {
    completeRoute(route.id, route.distance);
  };

  const handleAddReview = (text: string, rating: number) => {
    if (!route) return;
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      routeId: route.id,
      author: profile.name || 'Гость',
      avatar: '',
      rating,
      text,
      date: new Date().toISOString().slice(0, 10),
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  // Авто-выбор тарифа (если есть) — популярный или первый
  const activeTariff = selectedTariff
    ?? route.tariffs?.find((t) => t.badge === 'Популярный')
    ?? route.tariffs?.[0]
    ?? null;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: route.title,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* OpenStreetMap preview via Leaflet */}
        <View style={styles.mapPreview}>
          <LeafletMap
            routes={[route]}
            selectedRouteId={route.id}
            style={styles.map}
          />
        </View>

        {/* Main info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{route.title}</Text>
            {isAuthenticated && (
              <Pressable
                onPress={() => toggleWishlist(route.id)}
                hitSlop={8}
                style={styles.wishlistBtn}
              >
                <Ionicons
                  name={isWishlisted(route.id) ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isWishlisted(route.id) ? '#E53935' : Colors.textSecondary}
                />
              </Pressable>
            )}
          </View>
          <Text style={styles.subtitle}>{route.subtitle}</Text>

          {/* Meta chips */}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaChipText}>{route.duration}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="navigate-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaChipText}>{route.distance} км</Text>
            </View>
            <View style={styles.metaChip}>
              <View
                style={[
                  styles.diffDot,
                  { backgroundColor: route.difficulty.color },
                ]}
              />
              <Text style={styles.metaChipText}>
                {DIFFICULTY_LABELS[route.difficulty.label]}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="star" size={14} color={Colors.accent} />
              <Text style={styles.metaChipText}>{route.rating}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>{route.description}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {route.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Photo Gallery */}
        <RouteGallery photos={ROUTE_PHOTOS[route.id] || []} routeId={route.id} />

        {/* Seasonality */}
        <SeasonIndicator season={route.season} />

        {/* Weather */}
        {route.coordinates.length > 0 && (
          <WeatherWidget
            latitude={route.coordinates[Math.floor(route.coordinates.length / 2)].latitude}
            longitude={route.coordinates[Math.floor(route.coordinates.length / 2)].longitude}
            locationName={route.pointsOfInterest[0]?.name || route.title}
          />
        )}

        {/* Price / Tariff Selector */}
        {route.tariffs ? (
          <>
            <View style={styles.tariffSection}>
              <Text style={styles.sectionTitle}>Выберите тариф</Text>

              {route.tariffs.map((tariff) => {
                const isSelected = activeTariff?.id === tariff.id;
                return (
                  <Pressable
                    key={tariff.id}
                    style={[
                      styles.tariffCard,
                      isSelected && styles.tariffCardSelected,
                    ]}
                    onPress={() => setSelectedTariff(tariff)}
                  >
                    <View style={styles.tariffHeader}>
                      <View style={styles.tariffHeaderLeft}>
                        <Text style={styles.tariffEmoji}>{tariff.emoji}</Text>
                        <View>
                          <Text style={styles.tariffName}>{tariff.name}</Text>
                          <Text style={styles.tariffLabel}>{tariff.label}</Text>
                        </View>
                      </View>
                      <View style={styles.tariffHeaderRight}>
                        <Text style={styles.tariffPrice}>
                          {tariff.price.toLocaleString('ru-RU')} ₽
                        </Text>
                        {tariff.badge && (
                          <View style={[styles.tariffBadge, { backgroundColor: tariff.color }]}>
                            <Text style={styles.tariffBadgeText}>{tariff.badge}</Text>
                          </View>
                        )}
                      </View>
                      {isSelected && (
                        <View style={styles.selectedCheckmark}>
                          <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                        </View>
                      )}
                    </View>

                    <View style={styles.tariffFeatures}>
                      {tariff.features.map((feature, i) => (
                        <View key={i} style={styles.tariffFeatureRow}>
                          <Ionicons name="checkmark-circle-outline" size={16} color={tariff.color} />
                          <Text style={styles.tariffFeatureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Pay button with tariff */}
            <View style={styles.payOuterSection}>
              {ROUTE_PRICING_IMAGES[route.id] && (
                <View style={styles.pricingMiniImagePay}>
                  <Image
                    source={
                      typeof ROUTE_PRICING_IMAGES[route.id] === 'string'
                        ? { uri: ROUTE_PRICING_IMAGES[route.id] }
                        : ROUTE_PRICING_IMAGES[route.id]
                    }
                    style={styles.pricingMiniImageInner}
                    resizeMode="cover"
                  />
                </View>
              )}
              <Pressable style={styles.payButton} onPress={() => setShowAuth(true)}>
                <Ionicons name="card-outline" size={22} color={Colors.textOnPrimary} />
                <Text style={styles.payButtonText}>
                  Оплатить {activeTariff?.name || 'тур'} — {(activeTariff?.price ?? 0).toLocaleString('ru-RU')} ₽
                </Text>
              </Pressable>
              <Text style={styles.completedCount}>
                {route.completedCount} чел. прошли
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Single price */}
            <View style={styles.singlePriceSection}>
              {ROUTE_PRICING_IMAGES[route.id] && (
                <View style={styles.pricingMiniImage}>
                  <Image
                    source={
                      typeof ROUTE_PRICING_IMAGES[route.id] === 'string'
                        ? { uri: ROUTE_PRICING_IMAGES[route.id] }
                        : ROUTE_PRICING_IMAGES[route.id]
                    }
                    style={styles.pricingMiniImageInner}
                    resizeMode="cover"
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.singlePriceLabel}>Стоимость</Text>
                <Text style={styles.singlePrice}>
                  {route.price?.toLocaleString('ru-RU')} ₽
                </Text>
              </View>
              <Text style={styles.completedCount}>
                {route.completedCount} чел. прошли
              </Text>
            </View>

            {/* Pay button */}
            <Pressable style={styles.payButton} onPress={() => setShowAuth(true)}>
              <Ionicons name="card-outline" size={22} color={Colors.textOnPrimary} />
              <Text style={styles.payButtonText}>
                Оплатить тур — {route.price?.toLocaleString('ru-RU')} ₽
              </Text>
            </Pressable>
          </>
        )}

        {/* Points of Interest */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Программа маршрута</Text>
          {route.pointsOfInterest.map((poi, index) => (
            <View key={poi.id} style={styles.poiItem}>
              <View style={styles.poiIndex}>
                <Text style={styles.poiIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.poiInfo}>
                <Text style={styles.poiName}>{poi.name}</Text>
                <Text style={styles.poiDescription}>{poi.description}</Text>
                <View style={styles.poiTag}>
                  <Ionicons
                    name={CATEGORY_ICONS[poi.category] || 'location-outline'}
                    size={12}
                    color={Colors.primaryLight}
                  />
                  <Text style={styles.poiTagText}>
                    {CATEGORY_LABELS[poi.category] || poi.category}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Reviews */}
        <ReviewSection reviews={reviews} onAddReview={handleAddReview} />

        {/* Complete / Auth button */}
        {!isAuthenticated ? (
          <Pressable style={styles.authPromptButton} onPress={() => setShowAuth(true)}>
            <Ionicons name="log-in-outline" size={22} color={Colors.primary} />
            <Text style={styles.authPromptText}>Войдите, чтобы отмечать пройденные маршруты</Text>
          </Pressable>
        ) : !completed ? (
          <Pressable style={styles.completeButton} onPress={handleCompleteRoute}>
            <Ionicons name="checkmark-circle-outline" size={22} color={Colors.textOnPrimary} />
            <Text style={styles.completeButtonText}>Отметить маршрут пройденным</Text>
          </Pressable>
        ) : (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.completedBannerText}>
              Маршрут пройден! +{progress?.pointsEarned || route.distance * 10} очков
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Phone Auth Modal */}
      <PhoneAuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {}}
      />
    </>
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
  content: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.background,
    gap: 12,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: C.text,
  },
  backButton: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: C.textOnPrimary,
    fontWeight: '600',
  },
  mapPreview: {
    height: MAP_HEIGHT,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  infoSection: {
    backgroundColor: C.surface,
    padding: 16,
    marginTop: -8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    flex: 1,
  },
  wishlistBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 12,
    color: C.textSecondary,
    fontWeight: '500',
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: C.text,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: C.primaryLight,
  },
  pricingMiniImage: {
    width: 56,
    height: 42,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: C.surfaceAlt,
    marginRight: 12,
  },
  pricingMiniImagePay: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: C.surfaceAlt,
    marginHorizontal: 16,
    marginTop: 8,
  },
  pricingMiniImageInner: {
    width: '100%',
    height: '100%',
  },
  singlePriceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    boxShadow: `0 1px 4px ${C.shadow}`,
  },
  singlePriceLabel: {
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 2,
  },
  singlePrice: {
    fontSize: 22,
    fontWeight: '800',
    color: C.primary,
  },
  completedCount: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },

  // Tariff selector
  tariffSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  tariffCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    boxShadow: `0 1px 4px ${C.shadow}`,
  },
  tariffCardSelected: {
    borderColor: C.primary,
    backgroundColor: C.surface,
    shadowColor: C.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    boxShadow: `0 0 8px ${hexToRgba(C.primary, 0.15)}`,
  },
  tariffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  tariffHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  tariffEmoji: {
    fontSize: 28,
  },
  tariffName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  tariffLabel: {
    fontSize: 13,
    color: C.textSecondary,
  },
  tariffHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  tariffPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primary,
  },
  tariffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tariffBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  selectedCheckmark: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  tariffFeatures: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 6,
  },
  tariffFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tariffFeatureText: {
    fontSize: 13,
    color: C.text,
    flex: 1,
  },
  payOuterSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  poiItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  poiIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  poiIndexText: {
    color: C.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  poiInfo: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
  },
  poiName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginBottom: 4,
  },
  poiDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: C.textSecondary,
    marginBottom: 8,
  },
  poiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  poiTagText: {
    fontSize: 11,
    color: C.primaryLight,
    fontWeight: '500',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    boxShadow: `0 4px 8px ${hexToRgba(C.primary, 0.3)}`,
  },
  payButtonText: {
    color: C.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.success,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    boxShadow: `0 4px 8px ${hexToRgba(C.success, 0.3)}`,
  },
  authPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.primary,
    borderStyle: 'dashed',
  },
  authPromptText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  completeButtonText: {
    color: C.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: hexToRgba(C.success, 0.12),
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.success,
  },
  completedBannerText: {
    color: C.success,
    fontSize: 15,
    fontWeight: '600',
  },
});
