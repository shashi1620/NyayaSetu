import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar as RNStatusBar, Linking, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 MINIMAL & FULLY LOCALIZED DICTIONARY (Only Consumer Helpline, ProBono, Clinics, Rights)
const aidUi: Record<string, any> = {
    en: {
        title: "Legal Aid & Support",
        subtitle: "Access free legal services and know your rights.",

        nchTitle: "Consumer Helpline",
        nchSub: "Resolve disputes with brands, shops, or e-commerce quickly.",
        nchBtn: "File Complaint",

        proBonoTitle: "Pro-Bono Lawyers",
        proBonoSub: "Find voluntary lawyers.",
        clinicsTitle: "Legal Clinics",
        clinicsSub: "Locate help near you.",

        rightsTitle: "Know Your Rights",

        proBonoAlertTitle: "⏳ Lawyers Directory",
        proBonoAlertMsg: "We are currently verifying and onboarding pro-bono lawyers for your region. This will be live soon!",
        clinicAlertTitle: "⏳ Legal Clinics",
        clinicAlertMsg: "We are mapping nearby free legal clinics and centers. Stay tuned!",

        rights: [
            { icon: '🚔', title: "In Case of Police Arrest", desc: "You have the right to know the grounds of arrest and inform a relative." },
            { icon: '🏠', title: "Tenant Eviction", desc: "A landlord cannot evict you without a proper legal notice." },
            { icon: '💼', title: "Workplace Harassment", desc: "Every company must have an Internal Complaints Committee (ICC)." }
        ]
    },
    hi: {
        title: "कानूनी सहायता",
        subtitle: "मुफ्त कानूनी सेवाएं और संसाधन प्राप्त करें।",

        nchTitle: "उपभोक्ता हेल्पलाइन",
        nchSub: "दुकान या ई-कॉमर्स धोखाधड़ी की शिकायत सीधे सरकार से करें।",
        nchBtn: "शिकायत दर्ज करें",

        proBonoTitle: "प्रो-बोनो वकील",
        proBonoSub: "स्वयंसेवी वकील खोजें।",
        clinicsTitle: "कानूनी क्लीनिक",
        clinicsSub: "अपने आस-पास मदद खोजें।",

        rightsTitle: "अपने अधिकार जानें",

        proBonoAlertTitle: "⏳ वकील डायरेक्टरी",
        proBonoAlertMsg: "हम वर्तमान में आपके क्षेत्र के लिए प्रो-बोनो वकीलों को सत्यापित और जोड़ रहे हैं। यह जल्द ही लाइव होगा!",
        clinicAlertTitle: "⏳ कानूनी क्लीनिक",
        clinicAlertMsg: "हम आस-पास के मुफ्त कानूनी क्लीनिकों को मैप कर रहे हैं। जुड़े रहें!",

        rights: [
            { icon: '🚔', title: "पुलिस गिरफ्तारी के समय", desc: "आपको गिरफ्तारी का कारण जानने और रिश्तेदार को सूचित करने का अधिकार है।" },
            { icon: '🏠', title: "किरायेदार बेदखली", desc: "उचित कानूनी नोटिस के बिना मकान मालिक आपको बेदखल नहीं कर सकता।" },
            { icon: '💼', title: "कार्यस्थल पर उत्पीड़न", desc: "हर कंपनी में एक आंतरिक शिकायत समिति (ICC) होनी चाहिए।" }
        ]
    },
    ta: {
        title: "சட்ட உதவி",
        subtitle: "இலவச சட்ட சேவைகள் மற்றும் வளங்களை அணுகவும்.",

        nchTitle: "நுகர்வோர் உதவி மையம்",
        nchSub: "கடை அல்லது இ-காமர்ஸ் மோசடிகளைப் புகாரளிக்கவும்.",
        nchBtn: "புகார் அளி",

        proBonoTitle: "இலவச வழக்கறிஞர்கள்",
        proBonoSub: "தன்னார்வ வழக்கறிஞர்களைத் தேடுங்கள்.",
        clinicsTitle: "சட்ட மையங்கள்",
        clinicsSub: "அருகில் உள்ள உதவியை தேடுங்கள்.",

        rightsTitle: "உங்கள் உரிமைகளை அறியுங்கள்",

        proBonoAlertTitle: "⏳ வழக்கறிஞர்கள் பட்டியல்",
        proBonoAlertMsg: "உங்கள் பகுதிக்கான இலவச வழக்கறிஞர்களை நாங்கள் சரிபார்த்து இணைத்து வருகிறோம்.",
        clinicAlertTitle: "⏳ சட்ட மையங்கள்",
        clinicAlertMsg: "அருகிலுள்ள இலவச சட்ட மையங்களை நாங்கள் வரைபடமாக்குகிறோம். விரைவில் பயன்பாட்டுக்கு வரும்!",

        rights: [
            { icon: '🚔', title: "காவல்துறை கைது", desc: "கைதுக்கான காரணத்தை அறிய உங்களுக்கு உரிமை உள்ளது." },
            { icon: '🏠', title: "குத்தகைதாரர் வெளியேற்றம்", desc: "சரியான நோட்டீஸ் இல்லாமல் உரிமையாளர் உங்களை வெளியேற்ற முடியாது." },
            { icon: '💼', title: "பணியிட துன்புறுத்தல்", desc: "ஒவ்வொரு நிறுவனத்திலும் புகார் குழு இருக்க வேண்டும்." }
        ]
    },
    te: {
        title: "న్యాయ సహాయం",
        subtitle: "ఉచిత న్యాయ సేవలు మరియు వనరులను యాక్సెస్ చేయండి.",

        nchTitle: "వినియోగదారుల హెల్ప్‌లైన్",
        nchSub: "దుకాణం లేదా ఈ-కామర్స్ మోసాలను నివేదించండి.",
        nchBtn: "ఫిర్యాదు చేయండి",

        proBonoTitle: "ప్రో-బోనో లాయర్లు",
        proBonoSub: "స్వచ్ఛంద న్యాయవాదులను కనుగొనండి.",
        clinicsTitle: "న్యాయ క్లినిక్‌లు",
        clinicsSub: "మీకు సమీపంలో ఉన్న సహాయాన్ని కనుగొనండి.",

        rightsTitle: "మీ హక్కులను తెలుసుకోండి",

        proBonoAlertTitle: "⏳ లాయర్ల డైరెక్టరీ",
        proBonoAlertMsg: "మేము ప్రస్తుతం మీ ప్రాంతం కోసం ఉచిత న్యాయవాదులను ధృవీకరిస్తున్నాము మరియు జోడిస్తున్నాము.",
        clinicAlertTitle: "⏳ న్యాయ క్లినిక్‌లు",
        clinicAlertMsg: "మేము సమీపంలోని ఉచిత న్యాయ క్లినిక్‌లను మ్యాప్ చేస్తున్నాము. ఈ ఫీచర్ త్వరలో అందుబాటులోకి వస్తుంది!",

        rights: [
            { icon: '🚔', title: "పోలీసు అరెస్ట్ సమయంలో", desc: "అరెస్ట్ కారణాలను తెలుసుకునే హక్కు మీకు ఉంది." },
            { icon: '🏠', title: "అద్దెదారు తొలగింపు", desc: "సరైన నోటీసు లేకుండా భూస్వామి మిమ్మల్ని తొలగించలేరు." },
            { icon: '💼', title: "కార్యాలయంలో వేధింపులు", desc: "ప్రతి కంపెనీలో అంతర్గత ఫిర్యాదుల కమిటీ ఉండాలి." }
        ]
    },
    kn: {
        title: "ಕಾನೂನು ನೆರವು",
        subtitle: "ಉಚಿತ ಕಾನೂನು ಸೇವೆಗಳು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳನ್ನು ಪ್ರವೇಶಿಸಿ.",

        nchTitle: "ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ",
        nchSub: "ಅಂಗಡಿ ಅಥವಾ ಇ-ಕಾಮರ್ಸ್ ವಂಚನೆಗಳನ್ನು ವರದಿ ಮಾಡಿ.",
        nchBtn: "ದೂರು ನೀಡಿ",

        proBonoTitle: "ಪ್ರೊ-ಬೊನೊ ವಕೀಲರು",
        proBonoSub: "ಸ್ವಯಂಸೇವಕ ವಕೀಲರನ್ನು ಹುಡುಕಿ.",
        clinicsTitle: "ಕಾನೂನು ಚಿಕಿತ್ಸಾಲಯಗಳು",
        clinicsSub: "ನಿಮ್ಮ ಬಳಿ ಸಹಾಯವನ್ನು ಹುಡುಕಿ.",

        rightsTitle: "ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ",

        proBonoAlertTitle: "⏳ ವಕೀಲರ ಡೈರೆಕ್ಟರಿ",
        proBonoAlertMsg: "ನಾವು ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಪ್ರದೇಶಕ್ಕಾಗಿ ಉಚಿತ ವಕೀಲರನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇವೆ ಮತ್ತು ಸೇರಿಸುತ್ತಿದ್ದೇವೆ.",
        clinicAlertTitle: "⏳ ಕಾನೂನು ಚಿಕಿತ್ಸಾಲಯಗಳು",
        clinicAlertMsg: "ನಾವು ಹತ್ತಿರದ ಉಚಿತ ಕಾನೂನು ಚಿಕಿತ್ಸಾಲಯಗಳನ್ನು ಮ್ಯಾಪ್ ಮಾಡುತ್ತಿದ್ದೇವೆ. ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ!",

        rights: [
            { icon: '🚔', title: "ಪೊಲೀಸ್ ಬಂಧನದ ಸಂದರ್ಭದಲ್ಲಿ", desc: "ಬಂಧನಕ್ಕೆ ಕಾರಣವನ್ನು ತಿಳಿಯುವ ಹಕ್ಕು ನಿಮಗಿದೆ." },
            { icon: '🏠', title: "ಬಾಡಿಗೆದಾರರ ಹೊರಹಾಕುವಿಕೆ", desc: "ಸರಿಯಾದ ಸೂಚನೆ ಇಲ್ಲದೆ ಮಾಲೀಕರು ನಿಮ್ಮನ್ನು ಹೊರಹಾಕುವಂತಿಲ್ಲ." },
            { icon: '💼', title: "ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ಕಿರುಕುಳ", desc: "ಪ್ರತಿ ಕಂಪನಿಯು ಆಂತರಿಕ ದೂರು ಸಮಿತಿಯನ್ನು ಹೊಂದಿರಬೇಕು." }
        ]
    }
};

export default function LegalAidScreen() {
    const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular });
    const [lang, setLang] = useState<'en' | 'hi' | 'ta' | 'te' | 'kn'>('en');

    useEffect(() => {
        AsyncStorage.getItem('selectedLanguage').then(val => {
            if (val && ['en', 'hi', 'ta', 'te', 'kn'].includes(val)) {
                setLang(val as any);
            }
        });
    }, []);

    const ui = aidUi[lang] || aidUi.en;

    // Opens India's official National Consumer Helpline portal
    const openConsumerHelpline = () => {
        Linking.openURL('https://consumerhelpline.gov.in/');
    };

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <RNStatusBar barStyle="light-content" backgroundColor="#09090B" translucent={false} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>{ui.title}</Text>
                <Text style={styles.headerSub}>{ui.subtitle}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>

                {/* 1. PRIMARY CTA: Consumer Helpline (Highly Effective) */}
                <View style={styles.section}>
                    <View style={styles.heroCard}>
                        <View style={styles.heroHeader}>
                            <View style={styles.heroIconBox}><Text style={styles.heroIcon}>🛍️</Text></View>
                            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>CONSUMER FORUM</Text></View>
                        </View>
                        <Text style={styles.heroTitle}>{ui.nchTitle}</Text>
                        <Text style={styles.heroDesc}>{ui.nchSub}</Text>

                        <TouchableOpacity style={styles.primaryBtn} onPress={openConsumerHelpline}>
                            <Text style={styles.primaryBtnText}>{ui.nchBtn} →</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. SECONDARY TOOLS: Grid (Lawyers & Clinics with Coming Soon) */}
                <View style={styles.section}>
                    <View style={styles.grid}>

                        <TouchableOpacity
                            style={styles.gridCard}
                            onPress={() => Alert.alert(ui.proBonoAlertTitle, ui.proBonoAlertMsg)}
                        >
                            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                <Text style={styles.gridIcon}>🤝</Text>
                            </View>
                            <Text style={styles.gridTitle}>{ui.proBonoTitle}</Text>
                            <Text style={styles.gridSub}>{ui.proBonoSub}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.gridCard}
                            onPress={() => Alert.alert(ui.clinicAlertTitle, ui.clinicAlertMsg)}
                        >
                            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                <Text style={styles.gridIcon}>🏥</Text>
                            </View>
                            <Text style={styles.gridTitle}>{ui.clinicsTitle}</Text>
                            <Text style={styles.gridSub}>{ui.clinicsSub}</Text>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* 3. RIGHTS LIBRARY (Know your rights) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{ui.rightsTitle}</Text>

                    <View style={styles.rightsContainer}>
                        {ui.rights.map((right: any, index: number) => (
                            <View key={index} style={styles.rightCard}>
                                <View style={styles.rightIconBox}><Text style={styles.rightIcon}>{right.icon}</Text></View>
                                <View style={styles.rightContent}>
                                    <Text style={styles.rightCardTitle}>{right.title}</Text>
                                    <Text style={styles.rightCardDesc}>{right.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#09090B' },
    scrollPadding: { paddingBottom: 80 },

    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 25 },
    headerTitle: { color: '#F8FAFC', fontSize: 32, fontFamily: 'DMSerifDisplay_400Regular', marginBottom: 6 },
    headerSub: { color: '#A1A1AA', fontSize: 14, fontWeight: '500' },

    section: { paddingHorizontal: 20, marginBottom: 25 },
    sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 16 },

    // HERO CARD (CONSUMER HELPLINE)
    heroCard: { backgroundColor: '#1E1B4B', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#312E81' },
    heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    heroIconBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12 },
    heroIcon: { fontSize: 24 },
    heroBadge: { backgroundColor: 'rgba(56, 189, 248, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.4)' },
    heroBadgeText: { color: '#38bdf8', fontSize: 10, fontWeight: '800' },
    heroTitle: { color: '#818CF8', fontSize: 20, fontWeight: '800', marginBottom: 6 },
    heroDesc: { color: '#D1D5DB', fontSize: 14, lineHeight: 22, marginBottom: 20 },
    primaryBtn: { backgroundColor: '#818CF8', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    primaryBtnText: { color: '#09090B', fontSize: 15, fontWeight: '800' },

    // GRID
    grid: { flexDirection: 'row', justifyContent: 'space-between' },
    gridCard: { width: '48%', backgroundColor: '#18181B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#27272A' },
    gridIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    gridIcon: { fontSize: 20 },
    gridTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    gridSub: { color: '#A1A1AA', fontSize: 12, lineHeight: 18 },

    // RIGHTS LIST
    rightsContainer: { gap: 12 },
    rightCard: { flexDirection: 'row', backgroundColor: '#18181B', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#27272A', alignItems: 'center' },
    rightIconBox: { backgroundColor: '#27272A', width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    rightIcon: { fontSize: 22 },
    rightContent: { flex: 1 },
    rightCardTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    rightCardDesc: { color: '#A1A1AA', fontSize: 13, lineHeight: 20 }
});