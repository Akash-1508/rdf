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

type ScreenType =
  | 'Dashboard'
  | 'Animals'
  | 'Milk'
  | 'Chara'
  | 'Profit/Loss'
  | 'Login/Signup';

interface AnimalScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

type TransactionType = 'sale' | 'purchase';

export default function AnimalScreen({ onNavigate }: AnimalScreenProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('purchase');
  const [transactions, setTransactions] = useState<AnimalTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBreedOthers, setShowBreedOthers] = useState(false);
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

  // Animate conditional fields
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: (isMale || isFemale) ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMale, isFemale, fadeAnim]);

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

  const handleAddTransaction = () => {
    if (!formData.animalName || !formData.price || !formData.contactName || !formData.animalType || !formData.gender) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const finalBreed = showBreedOthers ? formData.customBreed : formData.breed;

    const newTransaction: AnimalTransaction = {
      id: Date.now().toString(),
      animalId: formData.animalName,
      type: transactionType,
      date: new Date(formData.date),
      price: parseFloat(formData.price),
      [transactionType === 'sale' ? 'buyer' : 'seller']: formData.contactName,
      notes: formData.description || formData.notes,
      images: images.length > 0 ? images : undefined,
      videos: videos.length > 0 ? videos : undefined,
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Reset form
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
      contactName: '',
      contactPhone: '',
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
    Alert.alert('Success', `Animal ${transactionType === 'sale' ? 'sale' : 'purchase'} recorded successfully!`);
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
            setTransactions(transactions.filter((t) => t.id !== id));
            Alert.alert('Success', `${transactionType === 'sale' ? 'Sale' : 'Purchase'} record deleted!`);
          },
        },
      ]
    );
  };

  const filteredTransactions = transactions.filter((t) => t.type === transactionType);
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.price, 0);

  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Animals"
        onNavigate={onNavigate}
      />
      <ScrollView style={styles.content}>
        {/* Transaction Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, transactionType === 'purchase' && styles.toggleButtonActive]}
            onPress={() => setTransactionType('purchase')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, transactionType === 'purchase' && styles.toggleTextActive]}>
              Purchase
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, transactionType === 'sale' && styles.toggleButtonActive]}
            onPress={() => setTransactionType('sale')}
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
        </View>

        <TouchableOpacity
          style={[styles.addButton, transactionType === 'sale' ? styles.addButtonSale : styles.addButtonPurchase]}
          onPress={() => setShowForm(true)}
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
          filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View>
                  <Text style={styles.transactionAnimal}>{transaction.animalId}</Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
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
                  <Text style={styles.detailValue}>
                    {transaction.type === 'sale' ? transaction.buyer : transaction.seller}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(transaction.price)}</Text>
                </View>
                {transaction.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{transaction.notes}</Text>
                  </View>
                )}
                
                {/* Display Images */}
                {transaction.images && transaction.images.length > 0 && (
                  <View style={styles.mediaSection}>
                    <Text style={styles.mediaSectionLabel}>Photos ({transaction.images.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {transaction.images.map((image, index) => (
                        <Image
                          key={index}
                          source={{ uri: image.uri }}
                          style={styles.transactionImage}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Display Videos */}
                {transaction.videos && transaction.videos.length > 0 && (
                  <View style={styles.mediaSection}>
                    <Text style={styles.mediaSectionLabel}>Videos ({transaction.videos.length})</Text>
                    <View style={styles.videoListContainer}>
                      {transaction.videos.map((video, index) => (
                        <View key={index} style={styles.videoItem}>
                          <Text style={styles.videoIcon}>🎥</Text>
                          <Text style={styles.videoItemName} numberOfLines={1}>
                            {video.name || `Video ${index + 1}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))
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
                onPress={() => setShowForm(false)}
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
                <Input
                  placeholder={`Enter ${transactionType === 'sale' ? 'buyer' : 'seller'} name`}
                  value={formData.contactName}
                  onChangeText={(text) => setFormData({ ...formData, contactName: text })}
                  style={styles.input}
                />

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
});

