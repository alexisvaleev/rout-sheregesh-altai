import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../src/context/ThemeContext';

export default function NotFoundScreen() {
  const router = useRouter();
  const Colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Ionicons name="compass-outline" size={80} color={Colors.textSecondary} />
      <Text style={[styles.title, { color: Colors.text }]}>Страница не найдена</Text>
      <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
        Такого маршрута не существует
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: Colors.primary }]}
        onPress={() => router.replace('/')}
      >
        <Text style={[styles.buttonText, { color: Colors.textOnPrimary }]}>
          На главную
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
