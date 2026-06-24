import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../types';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';

interface AchievementBadgeProps {
  achievement: Achievement;
  compact?: boolean;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  map: 'map-outline',
  star: 'star-outline',
  trophy: 'trophy-outline',
  mountain: 'triangle-outline',
  compass: 'compass-outline',
  fire: 'bonfire-outline',
  camera: 'camera-outline',
  award: 'ribbon-outline',
};

export default function AchievementBadge({
  achievement,
  compact = false,
}: AchievementBadgeProps) {
  const unlocked = achievement.unlocked;
  const Colors = useThemeColors();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View
        style={[
          styles.iconCircle,
          unlocked ? styles.iconUnlocked : styles.iconLocked,
          compact && styles.iconCircleCompact,
        ]}
      >
        <Ionicons
          name={ICON_MAP[achievement.icon] || 'help-outline'}
          size={compact ? 18 : 24}
          color={unlocked ? Colors.textOnPrimary : Colors.textSecondary}
        />
      </View>
      {!compact && (
        <View style={styles.textBlock}>
          <Text style={[styles.title, !unlocked && styles.titleLocked]}>
            {achievement.title}
          </Text>
          <Text style={styles.description}>{achievement.description}</Text>
          <Text style={styles.points}>+{achievement.points} очков</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  containerCompact: {
    padding: 6,
    gap: 0,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconUnlocked: {
    backgroundColor: C.primary,
  },
  iconLocked: {
    backgroundColor: C.surfaceAlt,
    opacity: 0.5,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginBottom: 2,
  },
  titleLocked: {
    color: C.textSecondary,
  },
  description: {
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 2,
  },
  points: {
    fontSize: 12,
    fontWeight: '600',
    color: C.accent,
  },
});
