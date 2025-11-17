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

interface MilkPurchaseScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

/**
 * Milk Purchase Screen
 * Manage milk purchase transactions
 */
export default function MilkPurchaseScreen({ onNavigate }: MilkPurchaseScreenProps) {
  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Milk Purchase"
        onNavigate={onNavigate}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.text}>Milk Purchase Screen</Text>
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

