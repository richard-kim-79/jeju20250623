import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { signup } = useAuth();

  // 비밀번호 정책 검증
  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    return {
      isValid: Object.values(checks).every(Boolean),
      checks
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 정책 검증
    if (!passwordValidation.isValid) {
      Alert.alert('오류', '비밀번호가 정책을 만족하지 않습니다.\n\n- 최소 8자 이상\n- 소문자 포함\n- 대문자 포함\n- 숫자 포함\n- 특수문자 포함');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, username);
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      Alert.alert(
        '회원가입 실패',
        error.response?.data?.message || '회원가입에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>제주</Text>
          <Text style={styles.subtitle}>지역 정보 공유 SNS</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>회원가입</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="사용자명"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* 비밀번호 정책 힌트 */}
          {password && (
            <View style={styles.passwordHintContainer}>
              <Text style={styles.passwordHintTitle}>비밀번호 정책:</Text>
              <View style={styles.passwordHintList}>
                <Text style={[styles.passwordHintItem, passwordValidation.checks.length && styles.passwordHintValid]}>
                  {passwordValidation.checks.length ? '✓' : '✗'} 최소 8자 이상
                </Text>
                <Text style={[styles.passwordHintItem, passwordValidation.checks.lowercase && styles.passwordHintValid]}>
                  {passwordValidation.checks.lowercase ? '✓' : '✗'} 소문자 포함
                </Text>
                <Text style={[styles.passwordHintItem, passwordValidation.checks.uppercase && styles.passwordHintValid]}>
                  {passwordValidation.checks.uppercase ? '✓' : '✗'} 대문자 포함
                </Text>
                <Text style={[styles.passwordHintItem, passwordValidation.checks.number && styles.passwordHintValid]}>
                  {passwordValidation.checks.number ? '✓' : '✗'} 숫자 포함
                </Text>
                <Text style={[styles.passwordHintItem, passwordValidation.checks.special && styles.passwordHintValid]}>
                  {passwordValidation.checks.special ? '✓' : '✗'} 특수문자 포함
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.signupButton, (loading || !passwordValidation.isValid) && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading || !passwordValidation.isValid}
          >
            <Text style={styles.signupButtonText}>
              {loading ? '가입 중...' : '회원가입'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  passwordInput: {
    paddingRight: 40,
  },
  passwordToggle: {
    padding: 8,
    marginRight: 8,
  },
  passwordHintContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  passwordHintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordHintList: {
    gap: 4,
  },
  passwordHintItem: {
    fontSize: 12,
    color: '#dc3545',
  },
  passwordHintValid: {
    color: '#28a745',
  },
  signupButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonDisabled: {
    backgroundColor: '#ccc',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
}); 