import React from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
} from "react-native";
import GlobalStyles, { colors, fonts, spacing } from "../globalStyles";

const EmailInput = ({ email, setEmail }) => {
    // The list of available email domains
    const domains = [
        "gmail.com",
        "outlook.com",
        "yahoo.com",
        "icloud.com",
        "hotmail.com",
    ];

    const handleSelectDomain = (domain) => {
        const [username] = email.split("@");
        setEmail(`${username}@${domain}`);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={{
                    ...GlobalStyles.textInput,
                    padding: spacing.xl,
                    fontSize: fonts.size_32,
                    marginBottom: spacing.lg,
                }}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoComplete="off" // Disables autocomplete for privacy
                autoCorrect={false} // Disables autocorrect
                value={email}
                onChangeText={(text) => setEmail(text)}
            />

            <View style={styles.buttonContainer}>
                {domains.map((domain) => (
                    <TouchableOpacity
                        key={domain}
                        style={styles.domainButton}
                        onPress={() => handleSelectDomain(domain)}
                    >
                        <Text style={styles.domainText}>@{domain}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: spacing.lg,
    },
    domainButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 4,
        backgroundColor: colors.gray[100],
    },
    domainText: {
        color: colors.lightGray,
        fontSize: 14,
    },
});

export default EmailInput;
