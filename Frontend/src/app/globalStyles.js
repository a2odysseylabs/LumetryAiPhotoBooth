// GlobalStyles.js
import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#641A1A',
    gray: {
        400: '#111111',
        300: '#161616',
        200: '#1A1A1A',
        100: '#272727',
    },
    lightGray: '#999999',
    text: '#ffffff',
};

export const spacing = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const fonts = {
    light: 'kanit-light',
    regular: 'kanit-regular',
    bold: 'kanit-bold',
    size_14: 14,
    size_18: 18,
    size_24: 24,
    size_32: 32,
    size_: 48,
    display: {
        fontSize: 24,
        fontFamily: 'kanit-bold',
        marginBottom: spacing.md,
        color: colors.text,
    }
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
};

const GlobalStyles = StyleSheet.create({
    textInput: {
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: borderRadius.md,
        color: colors.text,
        fontSize: fonts.size_18,
        fontFamily: fonts.regular,
        marginBottom: spacing.md,
        padding: spacing.md,
        placeholderTextColor: colors.lightGray,
        width: '100%',  
    },
    eventCard: {
        backgroundColor: colors.gray[400],
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, 
        shadowRadius: 3.84, 
        elevation: 5,
    },
    button: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: colors.text,
        fontSize: fonts.size_18,
        fontFamily: fonts.bold,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
});

export default GlobalStyles; 