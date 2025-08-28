import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  TextInput,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { Bell, Lock, Shield, TriangleAlert as AlertTriangle, Battery, Bluetooth, Wifi, User, ChevronRight, Clock } from 'lucide-react-native';

// Mock SOS notifications
const initialNotifications = [
  {
    id: '1',
    title: 'Unusual Movement Detected',
    message: 'Your bike detected unusual movement while parked at Main St.',
    time: '10 min ago',
    type: 'warning',
    read: false
  },
  {
    id: '2',
    title: 'Battery Level Critical',
    message: 'Your bike battery is below 10%. Please charge soon.',
    time: '1 hour ago',
    type: 'critical',
    read: true
  },
  {
    id: '3',
    title: 'Maintenance Reminder',
    message: 'Your bike is due for maintenance in 3 days.',
    time: '5 hours ago',
    type: 'info',
    read: true
  },
  {
    id: '4',
    title: 'Suspicious Access Attempt',
    message: 'Someone tried to unlock your bike at Downtown location.',
    time: '2 days ago',
    type: 'warning',
    read: true
  }
];

// Word-based passcode system
const CORRECT_PASSCODE = ['mountain', 'river', 'forest'];

// List of suggested words for passcode hints
const WORD_SUGGESTIONS = [
  'mountain', 'river', 'forest', 'ocean', 'desert', 
  'valley', 'canyon', 'island', 'meadow', 'glacier',
  'jungle', 'prairie', 'volcano', 'lagoon', 'plateau'
];

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [biometricUnlock, setBiometricUnlock] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [passcodeWords, setPasscodeWords] = useState(['', '', '']);
  const [isLocked, setIsLocked] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  
  const passcodeInputRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeRemaining === 0) {
      handleTimerExpired();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerActive, timeRemaining]);

  const handleTimerExpired = () => {
    setTimerActive(false);
    setShowLockModal(false);
    setPasscodeWords(['', '', '']);
    setCurrentWordIndex(0);
    setPasscodeError('');
    Alert.alert(
      "Time Expired",
      "The passcode entry time has expired. Please try again.",
      [{ text: "OK" }]
    );
  };

  const handleLockBike = () => {
    setShowLockModal(true);
    setPasscodeWords(['', '', '']);
    setCurrentWordIndex(0);
    setPasscodeError('');
    setTimeRemaining(30);
    setTimerActive(true);
    
    // Focus on the first input after modal is shown
    setTimeout(() => {
      if (passcodeInputRefs.current[0]) {
        passcodeInputRefs.current[0].focus();
      }
    }, 300);
  };

  const handleWordChange = (text, index) => {
    const newPasscodeWords = [...passcodeWords];
    newPasscodeWords[index] = text.toLowerCase().trim();
    setPasscodeWords(newPasscodeWords);
  };

  const handleWordSubmit = (index) => {
    if (index < 2) {
      setCurrentWordIndex(index + 1);
      setTimeout(() => {
        if (passcodeInputRefs.current[index + 1]) {
          passcodeInputRefs.current[index + 1].focus();
        }
      }, 100);
    } else {
      handlePasscodeSubmit();
    }
  };

  const handlePasscodeSubmit = () => {
    const isCorrect = passcodeWords.every((word, index) => word === CORRECT_PASSCODE[index]);
    
    if (isCorrect) {
      setTimerActive(false);
      setShowLockModal(false);
      setIsLocked(!isLocked);
      
      // Show confirmation
      Alert.alert(
        isLocked ? "Bike Unlocked" : "Bike Locked",
        isLocked 
          ? "Your bike has been successfully unlocked." 
          : "Your bike has been successfully locked and secured.",
        [{ text: "OK" }]
      );
    } else {
      setPasscodeError('Invalid passcode. Please try again.');
      setPasscodeWords(['', '', '']);
      setCurrentWordIndex(0);
      setTimeout(() => {
        if (passcodeInputRefs.current[0]) {
          passcodeInputRefs.current[0].focus();
        }
      }, 100);
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
  };

  const deleteNotification = (id) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== id
    );
    setNotifications(updatedNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} color="#e74c3c" />;
      case 'critical':
        return <Battery size={20} color="#e67e22" />;
      case 'info':
        return <Bell size={20} color="#3498db" />;
      default:
        return <Bell size={20} color="#3498db" />;
    }
  };

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const renderWordSuggestions = (currentIndex) => {
    // Get 3 random suggestions including the correct one for the current position
    const correctWord = CORRECT_PASSCODE[currentIndex];
    const otherSuggestions = WORD_SUGGESTIONS
      .filter(word => word !== correctWord)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    const suggestions = [...otherSuggestions, correctWord].sort(() => 0.5 - Math.random());
    
    return (
      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>Suggestions:</Text>
        <View style={styles.suggestionRow}>
          {suggestions.map((word, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.suggestionChip}
              onPress={() => {
                handleWordChange(word, currentIndex);
                handleWordSubmit(currentIndex);
              }}
            >
              <Text style={styles.suggestionText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your EV bike preferences</Text>
      </View>
      
      {/* Security Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#ffffff" />
          <Text style={styles.sectionTitle}>Security</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            isLocked ? styles.actionButtonLocked : styles.actionButtonUnlocked
          ]}
          onPress={handleLockBike}
        >
          <View style={styles.actionButtonContent}>
            <Lock size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>
              {isLocked ? "Unlock Bike" : "Lock Bike"}
            </Text>
          </View>
          <Text style={styles.actionButtonStatus}>
            {isLocked ? "LOCKED" : "UNLOCKED"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Shield size={20} color="#3498db" />
            <Text style={styles.settingItemText}>Biometric Unlock</Text>
          </View>
          <Switch
            value={biometricUnlock}
            onValueChange={setBiometricUnlock}
            trackColor={{ false: '#2c3e50', true: '#2980b9' }}
            thumbColor={biometricUnlock ? '#3498db' : '#7f8c8d'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Wifi size={20} color="#3498db" />
            <Text style={styles.settingItemText}>Location Tracking</Text>
          </View>
          <Switch
            value={locationTracking}
            onValueChange={setLocationTracking}
            trackColor={{ false: '#2c3e50', true: '#2980b9' }}
            thumbColor={locationTracking ? '#3498db' : '#7f8c8d'}
          />
        </View>
      </View>
      
      {/* Notifications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#ffffff" />
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.flexSpacer} />
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#2c3e50', true: '#2980b9' }}
            thumbColor={notificationsEnabled ? '#3498db' : '#7f8c8d'}
          />
        </View>
        
        {notificationsEnabled && (
          <>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationHeaderTitle}>SOS Alerts</Text>
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={styles.notificationHeaderAction}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
            
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <View 
                  key={notification.id} 
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.notificationItemUnread
                  ]}
                >
                  <View style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.notificationDelete}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <Text style={styles.notificationDeleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyNotifications}>
                <Text style={styles.emptyNotificationsText}>No notifications</Text>
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Other Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={20} color="#ffffff" />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <User size={20} color="#3498db" />
            <Text style={styles.settingItemText}>Profile Settings</Text>
          </View>
          <ChevronRight size={20} color="#95a5a6" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Bluetooth size={20} color="#3498db" />
            <Text style={styles.settingItemText}>Connected Devices</Text>
          </View>
          <ChevronRight size={20} color="#95a5a6" />
        </TouchableOpacity>
      </View>
      
      {/* Lock Bike Modal */}
      <Modal
        visible={showLockModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setTimerActive(false);
          setShowLockModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Lock size={24} color="#3498db" />
              <Text style={styles.modalTitle}>
                {isLocked ? "Unlock Your Bike" : "Lock Your Bike"}
              </Text>
            </View>
            
            <Text style={styles.modalDescription}>
              {isLocked 
                ? "Enter the three security words to unlock your bike." 
                : "Enter the three security words to lock and secure your bike."}
            </Text>
            
            <View style={styles.timerContainer}>
              <Clock size={18} color={timeRemaining <= 10 ? "#e74c3c" : "#3498db"} />
              <Text style={[
                styles.timerText, 
                timeRemaining <= 10 && styles.timerWarning
              ]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
            
            <View style={styles.wordInputsContainer}>
              {[0, 1, 2].map((index) => (
                <View 
                  key={index} 
                  style={[
                    styles.wordInputWrapper,
                    currentWordIndex === index && styles.wordInputWrapperActive
                  ]}
                >
                  <Text style={styles.wordLabel}>Word {index + 1}</Text>
                  <TextInput
                    ref={el => passcodeInputRefs.current[index] = el}
                    style={[
                      styles.wordInput,
                      currentWordIndex === index && styles.wordInputActive
                    ]}
                    value={passcodeWords[index]}
                    onChangeText={(text) => handleWordChange(text, index)}
                    placeholder={`Enter word ${index + 1}`}
                    placeholderTextColor="#95a5a6"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={() => handleWordSubmit(index)}
                    blurOnSubmit={false}
                    editable={currentWordIndex >= index}
                  />
                </View>
              ))}
            </View>
            
            {currentWordIndex < 3 && renderWordSuggestions(currentWordIndex)}
            
            {passcodeError ? (
              <Text style={styles.passcodeError}>{passcodeError}</Text>
            ) : null}
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setTimerActive(false);
                  setShowLockModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.modalButtonPrimary,
                  passcodeWords.some(word => !word) && styles.modalButtonDisabled
                ]}
                onPress={handlePasscodeSubmit}
                disabled={passcodeWords.some(word => !word)}
              >
                <Text style={[
                  styles.modalButtonTextPrimary,
                  passcodeWords.some(word => !word) && styles.modalButtonTextDisabled
                ]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Bottom padding */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#95a5a6',
    fontSize: 14,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  flexSpacer: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButtonUnlocked: {
    backgroundColor: '#2980b9',
  },
  actionButtonLocked: {
    backgroundColor: '#c0392b',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  actionButtonStatus: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationHeaderTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationHeaderAction: {
    color: '#3498db',
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#1e272e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  notificationItemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    color: '#bdc3c7',
    fontSize: 13,
    marginBottom: 4,
  },
  notificationTime: {
    color: '#95a5a6',
    fontSize: 12,
  },
  notificationDelete: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDeleteText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyNotifications: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e272e',
    borderRadius: 8,
  },
  emptyNotificationsText: {
    color: '#95a5a6',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e272e',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  modalDescription: {
    color: '#bdc3c7',
    fontSize: 14,
    marginBottom: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  timerText: {
    color: '#3498db',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timerWarning: {
    color: '#e74c3c',
  },
  wordInputsContainer: {
    marginBottom: 16,
  },
  wordInputWrapper: {
    marginBottom: 12,
    opacity: 0.7,
  },
  wordInputWrapperActive: {
    opacity: 1,
  },
  wordLabel: {
    color: '#bdc3c7',
    fontSize: 12,
    marginBottom: 4,
  },
  wordInput: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 14 : 10,
    color: '#ffffff',
    fontSize: 16,
  },
  wordInputActive: {
    borderWidth: 1,
    borderColor: '#3498db',
  },
  suggestionContainer: {
    marginBottom: 16,
  },
  suggestionTitle: {
    color: '#bdc3c7',
    fontSize: 12,
    marginBottom: 8,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: '#34495e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  passcodeError: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#34495e',
  },
  modalButtonPrimary: {
    backgroundColor: '#3498db',
  },
  modalButtonDisabled: {
    backgroundColor: '#7f8c8d',
    opacity: 0.7,
  },
  modalButtonText: {
    color: '#bdc3c7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextDisabled: {
    color: '#ecf0f1',
  },
}); 