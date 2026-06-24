import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Route } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LeafletMapWebProps {
  routes: Route[];
  selectedRouteId?: string | null;
  onMarkerPress?: (routeId: string) => void;
  style?: any;
}

// Тип для window.L из Leaflet CDN
declare global {
  interface Window {
    L: any;
  }
}

type LeafletInstance = any;

/**
 * Запрашивает реальный дорожный маршрут через OSRM (OpenStreetMap Routing).
 * Превращает набор точек в путь, следующий по дорогам.
 */
async function fetchOSRMPath(
  coords: { latitude: number; longitude: number }[]
): Promise<number[][] | null> {
  if (coords.length < 2) return null;

  const coordStr = coords.map((c) => `${c.longitude},${c.latitude}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?geometries=geojson&overview=full&alternatives=false&steps=false`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
      // OSRM возвращает [lng, lat], конвертируем в [lat, lng]
      return data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
    }
  } catch (e) {
    console.warn('[OSRM] Routing failed:', e);
  }
  return null;
}

export default function LeafletMapWeb({
  routes,
  selectedRouteId,
  onMarkerPress,
  style,
}: LeafletMapWebProps) {
  const { colors, isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletInstance>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const initializedRef = useRef(false);

  // OSRM кэш
  const [osrmPaths, setOsrmPaths] = useState<Record<string, number[][]>>({});
  const [osrmLoading, setOsrmLoading] = useState<Record<string, boolean>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // ─── 1. Загружаем Leaflet + MarkerCluster с CDN ──────────────────────────
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const pendingElements: (HTMLElement | SVGElement)[] = [];

    function addCSS(href: string) {
      const el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = href;
      document.head.appendChild(el);
      pendingElements.push(el);
    }

    function addScript(src: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src;
        el.onload = () => resolve();
        el.onerror = () => reject();
        document.body.appendChild(el);
        pendingElements.push(el);
      });
    }

    // Leaflet CSS
    addCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    // MarkerCluster CSS
    addCSS('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css');
    addCSS('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css');

    // Грузим Leaflet → затем MarkerCluster (нужен L)
    addScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
      .then(() => addScript('https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'))
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));

    return () => {
      pendingElements.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ─── 2. Инициализируем карту ──────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'ready' || !containerRef.current || mapRef.current) return;

    const L = window.L;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
      maxZoom: 18,
      minZoom: 3,
    });
    mapRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Сброс карты при первом рендере → invalidateSize
    requestAnimationFrame(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    drawRoutes(L, map, routes, selectedRouteId || null, onMarkerPress, isDark, osrmPaths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, routes, selectedRouteId, onMarkerPress, isDark]);

  // ─── 3. Запрашиваем OSRM маршруты ─────────────────────────────────────────
  useEffect(() => {
    if (status !== 'ready') return;

    for (const route of routes) {
      if (fetchingRef.current.has(route.id) || osrmPaths[route.id]) continue;
      if (route.coordinates.length < 2) continue;

      fetchingRef.current.add(route.id);
      setOsrmLoading((prev) => ({ ...prev, [route.id]: true }));

      fetchOSRMPath(route.coordinates).then((path) => {
        setOsrmPaths((prev) => ({ ...prev, [route.id]: path ?? [] }));
        setOsrmLoading((prev) => ({ ...prev, [route.id]: false }));
      });
    }
  }, [status, routes, osrmPaths]);

  // ─── 4. Обновляем маршруты при изменении пропсов или OSRM путей ────────────
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;

    const L = window.L;
    const map = mapRef.current;

    // Удаляем все слои, кроме подложки (TileLayer)
    const layersToRemove: any[] = [];
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) return;
      layersToRemove.push(layer);
    });
    layersToRemove.forEach((layer) => map.removeLayer(layer));

    drawRoutes(L, map, routes, selectedRouteId || null, onMarkerPress, isDark, osrmPaths);
  }, [routes, selectedRouteId, onMarkerPress, status, isDark, osrmPaths]);

  // ─── 5. Resize handler ────────────────────────────────────────────────────
  const handleLayout = useCallback(() => {
    if (mapRef.current) {
      requestAnimationFrame(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      });
    }
  }, []);

  // Считаем, сколько маршрутов ещё грузятся
  const loadingCount = routes.filter((r) => osrmLoading[r.id]).length;

  return (
    <View style={[styles.container, style]}>
      {(status === 'loading' || status === 'error') && (
        <View style={[styles.statusOverlay, { backgroundColor: colors.surfaceAlt }]}>
          <ActivityIndicator size="large" color={status === 'error' ? colors.error : colors.primary} />
        </View>
      )}
      {loadingCount > 0 && (
        <View style={[styles.osrmLoadingBadge, { backgroundColor: colors.surfaceAlt }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.osrmLoadingText, { color: colors.textSecondary }]}>
            Загружаем маршруты по дорогам...
          </Text>
        </View>
      )}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

// ─── Отрисовка маршрутов ──────────────────────────────────────────────────────
function drawRoutes(
  L: any,
  map: any,
  routes: Route[],
  selectedRouteId: string | null,
  onMarkerPress?: (routeId: string) => void,
  isDark?: boolean,
  osrmPaths?: Record<string, number[][]>,
) {
  if (!routes.length) {
    map.setView([52.2, 86.8], 7);
    return;
  }

  const routeColor = '#0D7C5F';
  const routeColorActive = '#F4A261';
  const tagBg = isDark ? '#333' : '#fff';
  const tagColor = isDark ? '#10A070' : '#0D7C5F';
  const popupTitleColor = isDark ? '#E8E8E8' : '#0D7C5F';

  const allCoords: number[][] = [];
  const poiClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
  });
  map.addLayer(poiClusterGroup);

  for (const route of routes) {
    if (!route.coordinates?.length) continue;

    const latlngs = route.coordinates.map((c) => {
      const ll: number[] = [c.latitude, c.longitude];
      allCoords.push(ll);
      return ll;
    });

    const isSelected = route.id === selectedRouteId;
    const color = isSelected ? routeColorActive : routeColor;
    const weight = isSelected ? 5 : 3;

    // Используем OSRM путь (по дорогам), если доступен, иначе — Catmull-Rom сглаживание
    const osrmPath = osrmPaths?.[route.id];
    const polylinecoords = osrmPath?.length
      ? osrmPath
      : latlngs.length > 2
        ? catmullRomSpline(latlngs, 20)
        : latlngs;

    if (isSelected && osrmPath?.length) {
      // Выделенный маршрут: добавляем подсветку (две линии — толстая полупрозрачная для свечения)
      L.polyline(polylinecoords, {
        color,
        weight: weight + 6,
        opacity: 0.15,
      }).addTo(map);
    }

    L.polyline(polylinecoords, {
      color,
      weight: isSelected ? 6 : 3,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: isSelected ? null : '10 5',
    }).addTo(map);

    // Стартовый маркер
    const startMarker = L.marker(latlngs[0], {
      icon: L.divIcon({
        html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '',
      }),
    }).addTo(map);

    startMarker.bindTooltip(route.title, { direction: 'top', offset: [0, -12] });
    startMarker.on('click', () => onMarkerPress?.(route.id));

    // POI маркеры
    for (const poi of route.pointsOfInterest) {
      const emoji = getPOIEemoji(poi.category);

      const poiMarker = L.marker([poi.latitude, poi.longitude], {
        icon: L.divIcon({
          html: `<div style="background:${tagBg};border:2px solid ${tagColor};border-radius:20px;padding:2px 6px;font-size:11px;font-family:sans-serif;font-weight:600;color:${tagColor};white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);cursor:pointer;">${emoji} ${poi.name}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
          className: '',
        }),
      });
      poiClusterGroup.addLayer(poiMarker);

      poiMarker.bindTooltip(poi.name, { direction: 'top' });
      poiMarker.bindPopup(buildPopupContent(poi, emoji, isDark), {
        maxWidth: 300,
        minWidth: 220,
        className: 'route-poi-popup',
      });
    }
  }

  // Подгоняем обзор под все маршруты
  if (allCoords.length > 1) {
    map.fitBounds(allCoords, { padding: [50, 50], maxZoom: 10 });
  } else if (allCoords.length === 1) {
    map.setView(allCoords[0], 10);
  }
}

// ─── Catmull-Rom сплайн (резерв для случаев без OSRM) ─────────────────────────
function catmullRomSpline(points: number[][], segmentsPerSegment: number = 20): number[][] {
  if (points.length < 3) return points;

  const result: number[][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    for (let j = 0; j < segmentsPerSegment; j++) {
      const t = j / segmentsPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);

      const y =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);

      result.push([y, x]);
    }
  }

  result.push(points[points.length - 1]);
  return result;
}

// ─── Вспомогательные функции для POI ────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  natural: 'Природная достопримечательность',
  cultural: 'Культурный объект',
  gastronomic: 'Гастрономия',
  active: 'Активный отдых',
  event: 'Событие',
};

function getPOIEemoji(category: string): string {
  switch (category) {
    case 'gastronomic': return '\u{1F37D}';
    case 'active': return '⛰';
    case 'cultural': return '\u{1F3DB}';
    case 'natural': return '\u{1F332}';
    default: return '\u{1F4CD}';
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildPopupContent(poi: any, emoji: string, isDark?: boolean): string {
  const label = CATEGORY_LABELS[poi.category] || 'Достопримечательность';
  const titleColor = isDark ? '#E8E8E8' : '#0D7C5F';
  const descColor = isDark ? '#9E9E9E' : '#4B5563';
  const imageBlock = poi.imageUrl
    ? `<img src="${escapeHtml(poi.imageUrl)}" alt="${escapeHtml(poi.name)}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:8px;" onerror="this.style.display='none'" />`
    : '';

  return `\
<div style="font-family:sans-serif;min-width:200px;max-width:280px;">
  ${imageBlock}
  <div style="font-size:15px;font-weight:700;color:${titleColor};margin-bottom:4px;">${escapeHtml(poi.name)}</div>
  <div style="font-size:11px;color:#6B7280;margin-bottom:8px;">${emoji} ${escapeHtml(label)}</div>
  <div style="font-size:13px;color:${descColor};line-height:1.5;">${escapeHtml(poi.description)}</div>
</div>`;
}

// ─── Стили ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  statusOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  osrmLoadingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 20,
    opacity: 0.9,
  },
  osrmLoadingText: {
    fontSize: 12,
  },
});
