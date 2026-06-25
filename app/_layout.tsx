import React from 'react';
import { View, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../src/context/UserContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import WelcomeOverlay from '../src/components/WelcomeOverlay';

function RootLayoutInner() {
  const [showWelcome, setShowWelcome] = React.useState(() => {
    // Проверяем, не скрывал ли уже пользователь приветствие в этой сессии
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('welcome:dismissed')) {
      return false;
    }
    return true;
  });
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const dismissWelcome = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('welcome:dismissed', '1');
    }
    setShowWelcome(false);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {showWelcome && <WelcomeOverlay onDismiss={dismissWelcome} />}
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
