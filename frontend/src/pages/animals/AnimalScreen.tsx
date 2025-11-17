import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import HeaderWithMenu from '../../components/common/HeaderWithMenu';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import { AnimalTransaction, AnimalMedia } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import { Animated } from 'react-native';
import { animalService } from '../../services/animals/animalService';

type ScreenType =
  | 'Dashboard'
  | 'Animals'
  | 'Milk'
  | 'Chara'
  | 'Profit/Loss'
  | 'Login/Signup';

interface AnimalScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onLogout?: () => void;
}

type TransactionType = 'sale' | 'purchase';

interface Contact {
  name: string;
  phone?: string;
}

export default function AnimalScreen({ onNavigate, onLogout }: AnimalScreenProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('purchase');
  const [transactions, setTransactions] = useState<AnimalTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBreedOthers, setShowBreedOthers] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const [formData, setFormData] = useState({
    // Common fields
    animalName: '',
    animalType: '',
    breed: '',
    customBreed: '',
    gender: '',
    price: '',
    location: '',
    purpose: '',
    temperament: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    contactName: '',
    contactPhone: '',
    notes: '',
    // Male-specific fields
    breedingCapability: '',
    semenQuality: '',
    successfulBreedingCount: '',
    workType: '',
    staminaLevel: '',
    trainingLevel: '',
    hornStatus: '',
    // Female-specific fields
    pregnancyStatus: '',
    pregnancyMonth: '',
    birthStatus: '',
    previousCalvingsCount: '',
    lastCalvingDate: '',
    expectedCalvingDate: '',
    milkCapacity: '',
    peakMilkOutput: '',
    lactationStage: '',
    milkingFrequency: '',
    hasCalf: '',
    calfAge: '',
    calfGender: '',
    calfBirthDate: '',
  });
  const [images, setImages] = useState<AnimalMedia[]>([]);
  const [videos, setVideos] = useState<AnimalMedia[]>([]);

  // Animal type options base
  const animalTypeOptionsBase = [
    { label: 'Cow', value: 'cow', maleLabel: 'Bull', femaleLabel: 'Cow' },
    { label: 'Buffalo', value: 'buffalo', maleLabel: 'Buffalo Bull', femaleLabel: 'Buffalo' },
    { label: 'Goat', value: 'goat', maleLabel: 'Buck', femaleLabel: 'Goat' },
    { label: 'Sheep', value: 'sheep', maleLabel: 'Ram', femaleLabel: 'Sheep' },
    { label: 'Others', value: 'others', maleLabel: 'Others', femaleLabel: 'Others' },
  ];

  // Get gender-specific animal type options
  const getAnimalTypeOptions = () => {
    if (!formData.gender) {
      return animalTypeOptionsBase.map(opt => ({ label: opt.label, value: opt.value }));
    }
    return animalTypeOptionsBase.map(opt => ({
      label: formData.gender === 'male' ? opt.maleLabel : opt.femaleLabel,
      value: opt.value,
    }));
  };

  // Breed options based on animal type
  const getBreedOptions = () => {
    const breeds: { [key: string]: { label: string; value: string }[] } = {
      cow: [
        { label: 'Holstein', value: 'holstein' },
        { label: 'Jersey', value: 'jersey' },
        { label: 'Sahiwal', value: 'sahiwal' },
        { label: 'Gir', value: 'gir' },
        { label: 'Red Sindhi', value: 'red_sindhi' },
        { label: 'Tharparkar', value: 'tharparkar' },
      ],
      buffalo: [
        { label: 'Murrah', value: 'murrah' },
        { label: 'Nili-Ravi', value: 'nili_ravi' },
        { label: 'Surti', value: 'surti' },
        { label: 'Jaffarabadi', value: 'jaffarabadi' },
      ],
      goat: [
        { label: 'Boer', value: 'boer' },
        { label: 'Jamnapari', value: 'jamnapari' },
        { label: 'Barbari', value: 'barbari' },
        { label: 'Beetal', value: 'beetal' },
      ],
      sheep: [
        { label: 'Merino', value: 'merino' },
        { label: 'Rambouillet', value: 'rambouillet' },
        { label: 'Dorper', value: 'dorper' },
      ],
    };
    return breeds[formData.animalType] || [];
  };

  // Conditional rendering helpers
  const isMale = formData.gender === 'male';
  const isFemale = formData.gender === 'female';
  const isBchiya = formData.pregnancyStatus === 'bchiya';
  const isPaadi = formData.pregnancyStatus === 'paadi';
  const isBchiyaOrPaadi = isBchiya || isPaadi;
  const isCowOrBuffalo = formData.animalType === 'cow' || formData.animalType === 'buffalo';
  const isGoatOrSheep = formData.animalType === 'goat' || formData.animalType === 'sheep';
  const showFullMilkFields = isFemale && (isCowOrBuffalo || isBchiyaOrPaadi);
  const showCalvingFields = isFemale && (isCowOrBuffalo || isGoatOrSheep || isBchiyaOrPaadi);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  // Animate conditional fields
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: (isMale || isFemale) ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMale, isFemale, fadeAnim]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await animalService.getTransactions();
      setTransactions(data);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      Alert.alert('Error', 'Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handlePickImage = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      includeBase64: false,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const newImage: AnimalMedia = {
          uri: asset.uri || '',
          type: 'image',
          name: asset.fileName || `image_${Date.now()}.jpg`,
        };
        setImages([...images, newImage]);
      }
    });
  };

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      includeBase64: false,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const newImage: AnimalMedia = {
          uri: asset.uri || '',
          type: 'image',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        };
        setImages([...images, newImage]);
      }
    });
  };

  const handlePickVideo = () => {
    const options = {
      mediaType: 'video' as MediaType,
      videoQuality: 'high' as const,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const newVideo: AnimalMedia = {
          uri: asset.uri || '',
          type: 'video',
          name: asset.fileName || `video_${Date.now()}.mp4`,
        };
        setVideos([...videos, newVideo]);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleAddTransaction = async () => {
    if (!formData.animalName || !formData.price || !formData.contactName || !formData.animalType || !formData.gender) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const price = parseFloat(formData.price);

      const transactionData: Omit<AnimalTransaction, '_id' | 'id'> = {
        type: transactionType,
        date: new Date(formData.date),
        price: price,
        [transactionType === 'sale' ? 'buyer' : 'seller']: formData.contactName,
        [transactionType === 'sale' ? 'buyerPhone' : 'sellerPhone']: formData.contactPhone || undefined,
        notes: formData.description || formData.notes || undefined,
        animalId: formData.animalName, // Store animal name as animalId for reference
        animalName: formData.animalName,
        animalType: formData.animalType || undefined,
        breed: showBreedOthers ? formData.customBreed : formData.breed || undefined,
        gender: formData.gender || undefined,
        location: formData.location || undefined,
        temperament: formData.temperament || undefined,
        description: formData.description || undefined,
      };

      let savedTransaction: AnimalTransaction;
      if (transactionType === 'sale') {
        savedTransaction = await animalService.recordSale(transactionData);
      } else {
        savedTransaction = await animalService.recordPurchase(transactionData);
      }

      // Reload all transactions to get the latest data from DB
      await loadTransactions();

      // Keep contact info filled, only reset other fields
      setFormData({
        animalName: '',
        animalType: '',
        breed: '',
        customBreed: '',
        gender: '',
        price: '',
        location: '',
        purpose: '',
        temperament: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        contactName: formData.contactName, // Keep contact name
        contactPhone: formData.contactPhone, // Keep contact phone
        notes: '',
        breedingCapability: '',
        semenQuality: '',
        successfulBreedingCount: '',
        workType: '',
        staminaLevel: '',
        trainingLevel: '',
        hornStatus: '',
        pregnancyStatus: '',
        pregnancyMonth: '',
        birthStatus: '',
        previousCalvingsCount: '',
        lastCalvingDate: '',
        expectedCalvingDate: '',
        milkCapacity: '',
        peakMilkOutput: '',
        lactationStage: '',
        milkingFrequency: '',
        hasCalf: '',
        calfAge: '',
        calfGender: '',
        calfBirthDate: '',
      });
      setImages([]);
      setVideos([]);
      setShowBreedOthers(false);
      setShowForm(false);
      setShowContactDropdown(false);
      Alert.alert('Success', `Animal ${transactionType === 'sale' ? 'sale' : 'purchase'} saved to database!`);
    } catch (error: any) {
      console.error('Failed to save transaction:', error);
      Alert.alert('Error', error.message || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your form data has been saved as draft');
    // In a real app, you would save to local storage or backend
  };

  const handleBreedSelect = (value: string) => {
    if (value === 'others') {
      setShowBreedOthers(true);
      setFormData({ ...formData, breed: '' });
    } else {
      setShowBreedOthers(false);
      setFormData({ ...formData, breed: value, customBreed: '' });
    }
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
            // TODO: Add backend delete API call
            setTransactions(transactions.filter((t) => (t._id || t.id) !== id));
            Alert.alert('Success', `${transactionType === 'sale' ? 'Sale' : 'Purchase'} record deleted!`);
          },
        },
      ]
    );
  };

  const filteredTransactions = transactions.filter((t) => t.type === transactionType);
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.price, 0);

  // Helper function to get unique contact identifier (name + phone)
  const getContactKey = (transaction: AnimalTransaction): string => {
    const name = transactionType === 'sale' ? transaction.buyer : transaction.seller;
    const phone = transactionType === 'sale' ? transaction.buyerPhone : transaction.sellerPhone;
    return phone ? `${name} | ${phone}` : name || '';
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

    const buyerSummary: Record<string, { count: number; totalAmount: number; name: string; phone?: string }> = {};

    monthlySales.forEach((sale) => {
      if (sale.buyer) {
        const key = getContactKey(sale);
        if (!buyerSummary[key]) {
          buyerSummary[key] = { count: 0, totalAmount: 0, name: sale.buyer, phone: sale.buyerPhone };
        }
        buyerSummary[key].count += 1;
        buyerSummary[key].totalAmount += sale.price;
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
    const grouped: Record<string, AnimalTransaction[]> = {};

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
  const getDayWiseSummary = (transactions: AnimalTransaction[]) => {
    const summary: Record<string, { count: number; totalAmount: number; name: string; phone?: string }> = {};

    transactions.forEach((transaction) => {
      const key = getContactKey(transaction);
      const name = transactionType === 'sale' ? transaction.buyer : transaction.seller;
      const phone = transactionType === 'sale' ? transaction.buyerPhone : transaction.sellerPhone;

      if (name) {
        if (!summary[key]) {
          summary[key] = { count: 0, totalAmount: 0, name, phone };
        }
        summary[key].count += 1;
        summary[key].totalAmount += transaction.price;
      }
    });

    return summary;
  };

  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Animals"
        onNavigate={onNavigate}
        isAuthenticated={true}
        onLogout={onLogout}
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
          <Text style={styles.summarySubtext}>{filteredTransactions.length} Animals</Text>
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
                  <Text style={styles.buyerSummaryHeaderText}>Count</Text>
                  <Text style={styles.buyerSummaryHeaderText}>Total</Text>
                </View>
                {monthlyBuyers.map((buyerKey) => {
                  const summary = monthlySalesByBuyer[buyerKey];
                  return (
                    <View key={buyerKey} style={styles.buyerSummaryRow}>
                      <View style={styles.buyerNameContainer}>
                        <Text style={styles.buyerName}>{summary.name}</Text>
                        {summary.phone && (
                          <Text style={styles.buyerPhone}>{summary.phone}</Text>
                        )}
                      </View>
                      <Text style={styles.buyerQuantity}>
                        {summary.count}
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
                      .reduce((sum, s) => sum + s.count, 0)}
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
            const dayTotalAmount = dayGroup.transactions.reduce(
              (sum, t) => sum + t.price,
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
                      {dayGroup.transactions.length} Transaction{dayGroup.transactions.length !== 1 ? 's' : ''} • {formatCurrency(dayTotalAmount)}
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
                              {summary.count}
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
                  <View key={transaction._id || transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                      <View style={styles.transactionHeaderLeft}>
                        <Text style={styles.transactionTime}>
                          {new Date(transaction.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text style={styles.transactionAnimal}>
                          {transaction.animalName || transaction.animalId || 'Animal'}
                          {transaction.animalType && ` (${transaction.animalType})`}
                          {transaction.breed && ` - ${transaction.breed}`}
                        </Text>
                        <Text style={styles.transactionQuantity}>
                          {formatCurrency(transaction.price)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(transaction._id || transaction.id || '')}
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
                      {(transaction.animalType || transaction.breed || transaction.gender) && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Animal Details:</Text>
                          <Text style={styles.detailValue}>
                            {[
                              transaction.animalType,
                              transaction.breed,
                              transaction.gender
                            ].filter(Boolean).join(' • ')}
                          </Text>
                        </View>
                      )}
                      {transaction.location && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Location:</Text>
                          <Text style={styles.detailValue}>{transaction.location}</Text>
                        </View>
                      )}
                      {transaction.notes && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesLabel}>Notes:</Text>
                          <Text style={styles.notesText}>{transaction.notes}</Text>
                        </View>
                      )}
                      {transaction.description && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesLabel}>Description:</Text>
                          <Text style={styles.notesText}>{transaction.description}</Text>
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
              <Text style={styles.modalTitle}> Animal {transactionType === 'sale' ? 'Sale' : 'Purchase'}</Text>
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

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Common Information Card */}
              <View style={styles.formCard}>
                <Text style={styles.cardTitle}>Basic Information (मूल जानकारी)</Text>
                
                <Text style={styles.label}>Animal Name/ID (पशु का नाम/आईडी) *</Text>
                <Input
                  placeholder="Enter animal name or ID"
                  value={formData.animalName}
                  onChangeText={(text) => setFormData({ ...formData, animalName: text })}
                  style={styles.input}
                />

                <Text style={styles.label}>Gender (लिंग) *</Text>
                <Dropdown
                  options={[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                  ]}
                  selectedValue={formData.gender}
                  onSelect={(value) => setFormData({ ...formData, gender: value })}
                  placeholder="Select gender"
                  style={styles.input}
                />

                <Text style={styles.label}>Animal Type (पशु का प्रकार) *</Text>
                <Dropdown
                  options={getAnimalTypeOptions()}
                  selectedValue={formData.animalType}
                  onSelect={(value) => {
                    setFormData({ ...formData, animalType: value, breed: '', customBreed: '' });
                    setShowBreedOthers(false);
                  }}
                  placeholder={formData.gender ? `Select ${formData.gender === 'male' ? 'male' : 'female'} animal type` : "Select animal type"}
                  style={styles.input}
                />

                <Text style={styles.label}>Breed (नस्ल) *</Text>
                {formData.animalType && getBreedOptions().length > 0 ? (
                  <>
                    <Dropdown
                      options={[...getBreedOptions(), { label: 'Others', value: 'others' }]}
                      selectedValue={showBreedOthers ? '' : formData.breed}
                      onSelect={handleBreedSelect}
                      placeholder="Select breed"
                      style={styles.input}
                      showOthers={true}
                    />
                    {showBreedOthers && (
                      <Animated.View style={{ opacity: fadeAnim }}>
                        <Text style={styles.label}>Enter Custom Breed (अन्य नस्ल दर्ज करें) *</Text>
                        <Input
                          placeholder="Enter breed name"
                          value={formData.customBreed}
                          onChangeText={(text) => setFormData({ ...formData, customBreed: text })}
                          style={styles.input}
                        />
                      </Animated.View>
                    )}
                  </>
                ) : formData.animalType ? (
                  <Input
                    placeholder="Enter breed"
                    value={formData.breed}
                    onChangeText={(text) => setFormData({ ...formData, breed: text })}
                    style={styles.input}
                  />
                ) : (
                  <Input
                    placeholder="Select animal type first"
                    editable={false}
                    style={{
                      ...styles.input,
                      ...styles.disabledInput,
                    }}
                  />
                )}

                <Text style={styles.label}>Price (कीमत) (₹) *</Text>
                <Input
                  placeholder="Enter price"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <Text style={styles.label}>Location (स्थान)</Text>
                <Input
                  placeholder="Enter location"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  style={styles.input}
                />

               

                <Text style={styles.label}>Temperament (स्वभाव)</Text>
                <Dropdown
                  options={[
                    { label: 'Calm', value: 'calm' },
                    { label: 'Aggressive', value: 'aggressive' },
                    { label: 'Friendly', value: 'friendly' },
                  ]}
                  selectedValue={formData.temperament}
                  onSelect={(value) => setFormData({ ...formData, temperament: value })}
                  placeholder="Select temperament"
                  style={styles.input}
                />

                <Text style={styles.label}>Description (विवरण)</Text>
                <Input
                  placeholder="Short description (optional)"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />

                <Text style={styles.label}>{transactionType === 'sale' ? 'Sale' : 'Purchase'} Date ({transactionType === 'sale' ? 'बिक्री' : 'खरीद'} की तारीख) *</Text>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  style={styles.input}
                />
              </View>

              {/* Male-Specific Fields Card */}
              {isMale && (
                <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
                  <Text style={styles.cardTitle}>Male-Specific Information (नर-विशिष्ट जानकारी)</Text>
                  
                  <Text style={styles.label}>Breeding Capability (प्रजनन क्षमता)</Text>
                  <Dropdown
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ]}
                    selectedValue={formData.breedingCapability}
                    onSelect={(value) => setFormData({ ...formData, breedingCapability: value })}
                    placeholder="Select breeding capability"
                    style={styles.input}
                  />

                  <Text style={styles.label}>Semen Quality (वीर्य की गुणवत्ता)</Text>
                  <Dropdown
                    options={[
                      { label: 'Good', value: 'good' },
                      { label: 'Average', value: 'average' },
                      { label: 'Poor', value: 'poor' },
                    ]}
                    selectedValue={formData.semenQuality}
                    onSelect={(value) => setFormData({ ...formData, semenQuality: value })}
                    placeholder="Select semen quality"
                    style={styles.input}
                  />

                  <Text style={styles.label}>Successful Breeding Count (सफल प्रजनन की संख्या)</Text>
                  <Input
                    placeholder="Enter count"
                    value={formData.successfulBreedingCount}
                    onChangeText={(text) => setFormData({ ...formData, successfulBreedingCount: text })}
                    keyboardType="numeric"
                    style={styles.input}
                  />


                  <Text style={styles.label}>Horn Status (सींग की स्थिति)</Text>
                  <Dropdown
                    options={[
                      { label: 'Has Horns', value: 'has_horns' },
                      { label: 'No Horns', value: 'no_horns' },
                      { label: 'Dehorned', value: 'dehorned' },
                    ]}
                    selectedValue={formData.hornStatus}
                    onSelect={(value) => setFormData({ ...formData, hornStatus: value })}
                    placeholder="Select horn status"
                    style={styles.input}
                  />
                </Animated.View>
              )}

              {/* Female-Specific Fields Card */}
              {isFemale && (
                <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
                  <Text style={styles.cardTitle}>Female-Specific Information (मादा-विशिष्ट जानकारी)</Text>
                  
                  <Text style={styles.label}>Pregnancy/Birth Status (गर्भावस्था/जन्म की स्थिति) *</Text>
                  <Dropdown
                    options={[
                      { label: 'Bchiya (बचिया)', value: 'bchiya' },
                      { label: 'Paadi (पाड़ी)', value: 'paadi' },
                      { label: 'Currently Pregnant (गर्भवती)', value: 'pregnant' },
                      { label: 'Not Pregnant (गर्भवती नहीं)', value: 'not_pregnant' },
                      { label: 'Already Given Birth (जन्म दे चुकी)', value: 'given_birth' },
                    ]}
                    selectedValue={formData.pregnancyStatus}
                    onSelect={(value) => {
                      setFormData({ 
                        ...formData, 
                        pregnancyStatus: value,
                        hasCalf: value === 'given_birth' ? 'yes' : formData.hasCalf,
                      });
                    }}
                    placeholder="Select status"
                    style={styles.input}
                  />

                  {(formData.pregnancyStatus === 'pregnant' || formData.pregnancyStatus === 'paadi') && (
                    <>
                      <Text style={styles.label}>Pregnancy Month (गर्भावस्था का महीना)</Text>
                      <Input
                        placeholder="Enter month (1-9)"
                        value={formData.pregnancyMonth}
                        onChangeText={(text) => setFormData({ ...formData, pregnancyMonth: text })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </>
                  )}

                  {formData.pregnancyStatus === 'given_birth' && (
                    <>
                      <Text style={styles.label}>Birth Date (जन्म की तारीख) *</Text>
                      <Input
                        placeholder="YYYY-MM-DD"
                        value={formData.calfBirthDate}
                        onChangeText={(text) => setFormData({ ...formData, calfBirthDate: text })}
                        style={styles.input}
                      />
                    </>
                  )}

                  {/* Previous Calvings Count - show for all calving fields */}
                  {showCalvingFields && (
                    <>
                      <Text style={styles.label}>Previous Calvings Count (पिछले ब्याने की संख्या)</Text>
                      <Input
                        placeholder="Enter count"
                        value={formData.previousCalvingsCount}
                        onChangeText={(text) => setFormData({ ...formData, previousCalvingsCount: text })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </>
                  )}

                  {/* Expected Calving Date - show for calving fields AND for bchiya/paadi */}
                  {(showCalvingFields || isBchiyaOrPaadi) && (
                    <>
                      <Text style={styles.label}>Expected Calving Date (अपेक्षित ब्याने की तारीख)</Text>
                      <Input
                        placeholder="YYYY-MM-DD"
                        value={formData.expectedCalvingDate}
                        onChangeText={(text) => setFormData({ ...formData, expectedCalvingDate: text })}
                        style={styles.input}
                      />
                    </>
                  )}

                  {showFullMilkFields && (
                    <>
                      <Text style={styles.label}>Milk Capacity (दूध की क्षमता) (Liters/Day)</Text>
                      <Input
                        placeholder="Enter liters per day"
                        value={formData.milkCapacity}
                        onChangeText={(text) => setFormData({ ...formData, milkCapacity: text })}
                        keyboardType="decimal-pad"
                        style={styles.input}
                      />


                    

                      <Text style={styles.label}>Milking Frequency (दूध निकालने की आवृत्ति)</Text>
                      <Input
                        placeholder="Times per day (e.g., 2)"
                        value={formData.milkingFrequency}
                        onChangeText={(text) => setFormData({ ...formData, milkingFrequency: text })}
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </>
                  )}

                  {(formData.pregnancyStatus === 'given_birth' || formData.pregnancyStatus === 'not_pregnant') && (
                    <>
                      <Text style={styles.label}>Has Calf? (बच्चा है?)</Text>
                      <Dropdown
                        options={[
                          { label: 'Yes', value: 'yes' },
                          { label: 'No', value: 'no' },
                        ]}
                        selectedValue={formData.hasCalf}
                        onSelect={(value) => setFormData({ ...formData, hasCalf: value })}
                        placeholder="Select"
                        style={styles.input}
                      />
                    </>
                  )}

                  {(formData.hasCalf === 'yes' || formData.pregnancyStatus === 'given_birth') && (
                    <>
                      {formData.pregnancyStatus !== 'given_birth' && (
                        <>
                          <Text style={styles.label}>Calf Birth Date (बच्चे की जन्म तारीख)</Text>
                          <Input
                            placeholder="YYYY-MM-DD"
                            value={formData.calfBirthDate}
                            onChangeText={(text) => setFormData({ ...formData, calfBirthDate: text })}
                            style={styles.input}
                          />
                        </>
                      )}
                      
                     

                      <Text style={styles.label}>Calf Gender (बच्चे का लिंग) *</Text>
                      <Dropdown
                        options={[
                          { label: 'Male', value: 'male' },
                          { label: 'Female', value: 'female' },
                        ]}
                        selectedValue={formData.calfGender}
                        onSelect={(value) => setFormData({ ...formData, calfGender: value })}
                        placeholder="Select calf gender"
                        style={styles.input}
                      />
                    </>
                  )}
                </Animated.View>
              )}

              {/* Contact Information Card */}
              <View style={styles.formCard}>
                <Text style={styles.cardTitle}>Contact Information (संपर्क जानकारी)</Text>
                
                <Text style={styles.label}>{transactionType === 'sale' ? 'Buyer' : 'Seller'} Name ({transactionType === 'sale' ? 'खरीदार' : 'विक्रेता'} का नाम) *</Text>
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

                <Text style={styles.label}>{transactionType === 'sale' ? 'Buyer' : 'Seller'} Phone ({transactionType === 'sale' ? 'खरीदार' : 'विक्रेता'} का फोन)</Text>
                <Input
                  placeholder={`Enter ${transactionType === 'sale' ? 'buyer' : 'seller'} phone`}
                  value={formData.contactPhone}
                  onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>


              {/* Media Section Card */}
              <View style={styles.formCard}>
                <Text style={styles.cardTitle}>Photos & Videos (फोटो और वीडियो)</Text>
                
                <View style={styles.mediaButtonsContainer}>
                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={handlePickImage}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.mediaButtonText}>📷 Choose Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={handleTakePhoto}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.mediaButtonText}>📸 Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={handlePickVideo}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.mediaButtonText}>🎥 Choose Video</Text>
                  </TouchableOpacity>
                </View>

                {/* Display Selected Images */}
                {images.length > 0 && (
                  <View style={styles.mediaContainer}>
                    <Text style={styles.mediaLabel}>Images ({images.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {images.map((image, index) => (
                        <View key={index} style={styles.mediaItem}>
                          <Image source={{ uri: image.uri }} style={styles.mediaPreview} />
                          <TouchableOpacity
                            style={styles.removeMediaButton}
                            onPress={() => handleRemoveImage(index)}
                          >
                            <Text style={styles.removeMediaText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Display Selected Videos */}
                {videos.length > 0 && (
                  <View style={styles.mediaContainer}>
                    <Text style={styles.mediaLabel}>Videos ({videos.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {videos.map((video, index) => (
                        <View key={index} style={styles.mediaItem}>
                          <View style={styles.videoPreview}>
                            <Text style={styles.videoIcon}>🎥</Text>
                            <Text style={styles.videoName} numberOfLines={1}>
                              {video.name || 'Video'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removeMediaButton}
                            onPress={() => handleRemoveVideo(index)}
                          >
                            <Text style={styles.removeMediaText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Save Draft"
                  onPress={handleSaveDraft}
                  style={styles.draftButton}
                  textStyle={styles.draftButtonText}
                />
                <Button
                  title={`Submit ${transactionType === 'sale' ? 'Sale' : 'Purchase'}`}
                  onPress={handleAddTransaction}
                  style={{
                    ...styles.saveButton,
                    ...(transactionType === 'sale' ? styles.saveButtonSale : styles.saveButtonPurchase),
                  }}
                />
              </View>
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
  transactionAnimal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDate: {
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
    padding: 15,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
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
  disabledInput: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  draftButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
    marginTop: 0,
    marginBottom: 0,
  },
  draftButtonText: {
    color: '#666',
  },
  saveButton: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
  },
  saveButtonPurchase: {
    backgroundColor: '#4CAF50',
  },
  saveButtonSale: {
    backgroundColor: '#2196F3',
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mediaButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  mediaButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  mediaItem: {
    marginRight: 10,
    position: 'relative',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  videoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  videoIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  videoName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5252',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  mediaSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  transactionImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F5F5F5',
  },
  videoListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 150,
  },
  videoItemName: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
    flex: 1,
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
  transactionHeaderLeft: {
    flex: 1,
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  transactionQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailValueContainer: {
    alignItems: 'flex-end',
  },
  detailPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
});

