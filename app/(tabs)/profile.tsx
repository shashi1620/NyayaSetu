import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { translations, Language } from '../constants/translations';

export default function ProfileScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular });
    const [lang, setLang] = useState<Language>('en');
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');

    useEffect(() => {
        AsyncStorage.getItem('selectedLanguage').then(val => {
            if (val) setLang(val as Language);
        });
        AsyncStorage.getItem('userName').then(val => {
            if (val) setUserName(val);
        });
        AsyncStorage.getItem('userPhone').then(val => {
            if (val) setUserPhone(val);
        });
    }, []);

    const t = translations[lang];

    const handleLogout = () => {
        Alert.alert(
            t.profileLogoutTitle,
            t.profileLogoutMsg,
            [
                { text: t.profileCancel, style: 'cancel' },
                {
                    text: t.profileLogout,
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('isLoggedIn');
                        await AsyncStorage.removeItem('userName');
                        await AsyncStorage.removeItem('userPhone');
                        await AsyncStorage.removeItem('selectedLanguage');
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    const handleChangeLanguage = () => {
        router.push('/language');
    };

    if (!fontsLoaded) return null;

    const initials = userName
        ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'NS';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

            <LinearGradient
                colors={['#1E1B4B', '#2D2D7B', '#3730A3']}
                style={styles.header}
            >
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.userName}>{userName || 'NyayaSetu User'}</Text>
                <Text style={styles.userPhone}>{userPhone ? `+91 ${userPhone}` : 'Guest User'}</Text>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

                <Text style={styles.sectionTitle}>{t.profileAccount}</Text>

                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardIcon}>👤</Text>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardLabel}>{t.profileFullName}</Text>
                            <Text style={styles.cardValue}>{userName || 'Not set'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardIcon}>📱</Text>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardLabel}>{t.profileMobile}</Text>
                            <Text style={styles.cardValue}>{userPhone ? `+91 ${userPhone}` : 'Not set'}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t.profilePreferences}</Text>

                <TouchableOpacity style={styles.card} onPress={handleChangeLanguage} activeOpacity={0.7}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardIcon}>🌐</Text>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardLabel}>{t.profileLanguage}</Text>
                            <Text style={styles.cardValue}>
                                {lang === 'en' ? '🏛️ English' :
                                    lang === 'hi' ? '🕍 Hindi — हिंदी' :
                                        lang === 'ta' ? '🛕 Tamil — தமிழ்' :
                                            lang === 'te' ? '🏯 Telugu — తెలుగు' :
                                                lang === 'kn' ? '🐘 Kannada — ಕನ್ನಡ' : 'English'}
                            </Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>{t.profileAbout}</Text>

                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardIcon}>⚖️</Text>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardLabel}>{t.profileAppName}</Text>
                            <Text style={styles.cardValue}>NyayaSetu</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardIcon}>📱</Text>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardLabel}>{t.profileVersion}</Text>
                            <Text style={styles.cardValue}>1.0.0</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Text style={styles.logoutText}>{t.profileLogout}</Text>
                </TouchableOpacity>

                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>{t.profileDisclaimer}</Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFF' },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
    userName: {
        fontSize: 22,
        fontFamily: 'DMSerifDisplay_400Regular',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userPhone: { fontSize: 14, color: '#A5B4FC' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        marginBottom: 8,
        padding: 16,
        shadowColor: '#1E1B4B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: { fontSize: 22, marginRight: 14 },
    cardInfo: { flex: 1 },
    cardLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
    cardValue: { fontSize: 15, fontWeight: '600', color: '#1E1B4B' },
    chevron: { fontSize: 20, color: '#9CA3AF' },
    logoutBtn: {
        backgroundColor: '#FEF2F2',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: { color: '#DC2626', fontSize: 16, fontWeight: '700' },
    disclaimer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    disclaimerText: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 16,
    },
});