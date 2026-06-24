import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

export default function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(30));
  const Colors = useThemeColors();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.hero,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="compass" size={48} color={Colors.primaryLight} />
          </View>
          <Text style={styles.title}>Две{'\n'}легенды</Text>
          <Text style={styles.subtitle}>
            Туристические маршруты по Сибири и Алтаю
          </Text>
          <View style={styles.features}>
            <FeatureRow
              icon="map-outline"
              text="Интерактивная карта с реальными дорогами"
              Colors={Colors}
            />
            <FeatureRow
              icon="images-outline"
              text="Фото и описание каждого маршрута"
              Colors={Colors}
            />
            <FeatureRow
              icon="pricetags-outline"
              text="Прозрачные цены и тарифы"
              Colors={Colors}
            />
            <FeatureRow
              icon="trophy-outline"
              text="Достижения и уровни"
              Colors={Colors}
            />
          </View>
        </Animated.View>

        <Pressable style={styles.button} onPress={onDismiss}>
          <Text style={styles.buttonText}>Начать путешествие</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function FeatureRow({
  icon,
  text,
  Colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  Colors: ThemeColors;
}) {
  return (
    <View style={featureStyles.row}>
      <View style={[featureStyles.iconWrap, { backgroundColor: Colors.primary + '20' }]}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <Text style={[featureStyles.text, { color: Colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

const featureStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    flex: 1,
  },
});

const getStyles = (C: ThemeColors) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      backgroundColor: C.background,
      zIndex: 100,
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingBottom: 60,
    },
    hero: {
      alignItems: 'center',
      marginBottom: 40,
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: C.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      borderWidth: 2,
      borderColor: C.primary + '30',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: C.text,
      textAlign: 'center',
      lineHeight: 38,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: C.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 8,
    },
    features: {
      width: '100%',
      marginTop: 24,
      paddingHorizontal: 8,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: C.primary,
      paddingVertical: 16,
      borderRadius: 16,
      marginHorizontal: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
    },
  });
