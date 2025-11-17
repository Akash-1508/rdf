import React, { useState } from 'react';
import { TextInput, StyleSheet, ViewStyle, TextInputProps, View, TouchableOpacity, Text } from 'react-native';

interface InputProps extends TextInputProps {
  style?: ViewStyle;
  showPasswordToggle?: boolean;
}

/**
 * Common Input Component
 * Reusable text input component with optional password visibility toggle
 */
export default function Input({ style, showPasswordToggle, secureTextEntry, ...props }: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (showPasswordToggle && secureTextEntry) {
    return (
      <View style={[styles.inputContainer, style]}>
        <TextInput
          style={styles.input}
          secureTextEntry={!isPasswordVisible}
          {...props}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Text style={styles.eyeIcon}>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <TextInput style={[styles.input, style]} secureTextEntry={secureTextEntry} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingRight: 12,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
});

