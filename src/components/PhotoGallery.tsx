import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';
import { ROUTE_PHOTOS } from '../data/routePhotos';
import { ROUTES } from '../data/routes';
import { useUser } from '../context/UserContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SPACING = 2;
const COLS = 3;
const IMAGE_SIZE = (SCREEN_WIDTH - GRID_SPACING * (COLS + 1)) / COLS;

function getRouteTitle(routeId: string): string {
  const route = ROUTES.find((r) => r.id === routeId);
  return route?.title.replace(/[❄️🎿]/g, '').trim() || routeId;
}

function resolveSource(photo: any): any {
  return typeof photo === 'string' ? { uri: photo } : photo;
}

interface PhotoGalleryProps {
  visible: boolean;
  onClose: () => void;
}

export default function PhotoGallery({ visible, onClose }: PhotoGalleryProps) {
  const [viewerIndex, setViewerIndex] = useState<{ routeIdx: number; photoIdx: number } | null>(null);
  const Colors = useThemeColors();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const { isAuthenticated, profile, addPhoto } = useUser();

  // Собираем все фото, сгруппированные по маршрутам
  const routeEntries = useMemo(() =>
    Object.entries(ROUTE_PHOTOS)
      .filter(([, photos]) => photos.length > 0)
      .map(([routeId, photos]) => {
        const progress = profile.routeProgress.find((r) => r.routeId === routeId);
        return {
          routeId,
          photos,
          title: getRouteTitle(routeId),
          collectedCount: progress?.photosCollected ?? 0,
          totalCount: photos.length,
        };
      }),
    [profile.routeProgress]
  );

  const allPhotos = useMemo(() =>
    routeEntries.flatMap((entry) =>
      entry.photos.map((photo, idx) => ({
        source: resolveSource(photo),
        routeTitle: entry.title,
        routeIdx: routeEntries.indexOf(entry),
        photoIdx: idx,
      }))
    ),
    [routeEntries]
  );

  const viewerPhoto = viewerIndex
    ? allPhotos.find(
        (p) => p.routeIdx === viewerIndex.routeIdx && p.photoIdx === viewerIndex.photoIdx
      )
    : null;

  const totalCollected = profile.routeProgress.reduce((sum, r) => sum + r.photosCollected, 0);
  const totalAvailable = allPhotos.length;
  const isFullCollection = totalCollected >= totalAvailable && totalAvailable > 0;

  const handleCollectPhoto = (routeId: string) => {
    if (!isAuthenticated) return;
    addPhoto(routeId);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Мои фотографии</Text>
            {isAuthenticated && (
              <Text style={styles.headerSubtitle}>
                {totalCollected} из {totalAvailable} собрано
              </Text>
            )}
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        </View>

        {/* Сводка по коллекции */}
        {isAuthenticated && totalAvailable > 0 && (
          <View style={styles.collectionBar}>
            <View style={styles.collectionBarBg}>
              <View
                style={[
                  styles.collectionBarFill,
                  { width: `${(totalCollected / totalAvailable) * 100}%` },
                  isFullCollection && styles.collectionBarFull,
                ]}
              />
            </View>
            <Text style={styles.collectionBarText}>
              {Math.round((totalCollected / totalAvailable) * 100)}%
            </Text>
          </View>
        )}

        <FlatList
          data={routeEntries}
          keyExtractor={(item) => item.routeId}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                {isAuthenticated && (
                  <Text style={styles.sectionCount}>
                    {item.collectedCount}/{item.totalCount}
                  </Text>
                )}
              </View>
              <View style={styles.grid}>
                {item.photos.map((photo, idx) => {
                  const isCollected = isAuthenticated && item.collectedCount > idx;
                  return (
                    <Pressable
                      key={idx}
                      style={styles.gridItem}
                      onPress={() => setViewerIndex({ routeIdx: routeEntries.indexOf(item), photoIdx: idx })}
                    >
                      <Image
                        source={resolveSource(photo)}
                        style={styles.gridImage}
                        resizeMode="cover"
                      />
                      {isCollected && (
                        <View style={styles.collectedOverlay}>
                          <Ionicons name="checkmark-circle" size={16} color="#FFD700" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Кнопка собрать фото */}
              {isAuthenticated && item.collectedCount < item.totalCount && (
                <Pressable
                  style={styles.collectSectionBtn}
                  onPress={() => handleCollectPhoto(item.routeId)}
                >
                  <Ionicons name="camera-outline" size={16} color={Colors.primaryLight} />
                  <Text style={styles.collectSectionBtnText}>
                    Собрать фото маршрута ({item.collectedCount}/{item.totalCount})
                  </Text>
                </Pressable>
              )}
              {isAuthenticated && item.collectedCount >= item.totalCount && (
                <View style={styles.collectSectionDone}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.collectSectionDoneText}>Все фото собраны</Text>
                </View>
              )}
            </View>
          )}
        />

        {/* Fullscreen viewer */}
        {viewerPhoto && (
          <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={() => setViewerIndex(null)}
          >
            <View style={styles.viewerOverlay}>
              <Pressable
                style={styles.viewerClose}
                onPress={() => setViewerIndex(null)}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
              <Text style={styles.viewerLabel}>{viewerPhoto.routeTitle}</Text>
              <Image
                source={viewerPhoto.source}
                style={styles.viewerImage}
                resizeMode="contain"
              />
              {/* Собрать фото из просмотрщика */}
              {isAuthenticated && viewerPhoto && (
                <Pressable
                  style={styles.viewerCollectBtn}
                  onPress={() => {
                    const entry = routeEntries[viewerPhoto.routeIdx];
                    if (entry) handleCollectPhoto(entry.routeId);
                  }}
                >
                  <Ionicons name="camera-outline" size={18} color="#fff" />
                  <Text style={styles.viewerCollectBtnText}>Собрать фото</Text>
                </Pressable>
              )}
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (C: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  collectionBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: C.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  collectionBarFill: {
    height: '100%',
    backgroundColor: C.accent,
    borderRadius: 4,
  },
  collectionBarFull: {
    backgroundColor: C.success,
  },
  collectionBarText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    width: 40,
    textAlign: 'right',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: C.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_SPACING,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: GRID_SPACING / 2,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: C.surfaceAlt,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  collectedOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectSectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.primaryLight,
    borderStyle: 'dashed',
  },
  collectSectionBtnText: {
    fontSize: 13,
    color: C.primaryLight,
    fontWeight: '600',
  },
  collectSectionDone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
  },
  collectSectionDoneText: {
    fontSize: 13,
    color: C.success,
    fontWeight: '600',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  viewerClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  viewerLabel: {
    position: 'absolute',
    top: 70,
    left: 20,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: SCREEN_WIDTH - 80,
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  viewerCollectBtn: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  viewerCollectBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
