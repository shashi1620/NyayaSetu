import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular });

    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.6)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineY = useRef(new Animated.Value(30)).current;
    const subTaglineOpacity = useRef(new Animated.Value(0)).current;
    const dividerWidth = useRef(new Animated.Value(0)).current;

    const bg1Opacity = useRef(new Animated.Value(0)).current;
    const bg2Opacity = useRef(new Animated.Value(0)).current;
    const bg3Opacity = useRef(new Animated.Value(0)).current;
    const bg4Opacity = useRef(new Animated.Value(0)).current;
    const bg5Opacity = useRef(new Animated.Value(0)).current;
    const bg6Opacity = useRef(new Animated.Value(0)).current;

    const rotateAnim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const circle1Scale = useRef(new Animated.Value(0.8)).current;
    const circle2Scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Background icons fade in staggered
        Animated.stagger(200, [
            Animated.timing(bg1Opacity, { toValue: 0.12, duration: 1000, useNativeDriver: true }),
            Animated.timing(bg2Opacity, { toValue: 0.10, duration: 1000, useNativeDriver: true }),
            Animated.timing(bg3Opacity, { toValue: 0.11, duration: 1000, useNativeDriver: true }),
            Animated.timing(bg4Opacity, { toValue: 0.09, duration: 1000, useNativeDriver: true }),
            Animated.timing(bg5Opacity, { toValue: 0.10, duration: 1000, useNativeDriver: true }),
            Animated.timing(bg6Opacity, { toValue: 0.08, duration: 1000, useNativeDriver: true }),
        ]).start();

        // Logo animation
        Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 35,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(300),
            Animated.parallel([
                Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(taglineY, { toValue: 0, duration: 600, useNativeDriver: true }),
                Animated.timing(dividerWidth, { toValue: 60, duration: 800, useNativeDriver: false }),
            ]),
            Animated.delay(200),
            Animated.timing(subTaglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        // Continuous rotate animation for scale icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, { toValue: 1, duration: 3500, useNativeDriver: true }),
                Animated.timing(rotateAnim, { toValue: 0, duration: 3500, useNativeDriver: true }),
            ])
        ).start();

        // Float animation for logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -12, duration: 2000, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();

        // Pulse animation for glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            ])
        ).start();

        // Circles expand
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

    useEffect(() => {
        if (fontsLoaded) {
            setTimeout(async () => {
                const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
                const hasLanguage = await AsyncStorage.getItem('selectedLanguage');
                if (isLoggedIn === 'true' && hasLanguage) {
                    router.replace('/(tabs)');
                } else if (isLoggedIn === 'true') {
                    router.replace('/language');
                } else {
                    router.replace('/login');
                }
            }, 5000);
        }
    }, [fontsLoaded]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-5deg', '5deg'],
    });

    return (
        <LinearGradient
            colors={['#080620', '#0D0B2B', '#1E1B4B', '#2D2D7B']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Decorative circles */}
            <Animated.View style={[styles.circle1, { transform: [{ scale: circle1Scale }] }]} />
            <Animated.View style={[styles.circle2, { transform: [{ scale: circle2Scale }] }]} />
            <View style={styles.circle3} />
            <View style={styles.circle4} />

            {/* Background law icons */}
            <Animated.Text style={[styles.bgIcon, styles.bgIcon1, { opacity: bg1Opacity }]}>⚖️</Animated.Text>
            <Animated.Text style={[styles.bgIcon, styles.bgIcon2, { opacity: bg2Opacity }]}>🔨</Animated.Text>
            <Animated.Text style={[styles.bgIcon, styles.bgIcon3, { opacity: bg3Opacity }]}>📚</Animated.Text>
            <Animated.Text style={[styles.bgIcon, styles.bgIcon4, { opacity: bg4Opacity }]}>📜</Animated.Text>
            <Animated.Text style={[styles.bgIcon, styles.bgIcon5, { opacity: bg5Opacity }]}>🏛️</Animated.Text>
            <Animated.Text style={[styles.bgIcon, styles.bgIcon6, { opacity: bg6Opacity }]}>🛡️</Animated.Text>

            {/* Main logo */}
            <Animated.View style={[styles.logoContainer, {
                opacity: logoOpacity,
                transform: [
                    { scale: logoScale },
                    { translateY: floatAnim }
                ]
            }]}>
                <Animated.View style={[styles.iconGlow, { transform: [{ scale: pulseAnim }] }]}>
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <Text style={styles.mainIcon}>⚖️</Text>
                    </Animated.View>
                </Animated.View>
                <Text style={styles.appName}>NyayaSetu</Text>
            </Animated.View>

            {/* Tagline */}
            <Animated.View style={[styles.taglineContainer, {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineY }]
            }]}>
                <Text style={styles.tagline}>Know It. Fight It. Win It.</Text>
                <Animated.View style={[styles.divider, { width: dividerWidth }]} />
                <Animated.Text style={[styles.subTagline, { opacity: subTaglineOpacity }]}>
                    Your Digital Lawyer
                </Animated.Text>
            </Animated.View>

            {/* Bottom dots loader */}
            <Animated.View style={[styles.loaderContainer, { opacity: subTaglineOpacity }]}>
                <View style={styles.loaderDot} />
                <View style={[styles.loaderDot, styles.loaderDotMid]} />
                <View style={styles.loaderDot} />
            </Animated.View>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    // Circles
    circle1: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
        borderWidth: 1,
        borderColor: 'rgba(165, 180, 252, 0.1)',
        top: -100,
        left: -100,
    },
    circle2: {
        position: 'absolute',
        width: 450,
        height: 450,
        borderRadius: 225,
        borderWidth: 1,
        borderColor: 'rgba(165, 180, 252, 0.07)',
        bottom: -150,
        right: -150,
    },
    circle3: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 1,
        borderColor: 'rgba(165, 180, 252, 0.06)',
        top: height * 0.25,
        left: width * 0.5 - 125,
    },
    circle4: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 1,
        borderColor: 'rgba(165, 180, 252, 0.05)',
        top: height * 0.55,
        left: width * 0.5 - 90,
    },

    // Background icons
    bgIcon: {
        position: 'absolute',
        fontSize: 130,
    },
    bgIcon1: { top: -30, left: -40 },
    bgIcon2: { top: 50, right: -30 },
    bgIcon3: { bottom: 100, left: -30 },
    bgIcon4: { bottom: 140, right: -20 },
    bgIcon5: { top: height * 0.38, left: -50 },
    bgIcon6: { top: height * 0.42, right: -40 },

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconGlow: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(165, 180, 252, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(165, 180, 252, 0.15)',
    },
    mainIcon: {
        fontSize: 72,
    },
    appName: {
        fontSize: 50,
        fontFamily: 'DMSerifDisplay_400Regular',
        color: '#FFFFFF',
        letterSpacing: 2,
    },

    // Tagline
    taglineContainer: {
        alignItems: 'center',
    },
    tagline: {
        fontSize: 18,
        color: '#A5B4FC',
        letterSpacing: 4,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 14,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(165, 180, 252, 0.5)',
        marginBottom: 14,
    },
    subTagline: {
        fontSize: 13,
        color: 'rgba(165, 180, 252, 0.7)',
        letterSpacing: 3,
        textAlign: 'center',
    },

    // Loader
    loaderContainer: {
        position: 'absolute',
        bottom: 60,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    loaderDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(165, 180, 252, 0.4)',
    },
    loaderDotMid: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(165, 180, 252, 0.7)',
    },
});