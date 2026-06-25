import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';
import { useUser } from '../context/UserContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_HEIGHT = 260;

interface RouteGalleryProps {
  /** Массив image sources из require() — берётся из ROUTE_PHOTOS */
  photos: any[];
  /** ID маршрута для сбора фотографий */
  routeId?: string;
}

export default function RouteGallery({ photos, routeId }: RouteGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(activeIndex);
  const Colors = useThemeColors();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const { isAuthenticated, profile, addPhoto } = useUser();

  // Обновляем ref при изменении activeIndex
  activeIndexRef.current = activeIndex;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const pageWidth = e.nativeEvent.layoutMeasurement?.width || SCREEN_WIDTH;
      if (pageWidth <= 0) return;
      const index = Math.round(offsetX / pageWidth);
      if (index >= 0 && index < photos.length && index !== activeIndexRef.current) {
        activeIndexRef.current = index;
        setActiveIndex(index);
      }
    },
    [photos.length]
  );

  const handleCollectPhoto = useCallback(() => {
    if (!routeId || !isAuthenticated) return;
    addPhoto(routeId);
  }, [routeId, isAuthenticated, addPhoto]);

  // Количество собранных фото для этого маршрута
  const routeProgress = routeId ? profile.routeProgress.find((r) => r.routeId === routeId) : null;
  const collectedCount = routeProgress?.photosCollected ?? 0;

  // Если фото нет — не рендерим компонент
  if (!photos || photos.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Карусель */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={80}
        decelerationRate="fast"
      >
        {photos.map((photo, index) => {
          const imageSource = typeof photo === 'string' ? { uri: photo } : photo;
          return (
            <View key={index} style={styles.card}>
              {failedImages.includes(index) ? (
                <View style={[styles.image, styles.imageFallback]}>
                  <Ionicons name="image-outline" size={36} color={Colors.textSecondary} />
                </View>
              ) : (
                <Image
                  source={imageSource}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => setFailedImages((prev) => [...prev, index])}
                  accessibilityLabel={`Фото маршрута ${index + 1}`}
                />
              )}
              {/* Тёмный градиент внизу для читаемости точек */}
              <View style={[styles.gradientOverlay, { pointerEvents: 'none' }]} />

              {/* Кнопка сбора фото */}
              {isAuthenticated && routeId && (
                <Pressable
                  style={styles.collectBtn}
                  onPress={handleCollectPhoto}
                  hitSlop={8}
                >
                  <Ionicons
                    name="camera-outline"
                    size={18}
                    color={collectedCount > 0 ? '#FFD700' : '#fff'}
                  />
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Нижняя плашка: точки + счётчик + счётчик сбора */}
      {photos.length > 1 && (
        <View style={styles.footer}>
          {/* Точки пагинации */}
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <View style={styles.footerRight}>
            {/* Значок собранных фото */}
            {isAuthenticated && routeId && collectedCount > 0 && (
              <View style={styles.collectedBadge}>
                <Ionicons name="camera" size={11} color="#FFD700" />
                <Text style={styles.collectedBadgeText}>{collectedCount}</Text>
              </View>
            )}
            {/* Счётчик */}
            <View style={styles.counterBadge}>
              <Ionicons name="images-outline" size={12} color={Colors.textOnPrimary} />
              <Text style={styles.counterText}>
                {activeIndex + 1}/{photos.length}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    height: GALLERY_HEIGHT,
    position: 'relative',
    marginBottom: 0,
  },
  card: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.surfaceAlt,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  collectBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  collectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  collectedBadgeText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: C.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
