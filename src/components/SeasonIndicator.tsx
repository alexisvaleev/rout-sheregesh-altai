import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';

const MONTHS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
];

interface SeasonIndicatorProps {
  season: 'winter' | 'summer' | 'all-season';
}

function getBestMonths(season: string): number[] {
  switch (season) {
    case 'summer':
      return [5, 6, 7, 8, 9]; // май-сентябрь
    case 'winter':
      return [11, 12, 1, 2, 3]; // ноябрь-март
    case 'all-season':
    default:
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // все
  }
}

const SEASON_LABELS: Record<string, string> = {
  summer: 'Летний сезон',
  winter: 'Зимний сезон',
  'all-season': 'Всесезонный',
};

const SEASON_ICONS: Record<string, string> = {
  summer: '☀️',
  winter: '❄️',
  'all-season': '🍃',
};

export default function SeasonIndicator({ season }: SeasonIndicatorProps) {
  const bestMonths = getBestMonths(season);
  const Colors = useThemeColors();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{SEASON_ICONS[season]}</Text>
        <Text style={styles.label}>{SEASON_LABELS[season]}</Text>
      </View>
      <View style={styles.monthsRow}>
        {MONTHS.map((month, idx) => {
          const isBest = bestMonths.includes(idx + 1);
          return (
            <View key={idx} style={styles.monthItem}>
              <View
                style={[
                  styles.dot,
                  isBest ? styles.dotActive : styles.dotInactive,
                ]}
              />
              <Text
                style={[
                  styles.monthLabel,
                  isBest ? styles.monthActive : styles.monthInactive,
                ]}
                numberOfLines={1}
              >
                {month}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {season === 'summer'
          ? 'Лучшее время: май — сентябрь'
          : season === 'winter'
          ? 'Лучшее время: ноябрь — март'
          : 'Подходит для любого времени года'}
      </Text>
    </View>
  );
}

const getStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthItem: {
    alignItems: 'center',
    gap: 4,
    width: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: C.primary,
  },
  dotInactive: {
    backgroundColor: C.border,
  },
  monthLabel: {
    fontSize: 8,
    textAlign: 'center',
  },
  monthActive: {
    color: C.text,
    fontWeight: '600',
  },
  monthInactive: {
    color: C.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
});
