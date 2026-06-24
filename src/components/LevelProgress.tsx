import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserLevel } from '../types';
import { ThemeColors } from '../constants/themes';
import { LEVELS } from '../data/achievements';
import { useThemeColors } from '../context/ThemeContext';

interface LevelProgressProps {
  level: UserLevel;
  totalPoints: number;
}

export default function LevelProgress({ level, totalPoints }: LevelProgressProps) {
  const Colors = useThemeColors();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const currentLevelIndex = LEVELS.findIndex((l) => l.level === level.level);
  const nextLevel = LEVELS[currentLevelIndex + 1];

  const progress =
    nextLevel
      ? ((totalPoints - level.minPoints) /
          (nextLevel.minPoints - level.minPoints)) *
        100
      : 100;

  const displayProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      {/* Level header */}
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { color: level.color }]}>
            LVL {level.level}
          </Text>
        </View>
        <Text style={styles.levelTitle}>{level.title}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${displayProgress}%`,
                backgroundColor: level.color,
              },
            ]}
          />
        </View>
        <Text style={styles.pointsText}>{totalPoints} pts</Text>
      </View>

      {/* Next level hint */}
      {nextLevel && (
        <Text style={styles.nextLevel}>
          До уровня «{nextLevel.title}»: осталось{' '}
          {nextLevel.minPoints - totalPoints} очков
        </Text>
      )}
      {!nextLevel && (
        <Text style={styles.nextLevel}>Максимальный уровень!</Text>
      )}
    </View>
  );
}

const getStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    boxShadow: `0 2px 6px ${C.shadow}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '800',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: C.surfaceAlt,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    minWidth: 60,
    textAlign: 'right',
  },
  nextLevel: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 8,
  },
});
