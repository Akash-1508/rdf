import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth/authService';

type ScreenType =
  | 'Dashboard'
  | 'Animals'
  | 'Milk'
  | 'Chara'
  | 'Profit/Loss'
  | 'Login/Signup'
  | 'Signup';

interface LoginScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onLoginSuccess?: () => void;
}

/**
 * Login Screen
 * User authentication - Login functionality
 */
export default function LoginScreen({ onNavigate, onLoginSuccess }: LoginScreenProps) {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!emailOrMobile || !password) {
      Alert.alert('Error', 'Please enter email/mobile and password');
      return;
    }
    try {
      setLoading(true);
      await authService.login(emailOrMobile.trim(), password);
      // Call onLoginSuccess callback to update authentication state
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        onNavigate('Dashboard');
      }
    } catch (e: any) {
      Alert.alert('Login failed', e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const goToSignup = () => {
    onNavigate('Signup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dairy Farm Management</Text>
        <Text style={styles.headerSubtitle}>Login</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <Input
          placeholder="Email or Mobile Number"
          autoCapitalize="none"
          keyboardType="default"
          value={emailOrMobile}
          onChangeText={setEmailOrMobile}
          style={styles.input}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Button title={loading ? 'Logging in...' : 'Login'} onPress={onLogin} disabled={loading} />
        <View style={{ height: 16 }} />
        <Button title="Go to Signup" onPress={goToSignup} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F5E9',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
});

