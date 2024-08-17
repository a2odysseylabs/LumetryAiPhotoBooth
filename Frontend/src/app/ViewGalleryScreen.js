import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

export default function ViewGalleryScreen() {
  const { eventID } = useLocalSearchParams();
  const [eventGallery, setEventGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventGallery = async () => {
      try {
        const response = await axios.get('http://localhost:5001/events');
        const events = response.data.data;
        const event = events.find(event => event._id === eventID);

        if (event && Array.isArray(event.event_gallery)) {
          setEventGallery(event.event_gallery);
        } else {
          Alert.alert('Error', 'No gallery found for this event.');
        }
      } catch (error) {
        console.error('Error fetching event gallery:', error);
        Alert.alert('Error', 'Failed to fetch event gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchEventGallery();
  }, [eventID]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading gallery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {eventGallery.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {eventGallery.map((item, index) => (
            <Image 
              key={index}
              source={{ uri: item.imageUrl }}
              style={styles.image}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.message}>There is nothing to display in the gallery.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 8,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});