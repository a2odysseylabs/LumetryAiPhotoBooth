import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import events from '../../assets/fake_data/events.json';
import { Link } from 'expo-router';

export default function App() {
  const renderEventItem = (event) => (
    <Link href={{
      pathname: '/events',
      params: { eventName: event.event_name }
    }} asChild key={event.event_name}>
      <Pressable style={styles.eventItem} key={event.event_name}>
        <Text style={styles.eventName}>{event.event_name}</Text>
        <Text style={styles.eventDate}>{event.event_date}</Text>
      </Pressable>
    </Link>
  );

  const renderAddNewEvent = () => (
    <TouchableOpacity style={styles.addNewEvent}>
      <Text style={styles.addNewEventText}>Add New Event</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.gridContainer}>
          {events.map(renderEventItem)}
          {renderAddNewEvent()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
});