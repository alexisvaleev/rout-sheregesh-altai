import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, useTheme } from '../../src/context/ThemeContext';
import { ThemeColors } from '../../src/constants/themes';
import { useUser } from '../../src/context/UserContext';
import { ACHIEVEMENTS } from '../../src/data/achievements';
import { ROUTES } from '../../src/data/routes';
import LevelProgress from '../../src/components/LevelProgress';
import AchievementBadge from '../../src/components/AchievementBadge';
import PhoneAuthModal from '../../src/components/PhoneAuthModal';
import PhotoGallery from '../../src/components/PhotoGallery';

type ProfileTab = 'achievements' | 'routes' | 'wishlist';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, isAuthenticated, loginAsTest, logout } = useUser();
  const [activeTab, setActiveTab] = useState<ProfileTab>('achievements');
  const [authVisible, setAuthVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const Colors = useThemeColors();
  const { isDark, toggleTheme } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;
  const completedRoutes = profile.routeProgress.filter((r) => r.completed);
  const totalPhotos = profile.routeProgress.reduce(
    (sum, r) => sum + r.photosCollected,
    0
  );

  // ─── Неавторизован: экран входа ─────────────────────────────────────────────
  const unauthContent = (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.unauthContainer}>
        <View style={styles.unauthIcon}>
          <Ionicons name="trophy-outline" size={64} color={Colors.border} />
        </View>

        <Text style={styles.unauthTitle}>Геймификация</Text>
        <Text style={styles.unauthSubtitle}>
          Авторизуйтесь, чтобы отслеживать свои достижения, уровни и прогресс по маршрутам
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => setAuthVisible(true)}
        >
          <Ionicons name="phone-portrait-outline" size={20} color={Colors.textOnPrimary} />
          <Text style={styles.primaryButtonText}>Войти по телефону</Text>
        </Pressable>

        <Pressable
          style={styles.testButton}
          onPress={loginAsTest}
        >
          <Ionicons name="flask-outline" size={20} color={Colors.primaryLight} />
          <Text style={styles.testButtonText}>Тестовый профиль (все ранги)</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.footerText}>
          В тестовом профиле открыты все уровни и достижения для проверки
        </Text>
      </View>
    </ScrollView>
  );

  // ─── Авторизован: профиль с геймификацией ────────────────────────────────────
  const authContent = (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Шапка профиля */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={Colors.textOnPrimary} />
        </View>
        <Text style={styles.userName}>{profile.name}</Text>
        <View style={styles.levelRow}>
          <View style={[styles.levelDot, { backgroundColor: profile.level.color }]} />
          <Text style={[styles.levelText, { color: profile.level.color }]}>
            {profile.level.title}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.logoutText}>Выйти</Text>
          </Pressable>
        </View>
      </View>

      <LevelProgress level={profile.level} totalPoints={profile.totalPoints} />

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={24} color={Colors.accent} />
          <Text style={styles.statValue}>{profile.totalPoints}</Text>
          <Text style={styles.statLabel}>Очков</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{completedRoutes.length}</Text>
          <Text style={styles.statLabel}>Пройдено</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="map-outline" size={24} color={Colors.primaryLight} />
          <Text style={styles.statValue}>{Math.round(profile.totalDistance)}</Text>
          <Text style={styles.statLabel}>Км всего</Text>
        </View>
        <Pressable style={styles.statCard} onPress={() => setShowGallery(true)}>
          <Ionicons name="camera-outline" size={24} color={Colors.warning} />
          <Text style={styles.statValue}>{totalPhotos}</Text>
          <Text style={styles.statLabel}>Фото</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
          onPress={() => setActiveTab('achievements')}
        >
          <Ionicons
            name="trophy-outline"
            size={18}
            color={
              activeTab === 'achievements' ? Colors.textOnPrimary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'achievements' && styles.tabTextActive,
            ]}
          >
            Достижения
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'routes' && styles.tabActive]}
          onPress={() => setActiveTab('routes')}
        >
          <Ionicons
            name="map-outline"
            size={18}
            color={
              activeTab === 'routes' ? Colors.textOnPrimary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'routes' && styles.tabTextActive,
            ]}
          >
            Маршруты
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'wishlist' && styles.tabActive]}
          onPress={() => setActiveTab('wishlist')}
        >
          <Ionicons
            name="heart-outline"
            size={18}
            color={
              activeTab === 'wishlist' ? Colors.textOnPrimary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'wishlist' && styles.tabTextActive,
            ]}
          >
            Избранное
          </Text>
        </Pressable>
      </View>

      {activeTab === 'achievements' ? (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Достижения</Text>
            <Text style={styles.sectionSubtitle}>
              {unlockedCount} из {profile.achievements.length} получено
            </Text>
          </View>
          <View style={styles.achBar}>
            <View
              style={[
                styles.achBarFill,
                { width: `${(unlockedCount / profile.achievements.length) * 100}%` },
              ]}
            />
          </View>
          {profile.achievements.map((ach) => (
            <AchievementBadge key={ach.id} achievement={ach} />
          ))}
        </View>
      ) : activeTab === 'routes' ? (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Мои маршруты</Text>
            <Text style={styles.sectionSubtitle}>
              {completedRoutes.length} завершено
            </Text>
          </View>
          {completedRoutes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>Маршрутов пока нет</Text>
              <Text style={styles.emptySubtitle}>
                Открой карту и начни своё первое путешествие!
              </Text>
            </View>
          ) : (
            completedRoutes.map((rp) => {
              const route = ROUTES.find((r) => r.id === rp.routeId);
              if (!route) return null;
              return (
                <Pressable
                  key={rp.routeId}
                  style={styles.completedRoute}
                  onPress={() => router.push(`/route/${rp.routeId}`)}
                >
                  <View style={styles.completedRouteIcon}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                  </View>
                  <View style={styles.completedRouteInfo}>
                    <Text style={styles.completedRouteTitle}>{route.title}</Text>
                    <Text style={styles.completedRouteDate}>
                      {rp.completedAt
                        ? new Date(rp.completedAt).toLocaleDateString('ru-RU')
                        : ''}
                    </Text>
                  </View>
                  <Text style={styles.completedRoutePoints}>
                    +{rp.pointsEarned} pts
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      ) : (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Избранное</Text>
            <Text style={styles.sectionSubtitle}>
              {profile.wishlistedRouteIds.length} маршрут(ов)
            </Text>
          </View>
          {profile.wishlistedRouteIds.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>Нет избранных маршрутов</Text>
              <Text style={styles.emptySubtitle}>
                Нажмите ♡ на карточке маршрута, чтобы добавить его в избранное
              </Text>
            </View>
          ) : (
            profile.wishlistedRouteIds.map((routeId) => {
              const route = ROUTES.find((r) => r.id === routeId);
              if (!route) return null;
              return (
                <Pressable
                  key={routeId}
                  style={styles.wishlistRoute}
                  onPress={() => router.push(`/route/${routeId}`)}
                >
                  <View style={styles.wishlistRouteIcon}>
                    <Ionicons name="heart" size={20} color="#E53935" />
                  </View>
                  <View style={styles.completedRouteInfo}>
                    <Text style={styles.completedRouteTitle}>{route.title}</Text>
                    <Text style={styles.completedRouteDate}>
                      {route.duration} · {route.distance} км
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                </Pressable>
              );
            })
          )}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ─── Единый рендер с плавающей кнопкой темы ─────────────────────────────────
  return (
    <View style={styles.container}>
      <PhotoGallery visible={showGallery} onClose={() => setShowGallery(false)} />
      <PhoneAuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        onSuccess={loginAsTest}
      />

      {/* Плавающая кнопка темы — всегда в правом верхнем углу */}
      <Pressable style={styles.themeToggle} onPress={toggleTheme}>
        <Ionicons
          name={isDark ? 'sunny-outline' : 'moon-outline'}
          size={20}
          color={Colors.textSecondary}
        />
      </Pressable>

      {isAuthenticated ? authContent : unauthContent}
    </View>
  );
}

// ─── Стили ────────────────────────────────────────────────────────────────────

const hexToRgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const getStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    position: 'relative',
  },
  content: {
    paddingBottom: 20,
  },

  // ── Неавторизован ──
  unauthContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  unauthIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  unauthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  unauthSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    boxShadow: `0 4px 8px ${hexToRgba(C.primary, 0.3)}`,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: C.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.primaryLight,
    borderStyle: 'dashed',
  },
  testButtonText: {
    color: C.primaryLight,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: C.textSecondary,
    flex: 1,
  },

  // ── Авторизован ──
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: C.accent,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: C.surfaceAlt,
  },
  logoutText: {
    fontSize: 12,
    color: C.textSecondary,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  themeToggle: {
    position: 'absolute',
    top: 8,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    boxShadow: `0 2px 4px ${C.shadow}`,
    borderWidth: 1,
    borderColor: C.border,
  },

  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    boxShadow: `0 1px 4px ${C.shadow}`,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  statLabel: {
    fontSize: 11,
    color: C.textSecondary,
  },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
  tabTextActive: {
    color: C.textOnPrimary,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
  },
  achBar: {
    height: 8,
    backgroundColor: C.surfaceAlt,
    borderRadius: 4,
    marginBottom: 16,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  achBarFill: {
    height: '100%',
    backgroundColor: C.accent,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  completedRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    boxShadow: `0 1px 4px ${C.shadow}`,
  },
  completedRouteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedRouteInfo: {
    flex: 1,
  },
  completedRouteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  completedRouteDate: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
  completedRoutePoints: {
    fontSize: 14,
    fontWeight: '700',
    color: C.accent,
  },
  wishlistRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    boxShadow: `0 1px 4px ${C.shadow}`,
  },
  wishlistRouteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
