import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import HeaderWithMenu from '../../components/common/HeaderWithMenu';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth/authService';

type ScreenType =
  | 'Dashboard'
  | 'Animals'
  | 'Milk'
  | 'Chara'
  | 'Profit/Loss'
  | 'Login/Signup';

interface LoginScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

/**
 * Login Screen
 * User authentication - Login functionality
 */
export default function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      await authService.login(email.trim(), password);
      onNavigate('Dashboard');
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
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Login/Signup"
        onNavigate={onNavigate}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <Input
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
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

