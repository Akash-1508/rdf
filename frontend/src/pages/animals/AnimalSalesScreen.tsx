import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import HeaderWithMenu from '../../components/common/HeaderWithMenu';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { AnimalTransaction } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';

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

interface AnimalSalesScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

/**
 * Animal Sales Screen
 * Manage animal sales transactions
 */
export default function AnimalSalesScreen({ onNavigate }: AnimalSalesScreenProps) {
  const [sales, setSales] = useState<AnimalTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    animalName: '',
    saleDate: new Date().toISOString().split('T')[0],
    salePrice: '',
    buyerName: '',
    buyerPhone: '',
    notes: '',
  });

  const handleAddSale = () => {
    if (!formData.animalName || !formData.salePrice || !formData.buyerName) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newSale: AnimalTransaction = {
      id: Date.now().toString(),
      animalId: formData.animalName,
      type: 'sale',
      date: new Date(formData.saleDate),
      price: parseFloat(formData.salePrice),
      buyer: formData.buyerName,
      notes: formData.notes,
    };

    setSales([newSale, ...sales]);
    setFormData({
      animalName: '',
      saleDate: new Date().toISOString().split('T')[0],
      salePrice: '',
      buyerName: '',
      buyerPhone: '',
      notes: '',
    });
    setShowForm(false);
    Alert.alert('Success', 'Animal sale recorded successfully!');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Sale',
      'Are you sure you want to delete this sale record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSales(sales.filter((s) => s.id !== id));
            Alert.alert('Success', 'Sale record deleted!');
          },
        },
      ]
    );
  };

  const totalSales = sales.reduce((sum, s) => sum + s.price, 0);

  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Animal Sales"
        onNavigate={onNavigate}
      />
      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Sales</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
          <Text style={styles.summarySubtext}>{sales.length} Animals Sold</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add New Sale</Text>
        </TouchableOpacity>

        {sales.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sale records yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add New Sale" to add one</Text>
          </View>
        ) : (
          sales.map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View style={styles.saleHeader}>
                <View>
                  <Text style={styles.saleAnimal}>{sale.animalId}</Text>
                  <Text style={styles.saleDate}>
                    {formatDate(sale.date)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(sale.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.saleDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Buyer:</Text>
                  <Text style={styles.detailValue}>{sale.buyer}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(sale.price)}</Text>
                </View>
                {sale.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{sale.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Sale Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Animal Sale</Text>
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Animal Name/ID *</Text>
              <Input
                placeholder="Enter animal name or ID"
                value={formData.animalName}
                onChangeText={(text) => setFormData({ ...formData, animalName: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Sale Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={formData.saleDate}
                onChangeText={(text) => setFormData({ ...formData, saleDate: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Sale Price (₹) *</Text>
              <Input
                placeholder="Enter sale price"
                value={formData.salePrice}
                onChangeText={(text) => setFormData({ ...formData, salePrice: text })}
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.label}>Buyer Name *</Text>
              <Input
                placeholder="Enter buyer name"
                value={formData.buyerName}
                onChangeText={(text) => setFormData({ ...formData, buyerName: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Buyer Phone</Text>
              <Input
                placeholder="Enter buyer phone"
                value={formData.buyerPhone}
                onChangeText={(text) => setFormData({ ...formData, buyerPhone: text })}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <Text style={styles.label}>Notes</Text>
              <Input
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />

              <Button
                title="Save Sale"
                onPress={handleAddSale}
                style={styles.saveButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    padding: 15,
  },
  summaryCard: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  saleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  saleAnimal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saleDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  saleDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E0E0E0',
    marginBottom: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    marginTop: 20,
    marginBottom: 10,
  },
});

