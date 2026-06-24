import { Achievement } from '../types';

export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'ach-1',
    title: 'Первые шаги',
    description: 'Завершите свой первый маршрут',
    icon: 'compass',
    requirement: 'Завершить 1 маршрут',
    points: 100,
  },
  {
    id: 'ach-2',
    title: 'Исследователь',
    description: 'Завершите 3 разных маршрута',
    icon: 'map',
    requirement: 'Завершить 3 маршрута',
    points: 300,
  },
  {
    id: 'ach-3',
    title: 'Сибирский странник',
    description: 'Пройдите все маршруты в приложении',
    icon: 'mountain',
    requirement: 'Завершить все маршруты',
    points: 1000,
  },
  {
    id: 'ach-4',
    title: 'Фотоохотник',
    description: 'Сделайте фото в 5 разных точках маршрутов',
    icon: 'camera',
    requirement: '5 фотографий в точках маршрута',
    points: 200,
  },
  {
    id: 'ach-5',
    title: 'Сто километров',
    description: 'Преодолейте суммарно 100 км по маршрутам',
    icon: 'trophy',
    requirement: 'Суммарная дистанция 100 км',
    points: 500,
  },
  {
    id: 'ach-6',
    title: 'Пятьсот километров',
    description: 'Преодолейте суммарно 500 км по маршрутам',
    icon: 'star',
    requirement: 'Суммарная дистанция 500 км',
    points: 1500,
  },
  {
    id: 'ach-7',
    title: 'Все сезоны',
    description: 'Пройдите хотя бы по одному маршруту каждого сезона',
    icon: 'fire',
    requirement: 'Маршруты всех сезонов',
    points: 400,
  },
  {
    id: 'ach-8',
    title: 'Гастроном',
    description: 'Посетите 3 гастрономические точки',
    icon: 'award',
    requirement: '3 гастрономических точки',
    points: 250,
  },
];

export const LEVELS = [
  { level: 1, title: 'Путник', minPoints: 0, color: '#CD7F32' },
  { level: 2, title: 'Путешественник', minPoints: 500, color: '#A0A0A0' },
  { level: 3, title: 'Исследователь Сибири', minPoints: 1500, color: '#F4A261' },
  { level: 4, title: 'Покоритель вершин', minPoints: 3500, color: '#5BA3D9' },
  { level: 5, title: 'Легенда Шерегеша — Алтая', minPoints: 7000, color: '#B366CC' },
];
