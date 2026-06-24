import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../constants/themes';

interface PhoneAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function formatPhone(text: string): string {
  // Strip everything except digits
  const digits = text.replace(/\D/g, '');
  // Limit to 11 digits (Russia: 7 XXX XXX XX XX)
  const trimmed = digits.slice(0, 11);

  if (trimmed.length === 0) return '';

  let formatted = '+7';
  if (trimmed.length > 1) formatted += ' ' + trimmed.slice(1, 4);
  if (trimmed.length > 4) formatted += ' ' + trimmed.slice(4, 7);
  if (trimmed.length > 7) formatted += '-' + trimmed.slice(7, 9);
  if (trimmed.length > 9) formatted += '-' + trimmed.slice(9, 11);

  return formatted;
}

function formatCode(text: string): string {
  const digits = text.replace(/\D/g, '');
  return digits.slice(0, 4);
}

export default function PhoneAuthModal({
  visible,
  onClose,
  onSuccess,
}: PhoneAuthModalProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const codeRef = useRef<TextInput>(null);
  const Colors = useThemeColors();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length === 11;

  const handleSendCode = () => {
    if (!isPhoneValid) return;
    setLoading(true);
    setError('');

    // Имитация отправки SMS
    setTimeout(() => {
      setLoading(false);
      setStep('code');
      setTimeout(() => codeRef.current?.focus(), 200);
    }, 1000);
  };

  const handleVerifyCode = () => {
    if (code.length < 4) return;
    setLoading(true);
    setError('');

    // Имитация проверки кода (заглушка)
    setTimeout(() => {
      setLoading(false);
      onSuccess?.();
      handleClose();
    }, 800);
  };

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setError('');
    onClose();
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    // If user starts typing without +7, prepend it
    if (digits.length <= 1 && digits !== '7') {
      setPhone('+7');
    } else if (digits.length <= 1 && digits === '7') {
      setPhone('+7');
    } else {
      setPhone(formatPhone(digits));
    }
    setError('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.sheet}>
                {/* Handle */}
                <View style={styles.handleBar} />

                {/* Close */}
                <Pressable style={styles.closeButton} onPress={handleClose}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </Pressable>

                {/* Icon */}
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={32}
                    color={Colors.primary}
                  />
                </View>

                {/* Title */}
                <Text style={styles.title}>
                  {step === 'phone' ? 'Авторизация' : 'Подтверждение'}
                </Text>
                <Text style={styles.subtitle}>
                  {step === 'phone'
                    ? 'Введите номер телефона для оплаты тура'
                    : `Введите код из SMS, отправленный на\n${phone}`}
                </Text>

                {/* Error */}
                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Phone input */}
                {step === 'phone' && (
                  <>
                    <View style={[styles.inputContainer, phone ? styles.inputActive : null]}>
                      <TextInput
                        style={styles.input}
                        placeholder="+7 999 999-99-99"
                        placeholderTextColor={Colors.textSecondary}
                        value={phone}
                        onChangeText={handlePhoneChange}
                        keyboardType="phone-pad"
                        autoFocus
                      />
                    </View>

                    <Pressable
                      style={[
                        styles.primaryButton,
                        !isPhoneValid && styles.buttonDisabled,
                      ]}
                      disabled={!isPhoneValid || loading}
                      onPress={handleSendCode}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.textOnPrimary} />
                      ) : (
                        <>
                          <Ionicons name="send-outline" size={18} color={Colors.textOnPrimary} />
                          <Text style={styles.primaryButtonText}>Получить код</Text>
                        </>
                      )}
                    </Pressable>
                  </>
                )}

                {/* Code input */}
                {step === 'code' && (
                  <>
                    <View style={[styles.inputContainer, code ? styles.inputActive : null]}>
                      <TextInput
                        ref={codeRef}
                        style={[styles.input, styles.codeInput]}
                        placeholder="XXXX"
                        placeholderTextColor={Colors.textSecondary}
                        value={code}
                        onChangeText={(t) => {
                          setCode(formatCode(t));
                          setError('');
                        }}
                        keyboardType="number-pad"
                        maxLength={4}
                        autoFocus
                      />
                    </View>

                    <Pressable
                      style={[
                        styles.primaryButton,
                        code.length < 4 && styles.buttonDisabled,
                      ]}
                      disabled={code.length < 4 || loading}
                      onPress={handleVerifyCode}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.textOnPrimary} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textOnPrimary} />
                          <Text style={styles.primaryButtonText}>Подтвердить</Text>
                        </>
                      )}
                    </Pressable>

                    {/* Back to phone */}
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => {
                        setStep('phone');
                        setCode('');
                        setError('');
                      }}
                    >
                      <Text style={styles.secondaryButtonText}>Изменить номер</Text>
                    </Pressable>
                  </>
                )}

                {/* Legal note */}
                <Text style={styles.legal}>
                  Продолжая, вы соглашаетесь с условиями обработки персональных данных
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const hexToRgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const getStyles = (C: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceAlt,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: C.error,
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputActive: {
    borderColor: C.primary,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: C.text,
    paddingVertical: 16,
    letterSpacing: 1,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 12,
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
  },
  primaryButtonText: {
    color: C.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    paddingVertical: 12,
    marginTop: 4,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: C.primaryLight,
    fontWeight: '600',
  },
  legal: {
    fontSize: 11,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
