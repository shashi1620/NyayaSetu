import { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, StatusBar, KeyboardAvoidingView,
    Platform, ScrollView, Animated, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular });
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerY = useRef(new Animated.Value(-30)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardY = useRef(new Animated.Value(40)).current;
    const bg1Opacity = useRef(new Animated.Value(0)).current;
    const bg2Opacity = useRef(new Animated.Value(0)).current;
    const bg3Opacity = useRef(new Animated.Value(0)).current;
    const circle1Scale = useRef(new Animated.Value(0.8)).current;
    const circle2Scale = useRef(new Animated.Value(0.8)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Background icons
        Animated.stagger(150, [
            Animated.timing(bg1Opacity, { toValue: 0.1, duration: 800, useNativeDriver: true }),
            Animated.timing(bg2Opacity, { toValue: 0.08, duration: 800, useNativeDriver: true }),
            Animated.timing(bg3Opacity, { toValue: 0.09, duration: 800, useNativeDriver: true }),
        ]).start();

        // Header animation
        Animated.parallel([
            Animated.timing(headerOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(headerY, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]).start();

        // Card animation
        Animated.sequence([
            Animated.delay(300),
            Animated.parallel([
                Animated.timing(cardOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(cardY, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
        ]).start();

        // Float logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();

        // Rotate scale
        Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
                Animated.timing(rotateAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
            ])
        ).start();

        // Circles breathe
        Animated.loop(
            Animated.sequence([
                Animated.timing(circle1Scale, { toValue: 1.1, duration: 3000, useNativeDriver: true }),
                Animated.timing(circle1Scale, { toValue: 0.9, duration: 3000, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(circle2Scale, { toValue: 0.9, duration: 3500, useNativeDriver: true }),
                Animated.timing(circle2Scale, { toValue: 1.1, duration: 3500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-5deg', '5deg'],
    });

    if (!fontsLoaded) return null;

    const handleSendOtp = () => {
        if (!name || phone.length !== 10) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return;
        setLoading(true);
        setTimeout(async () => {
            await AsyncStorage.setItem('isLoggedIn', 'true');
            await AsyncStorage.setItem('userName', name);
            await AsyncStorage.setItem('userPhone', phone);
            setLoading(false);
            router.replace('/language');
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor="#080620" />

            {/* Animated background */}
            <LinearGradient
                colors={['#080620', '#0D0B2B', '#1E1B4B', '#2D2D7B']}
                style={styles.bgGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Circles */}
                <Animated.View style={[styles.circle1, { transform: [{ scale: circle1Scale }] }]} />
                <Animated.View style={[styles.circle2, { transform: [{ scale: circle2Scale }] }]} />

                {/* Background icons */}
                <Animated.Text style={[styles.bgIcon, styles.bgIcon1, { opacity: bg1Opacity }]}>⚖️</Animated.Text>
                <Animated.Text style={[styles.bgIcon, styles.bgIcon2, { opacity: bg2Opacity }]}>🏛️</Animated.Text>
                <Animated.Text style={[styles.bgIcon, styles.bgIcon3, { opacity: bg3Opacity }]}>📜</Animated.Text>
            </LinearGradient>

            {/* Header */}
            <Animated.View style={[styles.header, {
                opacity: headerOpacity,
                transform: [{ translateY: headerY }]
            }]}>
                <Animated.View style={[styles.iconGlow, {
                    transform: [{ translateY: floatAnim }]
                }]}>
                    <Animated.Text style={[styles.logo, { transform: [{ rotate }] }]}>⚖️</Animated.Text>
                </Animated.View>
                <Text style={styles.appName}>NyayaSetu</Text>
                <Text style={styles.tagline}>Know It. Fight It. Win It.</Text>
            </Animated.View>

            {/* Card */}
            <Animated.View style={[styles.cardWrapper, {
                opacity: cardOpacity,
                transform: [{ translateY: cardY }]
            }]}>
                <ScrollView
                    style={styles.card}
                    contentContainerStyle={styles.cardContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {step === 1 ? (
                        <>
                            <Text style={styles.title}>Create Your Account</Text>
                            <Text style={styles.subtitle}>Enter your details to get started</Text>

                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />

                            <Text style={styles.label}>Mobile Number</Text>
                            <View style={styles.phoneRow}>
                                <View style={styles.countryCode}>
                                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                                </View>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="10 digit mobile number"
                                    placeholderTextColor="#9CA3AF"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.btn, (!name || phone.length !== 10) && styles.btnDisabled]}
                                onPress={handleSendOtp}
                                disabled={!name || phone.length !== 10 || loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#1E1B4B', '#3730A3']}
                                    style={styles.btnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.btnText}>
                                        {loading ? 'Sending OTP...' : 'Send OTP →'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.guestBtn}
                                onPress={() => router.replace('/language')}
                            >
                                <Text style={styles.guestText}>Continue as Guest</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                                <Text style={styles.backText}>← Back</Text>
                            </TouchableOpacity>

                            <Text style={styles.title}>Verify Your Number</Text>
                            <Text style={styles.subtitle}>
                                Enter the 6-digit OTP sent to{'\n'}+91 {phone}
                            </Text>

                            <Text style={styles.label}>Enter OTP</Text>
                            <TextInput
                                style={[styles.input, styles.otpInput]}
                                placeholder="• • • • • •"
                                placeholderTextColor="#9CA3AF"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                                textAlign="center"
                            />

                            <View style={styles.demoNote}>
                                <Text style={styles.demoNoteText}>
                                    🔔 Demo Mode — Enter any 6 digits to proceed
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.btn, otp.length !== 6 && styles.btnDisabled]}
                                onPress={handleVerifyOtp}
                                disabled={otp.length !== 6 || loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#1E1B4B', '#3730A3']}
                                    style={styles.btnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.btnText}>
                                        {loading ? 'Verifying...' : 'Verify & Continue ✓'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resendBtn}>
                                <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <Text style={styles.terms}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                </ScrollView>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgGradient: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: height * 0.5,
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        width: 300, height: 300,
        borderRadius: 150,
        borderWidth: 1,
        borderColor: 'rgba(165, 180, 252, 0.1)',
        top: -80, left: -80,
    },
    circle2: {
        position: 'absolute',
        width: 250, height: 250,
        borderRadius: 125,
        borderWidth: 1,
        borderColor: 'rgba(165, 180, 252, 0.07)',
        top: 20, right: -60,
    },
    bgIcon: {
        position: 'absolute',
        fontSize: 120,
    },
    bgIcon1: { top: -20, left: -30 },
    bgIcon2: { top: 30, right: -30 },
    bgIcon3: { top: height * 0.2, left: width * 0.3 },
    header: {
        alignItems: 'center',
        paddingTop: 70,
        paddingBottom: 30,
    },
    iconGlow: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(165, 180, 252, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(165, 180, 252, 0.2)',
    },
    logo: { fontSize: 48 },
    appName: {
        fontSize: 38,
        fontFamily: 'DMSerifDisplay_400Regular',
        color: '#FFFFFF',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    tagline: {
        fontSize: 13,
        color: '#A5B4FC',
        letterSpacing: 3,
        fontStyle: 'italic',
    },
    cardWrapper: {
        flex: 1,
        marginTop: 0,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    cardContent: { padding: 28, paddingBottom: 40 },
    backBtn: { marginBottom: 20 },
    backText: { color: '#3730A3', fontSize: 15, fontWeight: '600' },
    title: { fontSize: 26, fontWeight: '800', color: '#1E1B4B', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 22 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },
    otpInput: {
        fontSize: 28,
        letterSpacing: 12,
        fontWeight: '700',
        paddingVertical: 18,
    },
    phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    countryCode: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
    },
    countryCodeText: { fontSize: 15, color: '#1F2937', fontWeight: '500' },
    phoneInput: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    btn: { borderRadius: 14, overflow: 'hidden', elevation: 3, marginTop: 4 },
    btnDisabled: { opacity: 0.5 },
    btnGradient: { padding: 18, alignItems: 'center' },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    dividerText: { color: '#9CA3AF', fontSize: 14 },
    guestBtn: {
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#3730A3',
        padding: 16,
        alignItems: 'center',
    },
    guestText: { color: '#3730A3', fontSize: 16, fontWeight: '600' },
    demoNote: {
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: '#3730A3',
    },
    demoNoteText: { fontSize: 13, color: '#3730A3', fontWeight: '500' },
    resendBtn: { alignItems: 'center', marginTop: 18, padding: 8 },
    resendText: { color: '#3730A3', fontSize: 14, fontWeight: '600' },
    terms: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 28, lineHeight: 18 },
    termsLink: { color: '#3730A3', fontWeight: '600' },
});