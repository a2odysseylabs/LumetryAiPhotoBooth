import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { SERVER_LINK } from '@env';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import Logo from '../../assets/lumetry.svg';
import GlobalStyles, { colors, fonts, spacing } from './globalStyles';

function LoginPage() {
    const router = useRouter(); // Use useRouter from expo-router instead of useNavigation
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadFonts() {
          await Font.loadAsync({
            'kanit-light': require('../../assets/fonts/Kanit-Light.ttf'),
            'kanit-regular': require('../../assets/fonts/Kanit-Regular.ttf'),
            'kanit-bold': require('../../assets/fonts/Kanit-Bold.ttf'),
          });
        }
        loadFonts();
    }, []);

    const handleLogin = () => {
        const userData = {
            username: username,
            password: password,
        };
        setLoading(true);
        axios.post(`${SERVER_LINK}/login-user`, userData)
            .then(res => {
                if (res.data.status === 'ok') {
                    router.push('/events'); // Navigate using the router from expo-router
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/lumetry.svg')} style={{}} />
            <Logo width={300} height={80} />
            <Text style={{...fonts.wide, color: colors.lightGray, textAlign: "center", marginBottom: spacing.xl}}>AI Photo Booth</Text>
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
            <TouchableOpacity style={{...GlobalStyles.button, backgroundColor: loading ? colors.gray[100] : colors.primary}} onPress={handleLogin}>
                <Text style={GlobalStyles.buttonText}>{!loading ? 'Login' : '...Starting server'}</Text>
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