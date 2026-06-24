import React from 'react';
import { View, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../src/context/UserContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

function RootLayoutInner() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="route/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Маршрут',
            headerBackVisible: false,
            headerTintColor: colors.primary,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerLeft: () => (
              <Pressable
                onPress={() => router.replace('/')}
                hitSlop={8}
                style={{ marginRight: 12 }}
              >
                <Ionicons name="chevron-back" size={28} color={colors.primary} />
              </Pressable>
            ),
            presentation: 'card',
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </UserProvider>
  );
}
