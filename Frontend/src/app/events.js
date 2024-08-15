import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EventsDisplay() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newNegativePrompt, setNewNegativePrompt] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5001/events');
        console.log(response);
        setEvents(response.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    setNewEventDate(selectedDate || newEventDate);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleSaveNewEvent = async () => {
    // Ensure the event name is unique
    const existingEvent = events.find(event => event.event_name === newEventName);
    if (existingEvent) {
      Alert.alert('Error', 'Event name must be unique');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/create-event', {
        eventName: newEventName,
        eventDate: newEventDate.toISOString(),
        prompt: newPrompt,
        negativePrompt: newNegativePrompt
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'Event created successfully');
        setEvents([...events, response.data.data]);
        toggleModal();
      } else {
        Alert.alert('Error', response.data.data);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const renderEventItem = (event) => (
    <Pressable
      style={styles.eventItem}
      key={event._id}
      onPress={() =>
        router.push({
          pathname: '/event-details',
          params: { eventName: event.event_name },
        })
      }
    >
      <Text style={styles.eventName}>{event.event_name}</Text>
      <Text style={styles.eventDate}>{event.event_date}</Text>
    </Pressable>
  );

  const renderAddNewEvent = () => (
    <TouchableOpacity style={styles.addNewEvent} onPress={toggleModal}>
      <Text style={styles.addNewEventText}>Add New Event</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.gridContainer}>
          {events.map(renderEventItem)}
          {renderAddNewEvent()}
        </View>
      </ScrollView>

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Name"
            placeholderTextColor="#999"
            onChangeText={setNewEventName}
            value={newEventName}
          />
          <TouchableOpacity onPress={showDatePickerModal}>
            <Text style={styles.input}>
              {newEventDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={newEventDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Prompt"
            placeholderTextColor="#999"
            onChangeText={setNewPrompt}
            value={newPrompt}
          />
          <TextInput
            style={styles.input}
            placeholder="Negative Prompt"
            placeholderTextColor="#999"
            onChangeText={setNewNegativePrompt}
            value={newNegativePrompt}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleModal}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveNewEvent}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center', // Center the loader
    alignItems: 'center', // Center the loader
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  eventDate: {
    color: '#A0A0A0',
    fontSize: 12,
    textAlign: 'center',
  },
  addNewEvent: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3A3A3A',
    borderStyle: 'dashed',
  },
  addNewEventText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#8B0000', // Dark red color
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});