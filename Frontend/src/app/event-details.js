import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

export default function CreateEvents() {
  const router = useRouter();
  const { eventID } = useLocalSearchParams();

  const [eventid, seteventID] = useState(null);
  const [eventNameInput, setEventNameInput] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5001/events');
        const events = response.data.data;
        const event = events.find(event => event._id === eventID);

        if (event) {
          seteventID(event._id);
          setEventNameInput(event.event_name);
          setEventDate(event.event_date);
          setPrompt(event.prompt);
          setNegativePrompt(event.negative_prompt);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        Alert.alert('Error', 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventID]);

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:5001/update-event', {
        eventID: eventid,
        eventName: eventNameInput,
        eventDate,
        prompt,
        negativePrompt
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'Event updated successfully');
      } else {
        Alert.alert('Error', response.data.data);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to update event');
    }
  };

  const handleStartEvent = () => {
    router.push({
      pathname: '/CaptureImageScreen',
      params: { eventID: eventid },
    });
  };  

  const handleViewGallery = () => {
    router.push({
      pathname: '/ViewGalleryScreen',
      params: { eventID: eventid },
    });    
  };

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
      <View style={styles.content}>
        <Text style={styles.logo}>Custom Logo</Text>
        
        <View style={styles.eventDetails}>
          <TextInput
            style={styles.input}
            placeholder="Event Name"
            placeholderTextColor="#999"
            onChangeText={setEventNameInput}
            value={eventNameInput}
            // editable={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Event Date"
            placeholderTextColor="#999"
            onChangeText={setEventDate}
            value={eventDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Prompt"
            placeholderTextColor="#999"
            onChangeText={setPrompt}
            value={prompt}
            />
            <TextInput
              style={styles.input}
              placeholder="Negative Prompt"
              placeholderTextColor="#999"
              onChangeText={setNegativePrompt}
              value={negativePrompt}
            />
          </View>
  
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
  
          <TouchableOpacity style={styles.fullWidthButton} onPress={handleStartEvent}>
            <Text style={styles.buttonText}>Start Event</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.fullWidthButton} onPress={handleViewGallery}>
            <Text style={styles.buttonText}>View Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212',
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: 'space-between',
    },
    logo: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    eventDetails: {
      backgroundColor: '#1E1E1E',
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
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
      marginBottom: 20,
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
    fullWidthButton: {
      backgroundColor: '#8B0000', // Dark red color
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      textAlign: 'center',
    },
  });