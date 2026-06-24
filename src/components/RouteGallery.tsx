import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_HEIGHT = 260;

interface RouteGalleryProps {
  /** Массив image sources из require() — берётся из ROUTE_PHOTOS */
  photos: any[];
}

export default function RouteGallery({ photos }: RouteGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const Colors = useThemeColors();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    },
    [activeIndex]
  );

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
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        {photos.map((photo, index) => {
          const imageSource = typeof photo === 'string' ? { uri: photo } : photo;
          return (
            <View key={index} style={styles.card}>
              <Image
                source={imageSource}
                style={styles.image}
                resizeMode="cover"
                accessibilityLabel={`Фото маршрута ${index + 1}`}
              />
              {/* Тёмный градиент внизу для читаемости точек */}
              <View style={[styles.gradientOverlay, { pointerEvents: 'none' }]} />
            </View>
          );
        })}
      </ScrollView>

      {/* Нижняя плашка: точки + счётчик */}
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

          {/* Счётчик */}
          <View style={styles.counterBadge}>
            <Ionicons name="images-outline" size={12} color={Colors.textOnPrimary} />
            <Text style={styles.counterText}>
              {activeIndex + 1}/{photos.length}
            </Text>
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
    marginBottom: 0, // стыкуется с секцией информации ниже
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
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.25)',
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
