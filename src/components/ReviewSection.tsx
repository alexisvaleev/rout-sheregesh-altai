import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';
import { Review } from '../types';

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (text: string, rating: number) => void;
}

const AVATAR_COLORS = ['#0D7C5F', '#F4A261', '#5BA3D9', '#B366CC', '#CD7F32'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function StarRating({
  rating,
  size = 14,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const Colors = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onRate?.(star)} disabled={!interactive}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? Colors.accent : Colors.textSecondary}
          />
        </Pressable>
      ))}
    </View>
  );
}

export default function ReviewSection({ reviews, onAddReview }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const Colors = useThemeColors();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = () => {
    if (newText.trim().length < 2) return;
    onAddReview(newText.trim(), newRating);
    setNewText('');
    setNewRating(5);
    setShowForm(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Отзывы</Text>
        <Pressable style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={18} color={Colors.textOnPrimary} />
          <Text style={styles.addButtonText}>{showForm ? 'Закрыть' : 'Написать'}</Text>
        </Pressable>
      </View>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryRating}>{avgRating.toFixed(1)}</Text>
          <View style={styles.summaryRight}>
            <StarRating rating={Math.round(avgRating)} size={16} />
            <Text style={styles.summaryCount}>{reviews.length} отзыва(ов)</Text>
          </View>
        </View>
      )}

      {/* Add review form */}
      {showForm && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.form}>
            <Text style={styles.formLabel}>Ваша оценка</Text>
            <StarRating rating={newRating} size={28} interactive onRate={setNewRating} />
            <TextInput
              style={styles.formInput}
              placeholder="Напишите отзыв..."
              placeholderTextColor={Colors.textSecondary}
              value={newText}
              onChangeText={setNewText}
              multiline
              numberOfLines={3}
            />
            <Pressable
              style={[styles.submitButton, newText.trim().length < 2 && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={newText.trim().length < 2}
            >
              <Text style={styles.submitButtonText}>Отправить</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Reviews list */}
      {reviews.length === 0 && !showForm ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>Пока нет отзывов</Text>
          <Text style={styles.emptySubtext}>Будьте первым, кто оставит отзыв!</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View
                style={[styles.avatar, { backgroundColor: getAvatarColor(review.author) }]}
              >
                <Text style={styles.avatarText}>{getInitials(review.author)}</Text>
              </View>
              <View style={styles.reviewAuthorInfo}>
                <Text style={styles.reviewAuthor}>{review.author}</Text>
                <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
              </View>
              <StarRating rating={review.rating} size={12} />
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const getStyles = (C: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      marginTop: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: C.text,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: C.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    addButtonText: {
      color: C.textOnPrimary,
      fontSize: 13,
      fontWeight: '600',
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    summaryRating: {
      fontSize: 36,
      fontWeight: '800',
      color: C.accent,
    },
    summaryRight: {
      gap: 4,
    },
    summaryCount: {
      fontSize: 12,
      color: C.textSecondary,
    },
    form: {
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      gap: 10,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: C.text,
    },
    formInput: {
      backgroundColor: C.surfaceAlt,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: C.text,
      borderWidth: 1,
      borderColor: C.border,
      minHeight: 70,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: C.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      color: C.textOnPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    empty: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 6,
    },
    emptyText: {
      fontSize: 15,
      color: C.textSecondary,
      fontWeight: '600',
    },
    emptySubtext: {
      fontSize: 13,
      color: C.textSecondary,
    },
    reviewCard: {
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    reviewAuthorInfo: {
      flex: 1,
    },
    reviewAuthor: {
      fontSize: 14,
      fontWeight: '600',
      color: C.text,
    },
    reviewDate: {
      fontSize: 11,
      color: C.textSecondary,
      marginTop: 1,
    },
    reviewText: {
      fontSize: 14,
      lineHeight: 20,
      color: C.text,
    },
  });
