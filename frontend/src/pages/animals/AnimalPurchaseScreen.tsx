import React, { useState } from 'react';
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
import { AnimalTransaction, AnimalMedia } from '../../types';
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

interface AnimalPurchaseScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

/**
 * Animal Purchase Screen
 * Manage animal purchase transactions
 */
export default function AnimalPurchaseScreen({ onNavigate }: AnimalPurchaseScreenProps) {
  const [purchases, setPurchases] = useState<AnimalTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    animalName: '',
    animalType: '',
    breed: '',
    age: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    sellerName: '',
    sellerPhone: '',
    notes: '',
  });
  const [images, setImages] = useState<AnimalMedia[]>([]);
  const [videos, setVideos] = useState<AnimalMedia[]>([]);

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

  const handleAddPurchase = () => {
    if (!formData.animalName || !formData.purchasePrice || !formData.sellerName) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newPurchase: AnimalTransaction = {
      id: Date.now().toString(),
      animalId: formData.animalName,
      type: 'purchase',
      date: new Date(formData.purchaseDate),
      price: parseFloat(formData.purchasePrice),
      seller: formData.sellerName,
      notes: formData.notes,
      images: images.length > 0 ? images : undefined,
      videos: videos.length > 0 ? videos : undefined,
    };

    setPurchases([newPurchase, ...purchases]);
    setFormData({
      animalName: '',
      animalType: '',
      breed: '',
      age: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: '',
      sellerName: '',
      sellerPhone: '',
      notes: '',
    });
    setImages([]);
    setVideos([]);
    setShowForm(false);
    Alert.alert('Success', 'Animal purchase recorded successfully!');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Purchase',
      'Are you sure you want to delete this purchase record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPurchases(purchases.filter((p) => p.id !== id));
            Alert.alert('Success', 'Purchase record deleted!');
          },
        },
      ]
    );
  };

  const totalPurchases = purchases.reduce((sum, p) => sum + p.price, 0);

  return (
    <View style={styles.container}>
      <HeaderWithMenu
        title="Dairy Farm Management"
        subtitle="Animal Purchase"
        onNavigate={onNavigate}
      />
      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Purchases</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalPurchases)}</Text>
          <Text style={styles.summarySubtext}>{purchases.length} Animals</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add New Purchase</Text>
        </TouchableOpacity>

        {purchases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No purchase records yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add New Purchase" to add one</Text>
          </View>
        ) : (
          purchases.map((purchase) => (
            <View key={purchase.id} style={styles.purchaseCard}>
              <View style={styles.purchaseHeader}>
                <View>
                  <Text style={styles.purchaseAnimal}>{purchase.animalId}</Text>
                  <Text style={styles.purchaseDate}>
                    {formatDate(purchase.date)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(purchase.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.purchaseDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Seller:</Text>
                  <Text style={styles.detailValue}>{purchase.seller}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(purchase.price)}</Text>
                </View>
                {purchase.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{purchase.notes}</Text>
                  </View>
                )}
                
                {/* Display Images */}
                {purchase.images && purchase.images.length > 0 && (
                  <View style={styles.mediaSection}>
                    <Text style={styles.mediaSectionLabel}>Photos ({purchase.images.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {purchase.images.map((image, index) => (
                        <Image
                          key={index}
                          source={{ uri: image.uri }}
                          style={styles.purchaseImage}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Display Videos */}
                {purchase.videos && purchase.videos.length > 0 && (
                  <View style={styles.mediaSection}>
                    <Text style={styles.mediaSectionLabel}>Videos ({purchase.videos.length})</Text>
                    <View style={styles.videoListContainer}>
                      {purchase.videos.map((video, index) => (
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

      {/* Add Purchase Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Animal Purchase</Text>
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

              <Text style={styles.label}>Animal Type</Text>
              <Input
                placeholder="e.g., Cow, Buffalo, Goat"
                value={formData.animalType}
                onChangeText={(text) => setFormData({ ...formData, animalType: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Breed</Text>
              <Input
                placeholder="Enter breed"
                value={formData.breed}
                onChangeText={(text) => setFormData({ ...formData, breed: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Age (years)</Text>
              <Input
                placeholder="Enter age"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.label}>Purchase Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={formData.purchaseDate}
                onChangeText={(text) => setFormData({ ...formData, purchaseDate: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Purchase Price (₹) *</Text>
              <Input
                placeholder="Enter purchase price"
                value={formData.purchasePrice}
                onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.label}>Seller Name *</Text>
              <Input
                placeholder="Enter seller name"
                value={formData.sellerName}
                onChangeText={(text) => setFormData({ ...formData, sellerName: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Seller Phone</Text>
              <Input
                placeholder="Enter seller phone"
                value={formData.sellerPhone}
                onChangeText={(text) => setFormData({ ...formData, sellerPhone: text })}
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

              {/* Image/Video Section */}
              <Text style={styles.label}>Animal Photos & Videos</Text>
              
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

              <Button
                title="Save Purchase"
                onPress={handleAddPurchase}
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
    backgroundColor: '#4CAF50',
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
    color: '#E8F5E9',
  },
  addButton: {
    backgroundColor: '#4CAF50',
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
  purchaseCard: {
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
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  purchaseAnimal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  purchaseDate: {
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
  purchaseDetails: {
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
    backgroundColor: '#4CAF50',
    marginTop: 20,
    marginBottom: 10,
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
  purchaseImage: {
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

