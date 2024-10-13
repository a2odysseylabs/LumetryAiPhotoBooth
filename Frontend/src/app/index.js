import React, { useState, useEffect } from 'react';
import { Dimensions, Image, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import * as Font from 'expo-font';
import { SERVER_LINK } from '@env';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import Logo from '../../assets/lumetry.svg';
import GlobalStyles, { colors, fonts, spacing } from './globalStyles';
import KeyboardAvoidingContainer from './components/keyboardAvoidingContainer';
import GradientButton from './components/GradientButton';

function LoginPage() {
    const router = useRouter(); // Use useRouter from expo-router instead of useNavigation
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const isMobile = Dimensions.get('window').width < 600

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
        <KeyboardAvoidingContainer style={{...styles.container, width: isMobile ? '100%' : 450,}}>
            <Logo width={300} height={80} />
            <Text style={{
                ...fonts.wide, 
                color: colors.lightGray, 
                textAlign: "center", 
                marginBottom: spacing.xl
            }}>
                AI Photo Booth
            </Text>
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
            <GradientButton 
                disabled={loading}
                onPress={handleLogin}
            >
                {!loading ? 'Login' : '...Starting server'}
            </GradientButton>
        </KeyboardAvoidingContainer>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    margin: 'auto',
  },
});

export default LoginPage;