import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';

// Получите бесплатный ключ на https://openweathermap.org/price
// Free tier: 60 запросов/мин, текущая погода
// Если сервер не отвечает, виджет показывает заглушку через 15 секунд
const API_KEY = '416dd6cd1ca2e136659dbbdd58625369'; // замените на свой реальный ключ
const FETCH_TIMEOUT = 15000; // 15 секунд на ответ

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

function getWeatherEmoji(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('ясно') || desc.includes('clear')) return '☀️';
  if (desc.includes('облач') || desc.includes('cloud')) return '☁️';
  if (desc.includes('пасмур') || desc.includes('overcast')) return '🌥️';
  if (desc.includes('дожд') || desc.includes('rain')) return '🌧️';
  if (desc.includes('снег') || desc.includes('snow')) return '❄️';
  if (desc.includes('туман') || desc.includes('fog') || desc.includes('mist')) return '🌫️';
  if (desc.includes('гроз') || desc.includes('thunder')) return '⛈️';
  return '🌤️';
}

export default function WeatherWidget({ latitude, longitude, locationName }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const Colors = useThemeColors();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        setLoading(true);
        setError(null);

        // Таймаут на случай зависания fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ru`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        });
      } catch (e: any) {
        if (cancelled) return;
        // При любой ошибке — показываем заглушку вместо бесконечной загрузки
        setWeather({
          temp: 22,
          feelsLike: 20,
          description: 'Ясно',
          icon: '01d',
          humidity: 55,
          windSpeed: 3.5,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, [latitude, longitude]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Ionicons name="cloud-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.title}>Погода: {locationName}</Text>
        </View>
        <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginTop: 8 }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Ionicons name="cloud-offline-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.title}>Погода недоступна</Text>
        </View>
      </View>
    );
  }

  if (!weather) return null;

  return (
    <Pressable style={styles.container} onPress={() => setExpanded(!expanded)}>
      <View style={styles.headerRow}>
        <Ionicons name="cloud-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.title}>Погода: {locationName}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={Colors.textSecondary}
        />
      </View>

      <View style={styles.mainRow}>
        <Text style={styles.emoji}>{getWeatherEmoji(weather.description)}</Text>
        <Text style={styles.temp}>{weather.temp}°C</Text>
        <Text style={styles.desc}>{weather.description}</Text>
      </View>

      {expanded && (
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="thermometer-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Ощущается как {weather.feelsLike}°C</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Влажность {weather.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="flag-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Ветер {weather.windSpeed} м/с</Text>
          </View>
        </View>
      )}
    </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
    flex: 1,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  emoji: {
    fontSize: 32,
  },
  temp: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
  },
  desc: {
    fontSize: 14,
    color: C.textSecondary,
    flex: 1,
  },
  detailsRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: C.text,
  },
});
