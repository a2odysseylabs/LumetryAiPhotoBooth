import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import GlobalStyles, { borderRadius, colors, fonts, spacing } from './globalStyles';
import { useNavigation } from '@react-navigation/native';

export default function ViewGalleryScreen() {
  const navigation = useNavigation();

  const { eventID } = useLocalSearchParams();
  const [eventGallery, setEventGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

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
        <Text style={fonts.display}>Loading gallery...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{...fonts.display, textAlign: 'center'}}>Gallery for {eventID}</Text>
      <TouchableOpacity style={{...GlobalStyles.button, backgroundColor: 'transparent', textAlign: 'center', marginBottom: spacing.lg}} onPress={() => navigation.goBack()}>
        <Text style={GlobalStyles.buttonText}>Go back</Text>
      </TouchableOpacity>
      {eventGallery.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {eventGallery.map((item, index) => (
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