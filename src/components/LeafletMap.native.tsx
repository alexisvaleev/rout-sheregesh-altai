import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Route } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LeafletMapNativeProps {
  routes: Route[];
  selectedRouteId?: string | null;
  onMarkerPress?: (routeId: string) => void;
  style?: any;
}

const TILE_SERVER = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const COPYRIGHT = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function generateHTML(routes: Route[], selectedRouteId: string | null, isDark: boolean): string {
  const routeColor = '#0D7C5F';
  const routeColorActive = '#F4A261';
  const bgColor = isDark ? '#1E1E1E' : '#E9ECEF';
  const textColor = isDark ? '#10A070' : '#0D7C5F';
  const popupTagBg = isDark ? '#333' : '#fff';
  const popupTagColor = isDark ? '#10A070' : '#0D7C5F';
  const popupTitleColor = isDark ? '#E8E8E8' : '#0D7C5F';

  const routesJson = JSON.stringify(routes.map(r => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    coordinates: r.coordinates,
    points: r.pointsOfInterest.map(p => ({
      id: p.id,
      name: p.name,
      latitude: p.latitude,
      longitude: p.longitude,
      category: p.category,
    })),
    color: r.id === selectedRouteId ? routeColorActive : routeColor,
    width: r.id === selectedRouteId ? 5 : 3,
    dash: r.id === selectedRouteId ? [] : [10, 5],
  })));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: ${bgColor}; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var ROUTES = ${routesJson};
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer('${TILE_SERVER}', {
      maxZoom: 18,
      attribution: '${COPYRIGHT}',
    }).addTo(map);

    if (!ROUTES.length) {
      map.setView([52.2, 86.8], 7);
      document.body.style.background = '${bgColor}';
    } else {
      var allCoords = [];
      var poiCluster = L.markerClusterGroup({
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });
      map.addLayer(poiCluster);
      ROUTES.forEach(function(route) {
        if (!route.coordinates || route.coordinates.length < 2) return;
        var latlngs = route.coordinates.map(function(c) {
          var ll = [c.latitude, c.longitude];
          allCoords.push(ll);
          return ll;
        });
        var polyline = L.polyline(latlngs, {
          color: route.color,
          weight: route.width,
          opacity: 0.9,
          dashArray: route.dash.length ? '10 5' : null,
        }).addTo(map);

        // Start marker
        var start = latlngs[0];
        var icon = L.divIcon({
          html: '<div style="background:' + route.color + ';width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          className: ''
        });
        var marker = L.marker(start, { icon: icon }).addTo(map);
        marker.bindTooltip(route.title, { direction: 'top', offset: [0, -12] });
        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', routeId: route.id }));
          }
        });

        // POI markers
        if (route.points) {
          route.points.forEach(function(poi) {
            var emoji = poi.category === 'gastronomic' ? '\u{1F37D}' :
              poi.category === 'active' ? '⛰' :
              poi.category === 'cultural' ? '\u{1F3DB}' :
              poi.category === 'natural' ? '\u{1F332}' : '\u{1F4CD}';
            var catLabel = poi.category === 'natural' ? 'Природная достопримечательность' :
              poi.category === 'cultural' ? 'Культурный объект' :
              poi.category === 'gastronomic' ? 'Гастрономия' :
              poi.category === 'active' ? 'Активный отдых' :
              poi.category === 'event' ? 'Событие' : 'Достопримечательность';
            var imgBlock = poi.imageUrl
              ? '<img src="' + encodeURI(poi.imageUrl) + '" alt="' + poi.name.replace(/"/g,'&quot;') + '" style="width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:8px;" onerror="this.style.display=\'none\'" />'
              : '';
            var popupHtml = '<div style="font-family:sans-serif;min-width:200px;max-width:280px;">' +
              imgBlock +
              '<div style="font-size:15px;font-weight:700;color:${popupTitleColor};margin-bottom:4px;">' + poi.name.replace(/</g,'&lt;') + '</div>' +
              '<div style="font-size:11px;color:#6B7280;margin-bottom:8px;">' + emoji + ' ' + catLabel.replace(/</g,'&lt;') + '</div>' +
              '<div style="font-size:13px;color:#9E9E9E;line-height:1.5;">' + poi.description.replace(/</g,'&lt;') + '</div>' +
              '</div>';

            var poiIcon = L.divIcon({
              html: '<div style="background:${popupTagBg};border:2px solid ${popupTagColor};border-radius:20px;padding:2px 6px;font-size:11px;font-family:sans-serif;font-weight:600;color:${popupTagColor};white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);cursor:pointer;">' + emoji + ' ' + poi.name + '</div>',
              iconSize: [0, 0],
              iconAnchor: [0, 0],
              className: ''
            });
            var poiMarker = L.marker([poi.latitude, poi.longitude], { icon: poiIcon });
            poiCluster.addLayer(poiMarker);
            poiMarker.bindTooltip(poi.name, { direction: 'top' });
            poiMarker.bindPopup(popupHtml, { maxWidth: 300, minWidth: 220 });
          });
        }
      });

      // Fit map to bounds
      if (allCoords.length > 1) {
        map.fitBounds(allCoords, { padding: [50, 50], maxZoom: 10 });
      } else if (allCoords.length === 1) {
        map.setView(allCoords[0], 10);
      }
    }
  </script>
</body>
</html>`;
}

export default function LeafletMapNative({
  routes,
  selectedRouteId,
  onMarkerPress,
  style,
}: LeafletMapNativeProps) {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef<WebView>(null);

  const html = useMemo(
    () => generateHTML(routes, selectedRouteId || null, isDark),
    [routes, selectedRouteId, isDark]
  );

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && data.routeId) {
        onMarkerPress?.(data.routeId);
      }
    } catch (e) {
      // ignore
    }
  }, [onMarkerPress]);

  // Invalidate map size on load to fix rendering
  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    webviewRef.current?.injectJavaScript(`
      if (window.map) { setTimeout(function() { map.invalidateSize(); }, 100); }
      true;
    `);
  }, []);

  // Пересчитываем размер карты при изменении лейаута (например, после возврата
  // с детальной страницы тура)
  const handleLayout = useCallback(() => {
    webviewRef.current?.injectJavaScript(`
      if (window.map) { setTimeout(function() { map.invalidateSize(); }, 50); }
      true;
    `);
  }, []);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {loading && (
        <View style={[styles.loading, { backgroundColor: colors.surfaceAlt }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Загрузка карты...</Text>
        </View>
      )}
      <WebView
        ref={webviewRef}
        style={styles.webview}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
});
