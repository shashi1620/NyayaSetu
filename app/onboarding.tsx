import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../constants/translations';

const { width, height } = Dimensions.get('window');

const allSlides = {
    en: [
        {
            icon: '⚖️',
            title: 'Welcome to\nNyayaSetu',
            desc: 'India\'s first legal aid platform. Know your rights, raise your voice — completely free.',
            color1: '#1E1B4B', color2: '#3730A3',
        },
        {
            icon: '🤖',
            title: 'AI Lawyer\n24/7 Available',
            desc: 'Ask any legal question — Police, Tenant, Workplace rights. NyayaSetu answers in English.',
            color1: '#0C4A6E', color2: '#0891B2',
        },
        {
            icon: '📞',
            title: 'Emergency Help\nOne Tap Away',
            desc: 'NALSA, Police, Women Helpline — call emergency numbers directly. Anytime, anywhere.',
            color1: '#064E3B', color2: '#059669',
        },
        {
            icon: '🆓',
            title: 'Completely Free\nAlways',
            desc: 'No registration, no payment. For every Indian citizen — start right away.',
            color1: '#4C1D95', color2: '#7C3AED',
        },
    ],
    hi: [
        {
            icon: '⚖️',
            title: 'न्यायसेतु में\nआपका स्वागत है',
            desc: 'भारत का पहला कानूनी सहायता मंच। अपने अधिकार जानें, अपनी आवाज उठाएं — बिल्कुल मुफ्त।',
            color1: '#1E1B4B', color2: '#3730A3',
        },
        {
            icon: '🤖',
            title: 'AI वकील\n24/7 उपलब्ध',
            desc: 'कोई भी कानूनी सवाल पूछें — पुलिस, किरायेदार, कार्यस्थल अधिकार। न्यायसेतु हिंदी में जवाब देगा।',
            color1: '#0C4A6E', color2: '#0891B2',
        },
        {
            icon: '📞',
            title: 'आपातकालीन मदद\nएक टैप में',
            desc: 'NALSA, पुलिस, महिला हेल्पलाइन — सीधे कॉल करें। कभी भी, कहीं भी।',
            color1: '#064E3B', color2: '#059669',
        },
        {
            icon: '🆓',
            title: 'बिल्कुल मुफ्त\nहमेशा',
            desc: 'कोई पंजीकरण नहीं, कोई भुगतान नहीं। हर भारतीय नागरिक के लिए — अभी शुरू करें।',
            color1: '#4C1D95', color2: '#7C3AED',
        },
    ],
    ta: [
        {
            icon: '⚖️',
            title: 'நியாயசேதுவிற்கு\nவரவேற்கிறோம்',
            desc: 'இந்தியாவின் முதல் சட்ட உதவி தளம். உங்கள் உரிமைகளை அறிந்துகொள்ளுங்கள் — இலவசமாக.',
            color1: '#1E1B4B', color2: '#3730A3',
        },
        {
            icon: '🤖',
            title: 'AI வழக்கறிஞர்\n24/7 கிடைக்கும்',
            desc: 'எந்த சட்ட கேள்வியையும் கேளுங்கள். நியாயசேது தமிழில் பதில் அளிக்கும்.',
            color1: '#0C4A6E', color2: '#0891B2',
        },
        {
            icon: '📞',
            title: 'அவசர உதவி\nஒரே தட்டில்',
            desc: 'NALSA, போலீஸ், பெண்கள் உதவி எண் — நேரடியாக அழையுங்கள். எப்போதும், எங்கும்.',
            color1: '#064E3B', color2: '#059669',
        },
        {
            icon: '🆓',
            title: 'முற்றிலும் இலவசம்\nஎப்போதும்',
            desc: 'பதிவு இல்லை, கட்டணம் இல்லை. ஒவ்வொரு இந்திய குடிமகனுக்கும் — இப்போதே தொடங்குங்கள்.',
            color1: '#4C1D95', color2: '#7C3AED',
        },
    ],
    te: [
        {
            icon: '⚖️',
            title: 'న్యాయసేతుకు\nస్వాగతం',
            desc: 'భారతదేశపు మొదటి న్యాయ సహాయ వేదిక. మీ హక్కులు తెలుసుకోండి — పూర్తిగా ఉచితం.',
            color1: '#1E1B4B', color2: '#3730A3',
        },
        {
            icon: '🤖',
            title: 'AI న్యాయవాది\n24/7 అందుబాటులో',
            desc: 'ఏ న్యాయపరమైన ప్రశ్నైనా అడగండి. న్యాయసేతు తెలుగులో సమాధానం ఇస్తుంది.',
            color1: '#0C4A6E', color2: '#0891B2',
        },
        {
            icon: '📞',
            title: 'అత్యవసర సహాయం\nఒక్క నొక్కులో',
            desc: 'NALSA, పోలీసు, మహిళా హెల్ప్‌లైన్ — నేరుగా కాల్ చేయండి. ఎప్పుడైనా, ఎక్కడైనా.',
            color1: '#064E3B', color2: '#059669',
        },
        {
            icon: '🆓',
            title: 'పూర్తిగా ఉచితం\nఎల్లప్పుడూ',
            desc: 'నమోదు లేదు, చెల్లింపు లేదు. ప్రతి భారతీయ పౌరుడికి — ఇప్పుడే ప్రారంభించండి.',
            color1: '#4C1D95', color2: '#7C3AED',
        },
    ],
    kn: [
        {
            icon: '⚖️',
            title: 'ನ್ಯಾಯಸೇತುಗೆ\nಸ್ವಾಗತ',
            desc: 'ಭಾರತದ ಮೊದಲ ಕಾನೂನು ನೆರವಿನ ವೇದಿಕೆ. ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ — ಸಂಪೂರ್ಣ ಉಚಿತ.',
            color1: '#1E1B4B', color2: '#3730A3',
        },
        {
            icon: '🤖',
            title: 'AI ವಕೀಲರು\n24/7 ಲಭ್ಯ',
            desc: 'ಯಾವುದೇ ಕಾನೂನು ಪ್ರಶ್ನೆ ಕೇಳಿ. ನ್ಯಾಯಸೇತು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸುತ್ತದೆ.',
            color1: '#0C4A6E', color2: '#0891B2',
        },
        {
            icon: '📞',
            title: 'ತುರ್ತು ಸಹಾಯ\nಒಂದು ಟ್ಯಾಪ್‌ನಲ್ಲಿ',
            desc: 'NALSA, ಪೊಲೀಸ್, ಮಹಿಳಾ ಸಹಾಯವಾಣಿ — ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ. ಯಾವಾಗಲೂ, ಎಲ್ಲಿಯಾದರೂ.',
            color1: '#064E3B', color2: '#059669',
        },
        {
            icon: '🆓',
            title: 'ಸಂಪೂರ್ಣ ಉಚಿತ\nಯಾವಾಗಲೂ',
            desc: 'ನೋಂದಣಿ ಇಲ್ಲ, ಪಾವತಿ ಇಲ್ಲ. ಪ್ರತಿ ಭಾರತೀಯ ನಾಗರಿಕರಿಗೆ — ಈಗಲೇ ಪ್ರಾರಂಭಿಸಿ.',
            color1: '#4C1D95', color2: '#7C3AED',
        },
    ],
};

const buttonText = {
    en: { next: 'Next →', start: '🚀 Get Started', skip: 'Skip' },
    hi: { next: 'आगे →', start: '🚀 शुरू करें', skip: 'छोड़ें' },
    ta: { next: 'அடுத்து →', start: '🚀 தொடங்குங்கள்', skip: 'தவிர்' },
    te: { next: 'తర్వాత →', start: '🚀 ప్రారంభించండి', skip: 'దాటు' },
    kn: { next: 'ಮುಂದೆ →', start: '🚀 ಪ್ರಾರಂಭಿಸಿ', skip: 'ಬಿಡಿ' },
};

export default function OnboardingScreen() {
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [lang, setLang] = useState<Language>('en');
    const flatListRef = useRef(null);

    useEffect(() => {
        AsyncStorage.getItem('selectedLanguage').then(val => {
            if (val) setLang(val as Language);
        });
    }, []);

    const slides = allSlides[lang] || allSlides.en;
    const btn = buttonText[lang] || buttonText.en;

    const goToApp = () => {
        router.replace('/(tabs)');
    };

    const handleNext = () => {
        if (current < slides.length - 1) {
            const nextIndex = current + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrent(nextIndex);
        } else {
            goToApp();
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrent(viewableItems[0].index);
        }
    }).current;

    const isLast = current === slides.length - 1;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                renderItem={({ item }) => (
                    <LinearGradient
                        colors={[item.color1, item.color2]}
                        style={styles.slide}
                    >
                        <TouchableOpacity style={styles.skipBtn} onPress={goToApp}>
                            <Text style={styles.skipText}>{btn.skip}</Text>
                        </TouchableOpacity>
                        <View style={styles.content}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>{item.icon}</Text>
                            </View>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.desc}>{item.desc}</Text>
                        </View>
                    </LinearGradient>
                )}
            />

            <View style={styles.bottom}>
                <View style={styles.dots}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === current ? styles.dotActive : styles.dotInactive
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#1E1B4B', '#3730A3']}
                        style={styles.nextGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.nextText}>
                            {isLast ? btn.start : btn.next}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E1B4B' },
    slide: {
        width,
        height: height * 0.75,
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    skipBtn: { alignSelf: 'flex-end', padding: 8 },
    skipText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    icon: { fontSize: 70 },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 20,
    },
    desc: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 8,
    },
    bottom: {
        backgroundColor: '#1E1B4B',
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        alignItems: 'center',
        gap: 16,
        height: height * 0.25,
        justifyContent: 'center',
    },
    dots: { flexDirection: 'row', gap: 8 },
    dot: { height: 8, borderRadius: 4 },
    dotActive: { width: 28, backgroundColor: '#FFFFFF' },
    dotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.35)' },
    nextBtn: { width: '100%', borderRadius: 30, overflow: 'hidden', elevation: 5 },
    nextGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 30 },
    nextText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
    skipBottom: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
});