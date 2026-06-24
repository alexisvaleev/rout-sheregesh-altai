import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Route } from '../types';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';
import { useUser } from '../context/UserContext';

interface RouteCardProps {
  route: Route;
  onPress?: (route: Route) => void;
  compact?: boolean;
  completed?: boolean;
}

const SEASON_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  winter: 'snow-outline',
  summer: 'sunny-outline',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Лёгкий',
  medium: 'Средний',
  hard: 'Сложный',
};

export default function RouteCard({
  route,
  onPress,
  compact = false,
  completed = false,
}: RouteCardProps) {
  const { isAuthenticated, toggleWishlist, isWishlisted } = useUser();
  const Colors = useThemeColors();
  const displayPrice = route.tariffs
    ? Math.min(...route.tariffs.map((t) => t.price))
    : route.price ?? 0;
  const hasTariffs = !!route.tariffs;
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  return (
    <Pressable
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => onPress?.(route)}
    >
      {/* Top section with route photo */}
      <View style={[styles.imageContainer, compact && styles.imageCompact]}>
        {route.imageUrl ? (
          <Image
            source={typeof route.imageUrl === 'string' ? { uri: route.imageUrl } : route.imageUrl}
            style={styles.routeImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name="map-outline"
            size={compact ? 20 : 28}
            color={Colors.primaryLight}
          />
        )}
        <View style={styles.imageOverlay}>
          <Text style={styles.duration}>{route.duration}</Text>
        </View>
        {completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={[styles.info, compact && styles.infoCompact]}>
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
          {route.title}
        </Text>
        {!compact && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {route.subtitle}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={styles.tag}>
            <Ionicons
              name={SEASON_ICONS[route.season] || 'leaf-outline'}
              size={12}
              color={Colors.textSecondary}
            />
            <Text style={styles.metaText}>{route.distance} км</Text>
          </View>
          <View style={styles.tag}>
            <View
              style={[
                styles.difficultyDot,
                { backgroundColor: route.difficulty.color },
              ]}
            />
            <Text style={styles.metaText}>
              {DIFFICULTY_LABELS[route.difficulty.label]}
            </Text>
          </View>
          {!compact && (
            <View style={styles.tag}>
              <Ionicons name="star" size={12} color={Colors.accent} />
              <Text style={styles.metaText}>{route.rating}</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {!compact && (
          <View style={styles.tagsRow}>
            {route.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.miniTag}>
                <Text style={styles.miniTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Price + Wishlist */}
      <View style={styles.priceContainer}>
        {isAuthenticated && (
          <Pressable
            onPress={() => toggleWishlist(route.id)}
            hitSlop={8}
            style={styles.wishlistBtn}
          >
            <Ionicons
              name={isWishlisted(route.id) ? 'heart' : 'heart-outline'}
              size={18}
              color={isWishlisted(route.id) ? '#E53935' : Colors.textSecondary}
            />
          </Pressable>
        )}
        <View style={styles.priceTag}>
          {hasTariffs && <Text style={styles.priceLabel}>от</Text>}
          <Text style={styles.priceValue}>
            {displayPrice.toLocaleString('ru-RU')} ₽
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const getStyles = (C: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: C.surface,
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 6,
      padding: 12,
      shadowColor: C.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
      boxShadow: `0 2px 8px ${C.shadow}`,
    },
    cardCompact: {
      padding: 10,
      marginVertical: 4,
    },
    imageContainer: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: C.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    imageCompact: {
      width: 60,
      height: 60,
    },
    routeImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    duration: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    completedBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
    },
    info: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
    },
    infoCompact: {
      marginLeft: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: C.text,
      marginBottom: 2,
    },
    titleCompact: {
      fontSize: 14,
    },
    subtitle: {
      fontSize: 13,
      color: C.textSecondary,
      marginBottom: 6,
    },
    meta: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: C.textSecondary,
    },
    difficultyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: 4,
      marginTop: 6,
      flexWrap: 'wrap',
    },
    miniTag: {
      backgroundColor: C.surfaceAlt,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    miniTagText: {
      fontSize: 10,
      color: C.textSecondary,
    },
    priceContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingLeft: 8,
      gap: 4,
    },
    wishlistBtn: {
      padding: 4,
      marginBottom: 2,
    },
    priceTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: C.surfaceAlt,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.border,
    },
    priceLabel: {
      fontSize: 11,
      color: C.textSecondary,
      fontWeight: '500',
    },
    priceValue: {
      fontSize: 14,
      fontWeight: '700',
      color: C.primary,
    },
  });
