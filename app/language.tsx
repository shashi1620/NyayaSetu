import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { useState, useRef, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

const languages = [
    { code: 'en', name: 'English', native: 'English', english: 'English — All India', icon: '🏛️', desc: 'Continue in English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', english: 'Hindi — North India', icon: '🕍', desc: 'हिंदी में जारी रखें' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', english: 'Tamil — Tamil Nadu', icon: '🛕', desc: 'தமிழில் தொடரவும்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', english: 'Telugu — Andhra & Telangana', icon: '🏯', desc: 'తెలుగులో కొనసాగించండి' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', english: 'Kannada — Karnataka', icon: '🐘', desc: 'ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ' },
];

export default function LanguageScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular });
    const [selected, setSelected] = useState('en');

    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerY = useRef(new Animated.Value(-30)).current;
    const logoFloat = useRef(new Animated.Value(0)).current;
    const shimmer = useRef(new Animated.Value(0)).current;
    const ring1Scale = useRef(new Animated.Value(1)).current;
    const ring2Scale = useRef(new Animated.Value(1)).current;
    const ring3Scale = useRef(new Animated.Value(1)).current;
    const bg1Opacity = useRef(new Animated.Value(0)).current;
    const bg2Opacity = useRef(new Animated.Value(0)).current;
    const bg3Opacity = useRef(new Animated.Value(0)).current;
    const btnOpacity = useRef(new Animated.Value(0)).current;
    const btnY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Background icons
        Animated.stagger(200, [
            Animated.timing(bg1Opacity, { toValue: 0.1, duration: 1000, useNativeDriver: true }),
            Animated.timing(bg2Opacity, { toValue: 0.08, duration: 1000, useNativeDriver: true }),
            Animated.timing(bg3Opacity, { toValue: 0.09, duration: 1000, useNativeDriver: true }),
        ]).start();

        // Header entrance
        Animated.parallel([
            Animated.timing(headerOpacity, {
                toValue: 1, duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(headerY, {
                toValue: 0, friction: 8, tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Logo float
        Animated.loop(
            Animated.sequence([
                Animated.timing(logoFloat, {
                    toValue: -8, duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(logoFloat, {
                    toValue: 0, duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Shimmer
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1, duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(shimmer, {
                    toValue: 0, duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Ripple rings
        Animated.loop(
            Animated.sequence([
                Animated.timing(ring1Scale, {
                    toValue: 1.5, duration: 2200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(ring1Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.delay(700),
                Animated.timing(ring2Scale, {
                    toValue: 1.5, duration: 2200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(ring2Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.delay(1400),
                Animated.timing(ring3Scale, {
                    toValue: 1.5, duration: 2200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(ring3Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
            ])
        ).start();

        // Button
        Animated.sequence([
            Animated.delay(600),
            Animated.parallel([
                Animated.timing(btnOpacity, {
                    toValue: 1, duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(btnY, {
                    toValue: 0, friction: 8, tension: 40,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const shimmerOpacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.9],
    });

    if (!fontsLoaded) return null;

    const handleContinue = async () => {
        await AsyncStorage.setItem('selectedLanguage', selected);
        router.replace('/onboarding');
    };

    const selectedLang = languages.find(l => l.code === selected);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D0B2B" />

            <LinearGradient
                colors={['#080620', '#0D0B2B', '#1E1B4B', '#2D2D7B']}
                style={styles.bgGradient}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
            />

            {/* Static rings */}
            <View style={styles.staticRing1} />
            <View style={styles.staticRing2} />

            {/* Background icons */}
            <Animated.Text style={[styles.bgIcon, styles.bgIcon1, { opacity: bg1Opacity }]}>⚖️</Animated.Text>
            <Animated.Text style={[styles.bgIcon, styles.bgIcon2, { opacity: bg2Opacity }]}>🏛️</Animated.Text>
            <Animated.Text style={[styles.bgIcon, styles.bgIcon3, { opacity: bg3Opacity }]}>📜</Animated.Text>

            {/* Header */}
            <Animated.View style={[styles.header, {
                opacity: headerOpacity,
                transform: [{ translateY: headerY }]
            }]}>
                <View style={styles.rippleContainer}>
                    <Animated.View style={[styles.rippleRing, {
                        transform: [{ scale: ring1Scale }],
                        opacity: ring1Scale.interpolate({ inputRange: [1, 1.5], outputRange: [0.35, 0] })
                    }]} />
                    <Animated.View style={[styles.rippleRing, {
                        transform: [{ scale: ring2Scale }],
                        opacity: ring2Scale.interpolate({ inputRange: [1, 1.5], outputRange: [0.25, 0] })
                    }]} />
                    <Animated.View style={[styles.rippleRing, {
                        transform: [{ scale: ring3Scale }],
                        opacity: ring3Scale.interpolate({ inputRange: [1, 1.5], outputRange: [0.15, 0] })
                    }]} />

                    <View style={styles.iconGlow}>
                        <Animated.Text style={[styles.logo, {
                            transform: [{ translateY: logoFloat }]
                        }]}>⚖️</Animated.Text>
                    </View>
                </View>

                <Text style={styles.appName}>NyayaSetu</Text>
                <Animated.View style={[styles.shimmerLine, { opacity: shimmerOpacity }]} />
                <Text style={styles.title}>Choose Your Language</Text>
                <Text style={styles.subtitle}>
                    अपनी भाषा चुनें • ನಿಮ್ಮ ಭಾಷೆ ಆರಿಸಿ{'\n'}
                    உங்கள் மொழி • మీ భాష
                </Text>
            </Animated.View>

            {/* Language cards — no animation */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {languages.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.langCard,
                            selected === lang.code && styles.langCardSelected
                        ]}
                        onPress={() => setSelected(lang.code)}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.iconBox,
                            selected === lang.code && styles.iconBoxSelected
                        ]}>
                            <Text style={styles.langIcon}>{lang.icon}</Text>
                        </View>

                        <View style={styles.langInfo}>
                            <Text style={[
                                styles.langNative,
                                selected === lang.code && styles.langNativeSelected
                            ]}>
                                {lang.native}
                            </Text>
                            <Text style={styles.langEnglish}>{lang.english}</Text>
                            <Text style={[
                                styles.langDesc,
                                selected === lang.code && styles.langDescSelected
                            ]}>
                                {lang.desc}
                            </Text>
                        </View>

                        <View style={[
                            styles.radio,
                            selected === lang.code && styles.radioSelected
                        ]}>
                            {selected === lang.code && <View style={styles.radioDot} />}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Bottom button */}
            <Animated.View style={[styles.bottom, {
                opacity: btnOpacity,
                transform: [{ translateY: btnY }]
            }]}>
                <TouchableOpacity
                    style={styles.btn}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#1E1B4B', '#3730A3']}
                        style={styles.btnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.btnText}>
                            Continue in {selectedLang?.name} →
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgGradient: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '48%',
    },
    staticRing1: {
        position: 'absolute',
        width: 380, height: 380,
        borderRadius: 190,
        borderWidth: 1,
        borderColor: 'rgba(165,180,252,0.07)',
        top: -130, left: -90,
    },
    staticRing2: {
        position: 'absolute',
        width: 260, height: 260,
        borderRadius: 130,
        borderWidth: 1,
        borderColor: 'rgba(165,180,252,0.05)',
        top: 10, right: -70,
    },
    bgIcon: {
        position: 'absolute',
        fontSize: 120,
    },
    bgIcon1: { top: -20, left: -30 },
    bgIcon2: { top: 50, right: -25 },
    bgIcon3: { top: height * 0.18, left: width * 0.35 },
    header: {
        alignItems: 'center',
        paddingTop: 55,
        paddingBottom: 16,
        paddingHorizontal: 24,
    },
    rippleContainer: {
        width: 90, height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    rippleRing: {
        position: 'absolute',
        width: 80, height: 80,
        borderRadius: 40,
        borderWidth: 1.5,
        borderColor: 'rgba(165,180,252,0.6)',
    },
    iconGlow: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(165,180,252,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(165,180,252,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: { fontSize: 38 },
    appName: {
        fontSize: 32,
        fontFamily: 'DMSerifDisplay_400Regular',
        color: '#FFFFFF',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    shimmerLine: {
        width: 40, height: 1,
        backgroundColor: 'rgba(165,180,252,0.6)',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 11,
        color: 'rgba(165,180,252,0.7)',
        textAlign: 'center',
        lineHeight: 18,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#F8FAFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 8,
        gap: 10,
    },
    langCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        shadowColor: '#1E1B4B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    langCardSelected: {
        borderColor: '#3730A3',
        backgroundColor: '#EEF2FF',
    },
    iconBox: {
        width: 58, height: 58,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    iconBoxSelected: { backgroundColor: '#C7D2FE' },
    langIcon: { fontSize: 30 },
    langInfo: { flex: 1 },
    langNative: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E1B4B',
        marginBottom: 2,
    },
    langNativeSelected: { color: '#3730A3' },
    langEnglish: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 2,
        fontWeight: '500',
    },
    langDesc: { fontSize: 12, color: '#6B7280' },
    langDescSelected: { color: '#4F46E5' },
    radio: {
        width: 24, height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: { borderColor: '#3730A3' },
    radioDot: {
        width: 12, height: 12,
        borderRadius: 6,
        backgroundColor: '#3730A3',
    },
    bottom: {
        padding: 16,
        paddingBottom: 32,
        backgroundColor: '#F8FAFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    btn: { borderRadius: 14, overflow: 'hidden', elevation: 3 },
    btnGradient: { padding: 18, alignItems: 'center' },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});