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
import { MilkTransaction } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';

type ScreenType =
  | 'Dashboard'
  | 'Animals'
  | 'Milk'
  | 'Chara'
  | 'Profit/Loss'
  | 'Login/Signup';

interface MilkScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

type TransactionType = 'sale' | 'purchase';

/**
 * Unified Milk Screen
 * Manage both milk sales and purchase transactions
 */
interface Contact {
  name: string;
  phone?: string;
}

export default function MilkScreen({ onNavigate }: MilkScreenProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('purchase');
  const [transactions, setTransactions] = useState<MilkTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    pricePerLiter: '',
    contactName: '',
    contactPhone: '',
    notes: '',
  });

  // Get unique contacts from transactions
  const getContacts = (): Contact[] => {
    const contactsMap = new Map<string, Contact>();

    transactions
      .filter((t) => t.type === transactionType)
      .forEach((transaction) => {
        const name = transactionType === 'sale' ? transaction.buyer : transaction.seller;
        const phone = transactionType === 'sale' ? transaction.buyerPhone : transaction.sellerPhone;
        
        if (name) {
          const key = phone ? `${name}|${phone}` : name;
          if (!contactsMap.has(key)) {
            contactsMap.set(key, { name, phone });
          }
        }
      });

    return Array.from(contactsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const contacts = getContacts();

  const handleAddTransaction = () => {
    if (!formData.quantity || !formData.pricePerLiter || !formData.contactName) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const pricePerLiter = parseFloat(formData.pricePerLiter);
    const totalAmount = quantity * pricePerLiter;

    const newTransaction: MilkTransaction = {
      id: Date.now().toString(),
      type: transactionType,
      date: new Date(formData.date),
      quantity: quantity,
      pricePerLiter: pricePerLiter,
      totalAmount: totalAmount,
      [transactionType === 'sale' ? 'buyer' : 'seller']: formData.contactName,
      [transactionType === 'sale' ? 'buyerPhone' : 'sellerPhone']: formData.contactPhone || undefined,
      notes: formData.notes,
    };

    setTransactions([newTransaction, ...transactions]);
    // Keep contact info filled, only reset quantity, price, date, notes
    setFormData({
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      pricePerLiter: '',
      contactName: formData.contactName, // Keep contact name
      contactPhone: formData.contactPhone, // Keep contact phone
      notes: '',
    });
    setShowForm(false);
    Alert.alert('Success', `Milk ${transactionType === 'sale' ? 'sale' : 'purchase'} recorded successfully!`);
  };

  const handleContactSelect = (contact: Contact) => {
    setFormData({
      ...formData,
      contactName: contact.name,
      contactPhone: contact.phone || '',
    });
    setShowContactDropdown(false);
  };

  const handleAddNewContact = () => {
    setShowContactDropdown(false);
    // Form already has input fields, user can type new contact
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      `Delete ${transactionType === 'sale' ? 'Sale' : 'Purchase'}`,
      `Are you sure you want to delete this ${transactionType === 'sale' ? 'sale' : 'purchase'} record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTransactions(transactions.filter((t) => t.id !== id));
            Alert.alert('Success', `${transactionType === 'sale' ? 'Sale' : 'Purchase'} record deleted!`);
          },
        },
      ]
    );
  };

  const filteredTransactions = transactions.filter((t) => t.type === transactionType);
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalQuantity = filteredTransactions.reduce((sum, t) => sum + t.quantity, 0);

  // Helper function to get unique contact identifier (name + phone)
  const getContactKey = (transaction: MilkTransaction): string => {
    const name = transactionType === 'sale' ? transaction.buyer : transaction.seller;
    const phone = transactionType === 'sale' ? transaction.buyerPhone : transaction.sellerPhone;
    return phone ? `${name} | ${phone}` : name || '';
  };

  // Helper function to get contact display name with phone
  const getContactDisplayName = (transaction: MilkTransaction): string => {
    const name = transactionType === 'sale' ? transaction.buyer : transaction.seller;
    const phone = transactionType === 'sale' ? transaction.buyerPhone : transaction.sellerPhone;
    return phone ? `${name} (${phone})` : name || '';
  };

  // Monthly sales summary by buyer (only for sales)
  const getMonthlySalesByBuyer = () => {
    if (transactionType !== 'sale') return {};

    const [year, month] = selectedMonth.split('-').map(Number);
    const monthlySales = transactions.filter((t) => {
      if (t.type !== 'sale' || !t.buyer) return false;
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() + 1 === month;
    });

    const buyerSummary: Record<string, { quantity: number; totalAmount: number; name: string; phone?: string }> = {};

    monthlySales.forEach((sale) => {
      if (sale.buyer) {
        const key = getContactKey(sale);
        if (!buyerSummary[key]) {
          buyerSummary[key] = { quantity: 0, totalAmount: 0, name: sale.buyer, phone: sale.buyerPhone };
        }
        buyerSummary[key].quantity += sale.quantity;
        buyerSummary[key].totalAmount += sale.totalAmount;
      }
    });

    return buyerSummary;
  };

  const monthlySalesByBuyer = getMonthlySalesByBuyer();
  const monthlyBuyers = Object.keys(monthlySalesByBuyer).sort();

  // Get month name in Hindi/English format
  const getMonthDisplayName = (monthYear: string) => {
    const [year, month] = monthYear.split('-').map(Number);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${months[month - 1]} ${year}`;
  };

  // Generate month options (last 12 months)
  const getMonthOptions = () => {
    const options: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      options.push(`${year}-${month}`);
    }
    return options;
  };

  // Group transactions by date for day-wise view
  const getDayWiseTransactions = () => {
    const grouped: Record<string, MilkTransaction[]> = {};

    filteredTransactions.forEach((transaction) => {
      const dateKey = new Date(transaction.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    // Sort dates in descending order
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((dateKey) => ({
        date: dateKey,
        transactions: grouped[dateKey],
      }));
  };

  const dayWiseTransactions = getDayWiseTransactions();

  // Get day-wise summary by contact (buyer for sales, seller for purchases)
  const getDayWiseSummary = (transactions: MilkTransaction[]) => {
    const summary: Record<string, { quantity: number; totalAmount: number; name: string; phone?: string }> = {};

    transactions.forEach((transaction) => {
      const key = getContactKey(transaction);
      const name = transactionType === 'sale' ? transaction.buyer : transaction.seller;
      const phone = transactionType === 'sale' ? transaction.buyerPhone : transaction.sellerPhone;

      if (name) {
        if (!summary[key]) {
          summary[key] = { quantity: 0, totalAmount: 0, name, phone };
        }
        summary[key].quantity += transaction.quantity;
        summary[key].totalAmount += transaction.totalAmount;
      }
    });

    return summary;
  };

  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Milk"
        onNavigate={onNavigate}
      />
      <ScrollView style={styles.content}>
        {/* Transaction Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, transactionType === 'purchase' && styles.toggleButtonActive]}
            onPress={() => {
              setTransactionType('purchase');
              setShowContactDropdown(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, transactionType === 'purchase' && styles.toggleTextActive]}>
              Purchase
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, transactionType === 'sale' && styles.toggleButtonActive]}
            onPress={() => {
              setTransactionType('sale');
              setShowContactDropdown(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, transactionType === 'sale' && styles.toggleTextActive]}>
              Sales
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryCard, transactionType === 'sale' ? styles.summaryCardSale : styles.summaryCardPurchase]}>
          <Text style={styles.summaryTitle}>Total {transactionType === 'sale' ? 'Sales' : 'Purchases'}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
          <Text style={styles.summarySubtext}>{totalQuantity.toFixed(2)} Liters</Text>
          <Text style={styles.summarySubtext}>{filteredTransactions.length} Transactions</Text>
        </View>

        {/* Monthly Sales Summary by Buyer (only for sales) */}
        {transactionType === 'sale' && (
          <View style={styles.monthlySummaryContainer}>
            <View style={styles.monthSelectorContainer}>
              <Text style={styles.monthSelectorLabel}>Select Month:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.monthSelector}
              >
                {getMonthOptions().map((monthOption) => (
                  <TouchableOpacity
                    key={monthOption}
                    style={[
                      styles.monthOption,
                      selectedMonth === monthOption && styles.monthOptionActive,
                    ]}
                    onPress={() => setSelectedMonth(monthOption)}
                  >
                    <Text
                      style={[
                        styles.monthOptionText,
                        selectedMonth === monthOption && styles.monthOptionTextActive,
                      ]}
                    >
                      {getMonthDisplayName(monthOption)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {monthlyBuyers.length > 0 ? (
              <View style={styles.buyerSummaryCard}>
                <Text style={styles.buyerSummaryTitle}>
                  Monthly Sales Summary - {getMonthDisplayName(selectedMonth)}
                </Text>
                <View style={styles.buyerSummaryHeader}>
                  <Text style={styles.buyerSummaryHeaderText}>Buyer</Text>
                  <Text style={styles.buyerSummaryHeaderText}>Quantity</Text>
                  <Text style={styles.buyerSummaryHeaderText}>Total</Text>
                </View>
                {monthlyBuyers.map((buyerKey) => {
                  const summary = monthlySalesByBuyer[buyerKey];
                  const displayName = summary.phone 
                    ? `${summary.name} (${summary.phone})` 
                    : summary.name;
                  return (
                    <View key={buyerKey} style={styles.buyerSummaryRow}>
                      <View style={styles.buyerNameContainer}>
                        <Text style={styles.buyerName}>{summary.name}</Text>
                        {summary.phone && (
                          <Text style={styles.buyerPhone}>{summary.phone}</Text>
                        )}
                      </View>
                      <Text style={styles.buyerQuantity}>
                        {summary.quantity.toFixed(2)} L
                      </Text>
                      <Text style={styles.buyerAmount}>
                        {formatCurrency(summary.totalAmount)}
                      </Text>
                    </View>
                  );
                })}
                <View style={styles.buyerSummaryTotal}>
                  <Text style={styles.buyerSummaryTotalLabel}>Grand Total:</Text>
                  <Text style={styles.buyerSummaryTotalQuantity}>
                    {Object.values(monthlySalesByBuyer)
                      .reduce((sum, s) => sum + s.quantity, 0)
                      .toFixed(2)}{' '}
                    L
                  </Text>
                  <Text style={styles.buyerSummaryTotalAmount}>
                    {formatCurrency(
                      Object.values(monthlySalesByBuyer).reduce(
                        (sum, s) => sum + s.totalAmount,
                        0
                      )
                    )}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyMonthlySummary}>
                <Text style={styles.emptyMonthlySummaryText}>
                  No sales records for {getMonthDisplayName(selectedMonth)}
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, transactionType === 'sale' ? styles.addButtonSale : styles.addButtonPurchase]}
          onPress={() => {
            setShowForm(true);
            setShowContactDropdown(false);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add New {transactionType === 'sale' ? 'Sale' : 'Purchase'}</Text>
        </TouchableOpacity>

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {transactionType === 'sale' ? 'sale' : 'purchase'} records yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add New {transactionType === 'sale' ? 'Sale' : 'Purchase'}" to add one</Text>
          </View>
        ) : (
          dayWiseTransactions.map((dayGroup) => {
            const daySummary = getDayWiseSummary(dayGroup.transactions);
            const dayTotalQuantity = dayGroup.transactions.reduce(
              (sum, t) => sum + t.quantity,
              0
            );
            const dayTotalAmount = dayGroup.transactions.reduce(
              (sum, t) => sum + t.totalAmount,
              0
            );
            const contacts = Object.keys(daySummary).sort();

            return (
              <View key={dayGroup.date} style={styles.dayGroupCard}>
                {/* Day Header with Summary */}
                <View style={[
                  styles.dayHeader,
                  transactionType === 'sale' ? styles.dayHeaderSale : styles.dayHeaderPurchase,
                ]}>
                  <View style={styles.dayHeaderLeft}>
                    <Text style={styles.dayDate}>{formatDate(new Date(dayGroup.date))}</Text>
                    <Text style={styles.daySummaryText}>
                      {dayGroup.transactions.length} Transaction{dayGroup.transactions.length !== 1 ? 's' : ''} • {dayTotalQuantity.toFixed(2)} L • {formatCurrency(dayTotalAmount)}
                    </Text>
                  </View>
                </View>

                {/* Day-wise Breakdown by Contact */}
                {contacts.length > 0 && (
                  <View style={styles.dayBreakdownCard}>
                    <Text style={styles.dayBreakdownTitle}>
                      {transactionType === 'sale' ? 'Buyers' : 'Sellers'} for this day:
                    </Text>
                    {contacts.map((contactKey) => {
                      const summary = daySummary[contactKey];
                      return (
                        <View key={contactKey} style={styles.dayBreakdownRow}>
                          <View style={styles.dayBreakdownContactContainer}>
                            <Text style={styles.dayBreakdownContact}>{summary.name}</Text>
                            {summary.phone && (
                              <Text style={styles.dayBreakdownPhone}>{summary.phone}</Text>
                            )}
                          </View>
                          <View style={styles.dayBreakdownDetails}>
                            <Text style={[styles.dayBreakdownQuantity, { marginRight: 15 }]}>
                              {summary.quantity.toFixed(2)} L
                            </Text>
                            <Text style={[
                              styles.dayBreakdownAmount,
                              transactionType === 'sale' ? styles.dayBreakdownAmountSale : styles.dayBreakdownAmountPurchase,
                            ]}>
                              {formatCurrency(summary.totalAmount)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Individual Transactions for the Day */}
                {dayGroup.transactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                      <View style={styles.transactionHeaderLeft}>
                        <Text style={styles.transactionTime}>
                          {new Date(transaction.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text style={styles.transactionQuantity}>
                          {transaction.quantity} Liters @ {formatCurrency(transaction.pricePerLiter)}/L
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(transaction.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.transactionDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{transaction.type === 'sale' ? 'Buyer:' : 'Seller:'}</Text>
                        <View style={styles.detailValueContainer}>
                          <Text style={styles.detailValue}>
                            {transaction.type === 'sale' ? transaction.buyer : transaction.seller}
                          </Text>
                          {(transactionType === 'sale' ? transaction.buyerPhone : transaction.sellerPhone) && (
                            <Text style={styles.detailPhone}>
                              {(transactionType === 'sale' ? transaction.buyerPhone : transaction.sellerPhone)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount:</Text>
                        <Text style={styles.detailValue}>{formatCurrency(transaction.totalAmount)}</Text>
                      </View>
                      {transaction.notes && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesLabel}>Notes:</Text>
                          <Text style={styles.notesText}>{transaction.notes}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Milk {transactionType === 'sale' ? 'Sale' : 'Purchase'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowForm(false);
                  setShowContactDropdown(false);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>{transactionType === 'sale' ? 'Sale' : 'Purchase'} Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Quantity (Liters) *</Text>
              <Input
                placeholder="Enter quantity in liters"
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                keyboardType="decimal-pad"
                style={styles.input}
              />

              <Text style={styles.label}>Price per Liter (₹) *</Text>
              <Input
                placeholder="Enter price per liter"
                value={formData.pricePerLiter}
                onChangeText={(text) => setFormData({ ...formData, pricePerLiter: text })}
                keyboardType="decimal-pad"
                style={styles.input}
              />

              {formData.quantity && formData.pricePerLiter && (
                <View style={styles.totalPreview}>
                  <Text style={styles.totalPreviewLabel}>Total Amount:</Text>
                  <Text style={styles.totalPreviewValue}>
                    {formatCurrency(parseFloat(formData.quantity || '0') * parseFloat(formData.pricePerLiter || '0'))}
                  </Text>
                </View>
              )}

              <Text style={styles.label}>{transactionType === 'sale' ? 'Buyer' : 'Seller'} Name *</Text>
              <View style={styles.contactInputContainer}>
                <TouchableOpacity
                  style={styles.contactSelectorButton}
                  onPress={() => setShowContactDropdown(!showContactDropdown)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.contactSelectorButtonText}>
                    {contacts.length > 0 ? '📋 Select from list' : 'No previous contacts'}
                  </Text>
                  <Text style={styles.contactSelectorArrow}>
                    {showContactDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                {showContactDropdown && contacts.length > 0 && (
                  <View style={styles.contactDropdown}>
                    <ScrollView style={styles.contactDropdownList} nestedScrollEnabled>
                      {contacts.map((contact, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.contactDropdownItem}
                          onPress={() => handleContactSelect(contact)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.contactDropdownItemContent}>
                            <Text style={styles.contactDropdownItemName}>{contact.name}</Text>
                            {contact.phone && (
                              <Text style={styles.contactDropdownItemPhone}>{contact.phone}</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[styles.contactDropdownItem, styles.contactDropdownItemNew]}
                        onPress={handleAddNewContact}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.contactDropdownItemNewText}>+ Add New Contact</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                )}
                <Input
                  placeholder={`Enter ${transactionType === 'sale' ? 'buyer' : 'seller'} name`}
                  value={formData.contactName}
                  onChangeText={(text) => setFormData({ ...formData, contactName: text })}
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>{transactionType === 'sale' ? 'Buyer' : 'Seller'} Phone</Text>
              <Input
                placeholder={`Enter ${transactionType === 'sale' ? 'buyer' : 'seller'} phone`}
                value={formData.contactPhone}
                onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
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
                style={styles.textArea}
              />

              <Button
                title={`Save ${transactionType === 'sale' ? 'Sale' : 'Purchase'}`}
                onPress={handleAddTransaction}
                style={{
                  ...styles.saveButton,
                  ...(transactionType === 'sale' ? styles.saveButtonSale : styles.saveButtonPurchase),
                }}
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  summaryCardPurchase: {
    backgroundColor: '#4CAF50',
  },
  summaryCardSale: {
    backgroundColor: '#2196F3',
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
    color: '#E8F5E9',
    marginTop: 4,
  },
  addButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonPurchase: {
    backgroundColor: '#4CAF50',
  },
  addButtonSale: {
    backgroundColor: '#2196F3',
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
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  transactionHeaderLeft: {
    flex: 1,
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionQuantity: {
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
  transactionDetails: {
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
  detailValueContainer: {
    alignItems: 'flex-end',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  totalPreview: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPreviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  totalPreviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  saveButtonPurchase: {
    backgroundColor: '#4CAF50',
  },
  saveButtonSale: {
    backgroundColor: '#2196F3',
  },
  contactInputContainer: {
    marginBottom: 12,
  },
  contactSelectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contactSelectorButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  contactSelectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  contactDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  contactDropdownList: {
    maxHeight: 200,
  },
  contactDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactDropdownItemContent: {
    flexDirection: 'column',
  },
  contactDropdownItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactDropdownItemPhone: {
    fontSize: 12,
    color: '#666',
  },
  contactDropdownItemNew: {
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 0,
  },
  contactDropdownItemNewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    textAlign: 'center',
  },
  monthlySummaryContainer: {
    marginBottom: 15,
  },
  monthSelectorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  monthSelector: {
    flexDirection: 'row',
  },
  monthOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  monthOptionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  monthOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  monthOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buyerSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyerSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  buyerSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    marginBottom: 10,
  },
  buyerSummaryHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    flex: 1,
    textAlign: 'center',
  },
  buyerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  buyerNameContainer: {
    flex: 1,
  },
  buyerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buyerPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buyerQuantity: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  buyerAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    flex: 1,
    textAlign: 'right',
  },
  buyerSummaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#2196F3',
    alignItems: 'center',
  },
  buyerSummaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  buyerSummaryTotalQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  buyerSummaryTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    flex: 1,
    textAlign: 'right',
  },
  emptyMonthlySummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyMonthlySummaryText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  dayGroupCard: {
    marginBottom: 15,
  },
  dayHeader: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  dayHeaderSale: {
    backgroundColor: '#E3F2FD',
    borderLeftColor: '#2196F3',
  },
  dayHeaderPurchase: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#4CAF50',
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  daySummaryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dayBreakdownCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  dayBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dayBreakdownContactContainer: {
    flex: 1,
  },
  dayBreakdownContact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dayBreakdownPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dayBreakdownDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBreakdownQuantity: {
    fontSize: 13,
    color: '#666',
    minWidth: 60,
    textAlign: 'right',
  },
  dayBreakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  dayBreakdownAmountSale: {
    color: '#2196F3',
  },
  dayBreakdownAmountPurchase: {
    color: '#4CAF50',
  },
});

