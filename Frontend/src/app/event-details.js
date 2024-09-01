import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, SERVER_LINK } from '@env';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import GlobalStyles, { borderRadius, colors, fonts, spacing } from './globalStyles';

export default function CreateEvents() {
  const router = useRouter();
  const { eventID } = useLocalSearchParams();

  const [eventid, seteventID] = useState(null);
  const [eventNameInput, setEventNameInput] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [promptTitle, setPromptTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPlacement, setLogoPlacement] = useState('');


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${SERVER_LINK}/events`);
        const events = response.data.data;
        const event = events.find(event => event._id === eventID);

        if (event) {
          seteventID(event._id);
          setEventNameInput(event.event_name);
          setEventDate(new Date(event.event_date));
          setPromptTitle(event.promptTitle);
          setPrompt(event.prompt);
          setNegativePrompt(event.negative_prompt);
          setLogoUrl(event.event_logo);
          setLogoPlacement(event.logo_placement);
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

  const uploadImageToCloudinary = async (photoUri) => {
    const data = new FormData();
    data.append('file', photoUri);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error.response ? error.response.data : error.message);
      throw new Error('Failed to upload image');
    }
  };
  

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${SERVER_LINK}/update-event`, {
        eventID: eventid,
        eventName: eventNameInput,
        eventDate,
        promptTitle,
        prompt,
        negativePrompt,
        event_logo: logoUrl,
        logo_placement: logoPlacement,
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'Event updated successfully');
      } else {
        Alert.alert('Error', response.data.data);
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to update event');
    }
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant permission to access the media library.');
      return;
    }
  
    // Open image picker and allow the user to select an image
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      try {
        setLogoUrl(result.assets[0].uri);
        setLoading(true);
        const secureUrl = await uploadImageToCloudinary(result.assets[0].uri);
        setLogoUrl(secureUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      } finally {
        setLoading(false);
      }
    }    
  };
  

  const handleStartEvent = () => {
    router.push({
      pathname: '/CaptureImageScreen',
      params: { eventID: eventid,  event_logo: logoUrl},
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
      {logoUrl && (
        <Image 
        source={{ uri: logoUrl }}
          style={{ width: 50, height: 50, borderRadius: 10, marginBottom: 20 }} 
        />
      )}
        
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
      <TouchableOpacity style={{ ...GlobalStyles.button, marginBottom: spacing.md }} onPress={pickImage}>
        <Text style={GlobalStyles.buttonText}>Select Event Logo</Text>
      </TouchableOpacity>

      {/* Picker for logo placement */}
      <View style={{ ...GlobalStyles.textInput, marginBottom: spacing.md }}>
        <Picker
          selectedValue={logoPlacement}
          onValueChange={(itemValue) => setLogoPlacement(itemValue)}
          style={{ height: 50, width: '100%' }}
        >
          <Picker.Item label="Disable" value="" />
          <Picker.Item label="Bottom Left" value="BL" />
          <Picker.Item label="Bottom Right" value="BR" />
        </Picker>
      </View>


      <View style={styles.buttonContainer}>
        <TouchableOpacity style={{...GlobalStyles.button, backgroundColor: 'transparent', width: '48%'}} onPress={() => router.back()}>
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