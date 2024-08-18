import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

import GlobalStyles, { borderRadius, colors, fonts, spacing } from './globalStyles';

export default function CreateEvents() {
  const router = useRouter();
  const navigation = useNavigation();
  const { eventID } = useLocalSearchParams();

  const [eventid, seteventID] = useState(null);
  const [eventNameInput, setEventNameInput] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [promptTitle, setPromptTitle] = useState('');
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
          setEventDate(new Date(event.event_date));
          setPromptTitle(event.promptTitle);
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

  const handleDateChange = (event, selectedDate) => {
    setEventDate(selectedDate || eventDate);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:5001/update-event', {
        eventID: eventid,
        eventName: eventNameInput,
        eventDate,
        promptTitle,
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
      params: { eventID: eventid, eventName: eventNameInput },
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

      <Text style={styles.logo}>Custom Logo</Text>
        
      <TextInput
        style={GlobalStyles.textInput}
        placeholder="Event Name"
        placeholderTextColor={colors.lightGray}
        onChangeText={setEventNameInput}
        value={eventNameInput}
        editable={false}
      />
      {/* <TextInput
        style={GlobalStyles.textInput}
        placeholder="Event Date"
        placeholderTextColor={colors.lightGray}
        onChangeText={setEventDate}
        value={eventDate}
      /> */}
      <View style={{...GlobalStyles.textInput, display: 'flex', alignItems: 'start', paddingLeft: 0}}>
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          themeVariant="dark" // ios only
        />
      </View>
        
      <TextInput
        style={GlobalStyles.textInput}
        placeholder="Prompt title"
        placeholderTextColor={colors.lightGray}
        onChangeText={setPromptTitle}
        value={promptTitle}
      />
      <TextInput
        style={GlobalStyles.textInput}
        placeholder="Prompt"
        placeholderTextColor={colors.lightGray}
        onChangeText={setPrompt}
        value={prompt}
      />
      <TextInput
        style={GlobalStyles.textInput}
        placeholder="Negative Prompt"
        placeholderTextColor={colors.lightGray}
        onChangeText={setNegativePrompt}
        value={negativePrompt}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={{...GlobalStyles.button, backgroundColor: 'transparent', width: '48%'}} onPress={() => navigation.goBack()}>
          <Text style={GlobalStyles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{...GlobalStyles.button, width: '48%'}} onPress={handleSave}>
          <Text style={GlobalStyles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={{...GlobalStyles.button, marginBottom: spacing.md}} onPress={handleStartEvent}>
        <Text style={GlobalStyles.buttonText}>Start Event</Text>
      </TouchableOpacity>

      <TouchableOpacity style={GlobalStyles.button} onPress={handleViewGallery}>
        <Text style={GlobalStyles.buttonText}>View Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[300],
    padding: 20,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    ...GlobalStyles.buttonContainer,
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomColor: colors.gray[100],
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
});