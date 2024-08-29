import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity, Picker } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { SERVER_LINK } from '@env';
import GlobalStyles, { borderRadius, colors, fonts, spacing } from './globalStyles';

export default function ViewGalleryScreen() {
  const router = useRouter();
  const { eventID, eventName } = useLocalSearchParams();
  const [eventGallery, setEventGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [sortOption, setSortOption] = useState('all');

  useEffect(() => {
    const fetchEventGallery = async () => {
      try {
        const response = await axios.get(`${SERVER_LINK}/events`);
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

  const sortGallery = (gallery, option) => {
    switch(option) {
      case 'received':
        return gallery.filter(item => !item.sent || item.sent === 'received');
      case 'sent':
        return gallery.filter(item => item.sent === 'sent');
      case 'processing':
        return gallery.filter(item => item.sent === 'processing');
      default:
        return gallery;
    }
  };

  const sortedGallery = sortGallery(eventGallery.slice().reverse(), sortOption);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={fonts.display}>Loading gallery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{...fonts.display, textAlign: 'center'}}>Gallery for {eventName}</Text>
      
      {/* Dropdown for sorting */}
      <Picker
        selectedValue={sortOption}
        style={{ height: 50, width: 150, marginBottom: spacing.md }}
        onValueChange={(itemValue) => setSortOption(itemValue)}
      >
        <Picker.Item label="All" value="all" />
        <Picker.Item label="Received" value="received" />
        <Picker.Item label="Sent" value="sent" />
        <Picker.Item label="Processing" value="processing" />
      </Picker>

      <TouchableOpacity 
        style={{...GlobalStyles.button, backgroundColor: 'transparent', textAlign: 'center', marginBottom: spacing.lg}} 
        onPress={() => router.back()} >
        <Text style={GlobalStyles.buttonText}>Go back</Text>
      </TouchableOpacity>
      
      {sortedGallery.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {sortedGallery.map((item, index) => (
            <Image 
              key={index}
              source={{ uri: item.imageUrl }}
              style={{
                width: dimensions.width / 5,
                height: dimensions.width / 5,
                borderRadius: borderRadius.md,
              }}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={fonts.display}>There is nothing to display in the gallery.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[300],
  },
  scrollView: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});