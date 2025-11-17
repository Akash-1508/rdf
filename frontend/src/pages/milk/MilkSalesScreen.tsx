import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HeaderWithMenu from '../../components/common/HeaderWithMenu';

type ScreenType =
  | 'Dashboard'
  | 'Animal Sales'
  | 'Animal Purchase'
  | 'Milk Sales'
  | 'Milk Purchase'
  | 'Chara Purchase'
  | 'Daily Consumption'
  | 'Profit/Loss'
  | 'Login/Signup';

interface MilkSalesScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

/**
 * Milk Sales Screen
 * Manage milk sales transactions
 */
export default function MilkSalesScreen({ onNavigate }: MilkSalesScreenProps) {
  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Milk Sales"
        onNavigate={onNavigate}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.text}>Milk Sales Screen</Text>
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
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

