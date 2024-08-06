import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRoute } from '@react-navigation/native';
import events from '../../assets/fake_data/events.json';

export default function CreateEvents() {
  const route = useRoute();
  const eventName = route.params?.eventName;

  const eventDetails = useMemo(() => {
    return events.find(event => event.event_name === eventName) || events[0];
  }, [eventName]);

  const [eventNameInput, setEventNameInput] = useState(eventDetails.event_name);
  const [eventDate, setEventDate] = useState(eventDetails.event_date);
  const [prompt, setPrompt] = useState(eventDetails.prompt);
  const [negativePrompt, setNegativePrompt] = useState(eventDetails.negative_prompt);

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
          <TouchableOpacity style={[styles.button, styles.saveButton]}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fullWidthButton}>
          <Text style={styles.buttonText}>Start Event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fullWidthButton}>
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