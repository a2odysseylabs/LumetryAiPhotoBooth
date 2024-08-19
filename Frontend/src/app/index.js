import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Font from 'expo-font';

import GlobalStyles, { colors, fonts } from './globalStyles';

function LoginPage() {
    const router = useRouter(); // Use useRouter from expo-router instead of useNavigation
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function loadFonts() {
      await Font.loadAsync({
          'kanit-light': require('../../assets/fonts/Kanit-Light.ttf'),
          'kanit-regular': require('../../assets/fonts/Kanit-Regular.ttf'),
          'kanit-bold': require('../../assets/fonts/Kanit-Bold.ttf'),
      });
    }
    loadFonts() // Call the function to load the fonts

    const handleLogin = () => {
        const userData = {
            username: username,
            password: password,
        };
        axios.post('http://localhost:5001/login-user', userData)
            .then(res => {
                if (res.data.status === 'ok') {
                    router.push('/events'); // Navigate using the router from expo-router
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <View style={styles.container}>
            <Text style={fonts.display}>Lumetry AI Photo Booth</Text>
            <TextInput
                style={GlobalStyles.textInput}
                placeholder="Username"
                onChangeText={setUsername}
                value={username}
                placeholderTextColor={colors.lightGray}
            />
            <TextInput
                style={GlobalStyles.textInput}
                placeholder="Password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
                placeholderTextColor={colors.lightGray}
            />
            <TouchableOpacity style={GlobalStyles.button} onPress={handleLogin}>
                <Text style={GlobalStyles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.gray[300],
  },
});

export default LoginPage;