import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './LoginPage';
import EventsDisplay from './EventsDisplay';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginPage">
        <Stack.Screen name="LoginPage" component={LoginPage} options={{ headerShown: false }} />
        <Stack.Screen name="EventsDisplay" component={EventsDisplay} />
        <Stack.Screen name="CaptureImageScreen" component={CaptureImageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
