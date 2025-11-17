import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HeaderWithMenu from '../../components/common/HeaderWithMenu';

type ScreenType = 
  | 'Dashboard'
  | 'Animals'
  | 'Milk'
  | 'Chara'
  | 'Profit/Loss'
  | 'Login/Signup';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

/**
 * Dashboard Screen
 * Main dashboard showing overview of dairy farm
 * - Total animals
 * - Daily milk production
 * - Recent sales/purchases
 * - Profit/Loss summary
 */
export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Dashboard"
        onNavigate={onNavigate}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Animals</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Milk Production</Text>
            <Text style={styles.cardValue}>0 L</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Sales</Text>
            <Text style={styles.cardValue}>₹0</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Expenses</Text>
            <Text style={styles.cardValue}>₹0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
});

