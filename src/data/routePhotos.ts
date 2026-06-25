/**
 * Фото для галереи маршрутов.
 *
 * Как добавить фото:
 * 1. Положите JPG/PNG в assets/photos/
 *    Именование: {id-маршрута}-{номер}.jpg
 *    Пример: route-1-1.jpg, route-1-2.jpg
 * 2. Зарегистрируйте их здесь, добавив require() в массив соответствующего маршрута.
 * 3. Фото автоматически появятся в карусели на детальном экране маршрута.
 *
 * Вместо require() можно использовать URL-строки для внешних изображений.
 */

export const ROUTE_PHOTOS: Record<string, any[]> = {
  // ─── Две легенды Сибири ─────────────────────────────
  'route-1': [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=500&fit=crop',
  ],

  // ─── Первое знакомство с Сибирью ─────────────────────
  'route-2': [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-1b3ec3b75c6e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop',
  ],

  // ─── Алтай за 3 дня ─────────────────────────────────
  'route-3': [
    'https://images.unsplash.com/photo-1486911278844-a81c83964700?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1518495973-e2a21d63e4a9?w=800&h=500&fit=crop',
  ],

  // ─── ❄️ Зимний тур «Первое знакомство с Сибирью» ────
  'route-4': [
    'https://images.unsplash.com/photo-1478265409131-1f941d75671e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1457264635006-5c7138f0cf73?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop',
  ],

  // ─── ❄️ Зимний тур «Алтай за 3 дня» ─────────────────
  'route-5': [
    'https://images.unsplash.com/photo-1516663713099-37eb6d60c825?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&h=500&fit=crop',
  ],

  // ─── 🎿 Grelka Fest ─────────────────────────────────
  'route-6': [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&h=500&fit=crop',
  ],
};

/** Мини-фото для секции стоимости в карточке маршрута */
export const ROUTE_PRICING_IMAGES: Record<string, any> = {
  'route-1': require('../../photos/большое путешествие алтай-шерегеш стоимость.jpg'),
  'route-2': require('../../photos/первое знакомство с сибирью стоимость.jpg'),
  'route-3': require('../../photos/алтай за 3 дня стоимость.jpg'),
  'route-4': require('../../photos/первое знакомство с сибирью стоимость.jpg'),
  'route-5': require('../../photos/алтай за 3 дня стоимость.jpg'),
};
