import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import GlobalStyles, { colors, fonts, spacing } from './globalStyles';

export default function SuccessScreen() {
  const router = useRouter();
  const { eventID } = useLocalSearchParams();

  const handleDone = () => {
    router.replace({
        pathname: '/CaptureImageScreen',
        params: { eventID: eventID },
      }); 
  };

  return (
    <View style={styles.container}>
      {/* Lumetry logo here */}
      <Text style={styles.logoText}>Custom Logo</Text>

      {/* Success Icon */}
      <View style={styles.successIconContainer}>
        {/* <Image 
          source={require('./path/to/success-icon.png')}
          style={styles.successIcon}
        /> */}
      </View>

      <Text style={styles.title}>Success!</Text>
      <Text style={styles.message}>
        Your photos are on the way
      </Text>
      <Text style={styles.subMessage}>
        Thank you for using AiBooth! Your AI-generated photos are being delivered to you. We hope you enjoy your unique and magical memories!
      </Text>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoText: {
    color: '#FFF',
    fontSize: 24,
    marginBottom: spacing.xl,
  },
  successIconContainer: {
    backgroundColor: '#333',
    borderRadius: 100,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  successIcon: {
    width: 64,
    height: 64,
  },
  title: {
    color: '#FFF',
    fontSize: 36,
    fontFamily: fonts.bold,
    marginBottom: spacing.md,
  },
  message: {
    color: '#FFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subMessage: {
    color: '#AAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  doneButton: {
    backgroundColor: '#800000',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
});