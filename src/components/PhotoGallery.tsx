import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';
import { ROUTE_PHOTOS } from '../data/routePhotos';
import { ROUTES } from '../data/routes';

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
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  // Собираем все фото, сгруппированные по маршрутам
  const routeEntries = Object.entries(ROUTE_PHOTOS)
    .filter(([, photos]) => photos.length > 0)
    .map(([routeId, photos]) => ({ routeId, photos, title: getRouteTitle(routeId) }));

  const allPhotos = routeEntries.flatMap((entry) =>
    entry.photos.map((photo, idx) => ({
      source: resolveSource(photo),
      routeTitle: entry.title,
      routeIdx: routeEntries.indexOf(entry),
      photoIdx: idx,
    }))
  );

  const viewerPhoto = viewerIndex
    ? allPhotos.find(
        (p) => p.routeIdx === viewerIndex.routeIdx && p.photoIdx === viewerIndex.photoIdx
      )
    : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Фотографии маршрутов</Text>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        </View>

        <FlatList
          data={routeEntries}
          keyExtractor={(item) => item.routeId}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <View style={styles.grid}>
                {item.photos.map((photo, idx) => (
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
                  </Pressable>
                ))}
              </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
});
