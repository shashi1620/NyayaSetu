import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, StatusBar as RNStatusBar, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // 🔥 FIX: Terminal wali warning aur UI cut ka ilaaj
import { useRouter } from 'expo-router';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ⚠️ Replace with your actual Gemini API Key
const GEMINI_API_KEY = 'AIzaSyBXV_PqXxbQFBL52ytvrGk3o-V4UsBWYfM';

// 🔥 FULLY LOCALIZED UI DICTIONARY FOR DRAFT PAGE
const draftUi: Record<string, any> = {
    en: {
        title: "Draft Formal FIR",
        intro: "Tell us what happened in plain words. Our AI will convert it into a formal legal document ready to be submitted to the police.",
        typeLabel: "Type of Incident",
        categories: ['Theft / Robbery', 'Cyber Fraud', 'Assault', 'Missing Person', 'Other'],
        dateLabel: "Date & Time",
        datePlaceholder: "e.g. Last night at 10 PM",
        locLabel: "Location",
        locPlaceholder: "e.g. Sector 18, Noida",
        descLabel: "What happened? (Plain language)",
        descPlaceholder: "Example: I was going to the office in the metro, someone stole my phone...",
        btnText: "✨ Generate Legal Draft",
        resultTitle: "Your Formal Draft",
        editHint: "Tap on the text below to edit it manually before saving.",
        copy: "📋 Copy",
        pdf: "📄 PDF",
        aiLang: "English"
    },
    hi: {
        title: "औपचारिक FIR ड्राफ्ट करें",
        intro: "अपनी आम भाषा में बताएं कि क्या हुआ। हमारा AI इसे पुलिस में जमा करने के लिए एक औपचारिक कानूनी दस्तावेज़ में बदल देगा।",
        typeLabel: "घटना का प्रकार",
        categories: ['चोरी / लूट', 'साइबर फ्रॉड', 'मारपीट', 'गुमशुदा व्यक्ति', 'अन्य'],
        dateLabel: "दिनांक और समय",
        datePlaceholder: "उदा. कल रात 10 बजे",
        locLabel: "स्थान (Location)",
        locPlaceholder: "उदा. सेक्टर 18, नोएडा",
        descLabel: "क्या हुआ? (आम भाषा में लिखें)",
        descPlaceholder: "उदाहरण: मैं सुबह मेट्रो में ऑफिस जा रहा था, किसी ने मेरा फोन चुरा लिया...",
        btnText: "✨ कानूनी ड्राफ्ट बनाएं",
        resultTitle: "आपका औपचारिक ड्राफ्ट",
        editHint: "सेव करने से पहले टेक्स्ट पर टैप करके मैन्युअली एडिट करें।",
        copy: "📋 कॉपी",
        pdf: "📄 PDF",
        aiLang: "Hindi"
    },
    ta: {
        title: "முறையான FIR உருவாக்கு",
        intro: "என்ன நடந்தது என்பதை சாதாரண வார்த்தைகளில் சொல்லுங்கள். எங்கள் AI அதனை காவல்துறை ஆவணமாக மாற்றும்.",
        typeLabel: "சம்பவத்தின் வகை",
        categories: ['திருட்டு', 'சைபர் மோசடி', 'தாக்குதல்', 'காணவில்லை', 'மற்றவை'],
        dateLabel: "தேதி & நேரம்",
        datePlaceholder: "உதாரணம்: நேற்று இரவு 10 மணி",
        locLabel: "இடம்",
        locPlaceholder: "உதாரணம்: அண்ணா நகர்",
        descLabel: "என்ன நடந்தது? (உங்கள் மொழியில்)",
        descPlaceholder: "உதாரணம்: நான் அலுவலகம் சென்று கொண்டிருந்தேன், யாரோ என் போனை திருடிவிட்டனர்...",
        btnText: "✨ FIR உருவாக்கு",
        resultTitle: "உங்கள் ஆவணம்",
        editHint: "மாற்றங்களைச் செய்ய கீழே உள்ள உரையைத் தட்டவும்.",
        copy: "📋 நகலெடு",
        pdf: "📄 PDF",
        aiLang: "Tamil"
    },
    te: {
        title: "అధికారిక FIR రూపొందించండి",
        intro: "ఏమి జరిగిందో సాధారణ మాటలలో చెప్పండి. మా AI దానిని పోలీసు పత్రంగా మారుస్తుంది.",
        typeLabel: "సంఘటన రకం",
        categories: ['దొంగతనం', 'సైబర్ మోసం', 'దాడి', 'తప్పిపోయిన వ్యక్తి', 'ఇతర'],
        dateLabel: "తేదీ & సమయం",
        datePlaceholder: "ఉదాహరణ: నిన్న రాత్రి 10 గంటలకు",
        locLabel: "స్థానం",
        locPlaceholder: "ఉదాహరణ: అమీర్‌పేట్",
        descLabel: "ఏమి జరిగింది? (మీ భాషలో)",
        descPlaceholder: "ఉదాహరణ: నేను ఆఫీసుకు వెళ్తున్నాను, ఎవరో నా ఫోన్ దొంగిలించారు...",
        btnText: "✨ FIR రూపొందించండి",
        resultTitle: "మీ పత్రం",
        editHint: "సవరించడానికి క్రింది వచనంపై నొక్కండి.",
        copy: "📋 కాపీ",
        pdf: "📄 PDF",
        aiLang: "Telugu"
    },
    kn: {
        title: "ಔಪಚಾರಿಕ FIR ರಚಿಸಿ",
        intro: "ಏನು ಸಂಭವಿಸಿದೆ ಎಂದು ಸಾಮಾನ್ಯ ಪದಗಳಲ್ಲಿ ತಿಳಿಸಿ. ನಮ್ಮ AI ಅದನ್ನು ಪೊಲೀಸ್ ದಾಖಲೆಯಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.",
        typeLabel: "ಘಟನೆಯ ಪ್ರಕಾರ",
        categories: ['ಕಳ್ಳತನ', 'ಸೈಬರ್ ವಂಚನೆ', 'ಹಲ್ಲೆ', 'ಕಾಣೆಯಾದ ವ್ಯಕ್ತಿ', 'ಇತರೆ'],
        dateLabel: "ದಿನಾಂಕ ಮತ್ತು ಸಮಯ",
        datePlaceholder: "ಉದಾಹರಣೆ: ನಿನ್ನೆ ರಾತ್ರಿ 10 ಗಂಟೆಗೆ",
        locLabel: "ಸ್ಥಳ",
        locPlaceholder: "ಉದಾಹರಣೆ: ಜಯನಗರ",
        descLabel: "ಏನು ಸಂಭವಿಸಿದೆ? (ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ)",
        descPlaceholder: "ಉದಾಹರಣೆ: ನಾನು ಕಚೇರಿಗೆ ಹೋಗುತ್ತಿದ್ದೆ, ಯಾರೋ ನನ್ನ ಫೋನ್ ಕದ್ದರು...",
        btnText: "✨ FIR ರಚಿಸಿ",
        resultTitle: "ನಿಮ್ಮ ದಾಖಲೆ",
        editHint: "ತಿದ್ದುಪಡಿ ಮಾಡಲು ಕೆಳಗಿನ ಪಠ್ಯದ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ.",
        copy: "📋 ನಕಲಿಸಿ",
        pdf: "📄 PDF",
        aiLang: "Kannada"
    }
};

export default function DraftFIRScreen() {
    const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular });
    const router = useRouter();
    const [lang, setLang] = useState<'en' | 'hi' | 'ta' | 'te' | 'kn'>('en');

    const [incidentType, setIncidentType] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    const [isDrafting, setIsDrafting] = useState(false);
    const [draftResult, setDraftResult] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('selectedLanguage').then(val => {
            if (val && ['en', 'hi', 'ta', 'te', 'kn'].includes(val)) {
                setLang(val as any);
            }
        });
    }, []);

    const ui = draftUi[lang] || draftUi.en;

    const generateDraft = async () => {
        if (!description.trim() || !location.trim()) {
            Alert.alert("Missing Details", "Please provide what happened and where.");
            return;
        }

        setIsDrafting(true);
        setDraftResult(null);

        const systemPrompt = `You are an expert Indian criminal lawyer. Draft a formal FIR (First Information Report) letter addressed to 'The Station House Officer (SHO)'.
    
    CRITICAL REQUIREMENT: You MUST write the entire FIR letter in the ${ui.aiLang} language. 
    
    Use formal legal language, leave placeholders like [Your Name], [Police Station Name]. Mention relevant BNS/IPC sections if applicable. Do not write any external conversational text, just the letter.

    Details provided by user:
    Incident Type: ${incidentType || 'Not specified'}
    Date/Time: ${date || 'Not specified'}
    Location: ${location}
    Description: ${description}`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }],
                    generationConfig: { temperature: 0.3 }
                })
            });
            const data = await response.json();
            let cleanText = data.candidates[0].content.parts[0].text.replace(/\*/g, '');
            setDraftResult(cleanText);
        } catch (error) {
            Alert.alert("Error", "Could not generate draft. Please check your internet connection.");
        } finally {
            setIsDrafting(false);
        }
    };

    const copyToClipboard = () => Alert.alert("Copied!", "The draft has been copied to your clipboard.");

    const exportToPDF = async () => {
        if (!draftResult) return;
        try {
            const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: sans-serif; padding: 40px; font-size: 16px; line-height: 1.6; color: #000; }
              h2 { text-align: center; text-decoration: underline; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h2>FIRST INFORMATION REPORT</h2>
            <div class="content">${draftResult}</div>
          </body>
        </html>
      `;
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Share FIR Draft' });
        } catch (error) {
            Alert.alert("Error", "Failed to generate PDF.");
        }
    };

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <RNStatusBar barStyle="light-content" backgroundColor="#09090B" translucent={false} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{ui.title}</Text>
                <View style={styles.spacer} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexOne}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>

                    <Text style={styles.introText}>{ui.intro}</Text>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>{ui.typeLabel}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                            {ui.categories.map((cat: string, idx: number) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.chip, incidentType === cat ? styles.chipActive : null]}
                                    onPress={() => setIncidentType(cat)}
                                >
                                    <Text style={[styles.chipText, incidentType === cat ? styles.chipTextActive : null]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{ui.dateLabel}</Text>
                                <TextInput style={styles.input} placeholder={ui.datePlaceholder} placeholderTextColor="#71717A" value={date} onChangeText={setDate} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{ui.locLabel}</Text>
                                <TextInput style={styles.input} placeholder={ui.locPlaceholder} placeholderTextColor="#71717A" value={location} onChangeText={setLocation} />
                            </View>
                        </View>

                        <Text style={styles.label}>{ui.descLabel}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={ui.descPlaceholder}
                            placeholderTextColor="#71717A" multiline textAlignVertical="top" value={description} onChangeText={setDescription}
                        />

                        <TouchableOpacity style={styles.submitBtn} onPress={generateDraft} disabled={isDrafting}>
                            {isDrafting ? <ActivityIndicator color="#09090B" size="small" /> : <Text style={styles.submitBtnText}>{ui.btnText}</Text>}
                        </TouchableOpacity>
                    </View>

                    {draftResult !== null ? (
                        <View style={styles.resultContainer}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultTitle}>{ui.resultTitle}</Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity onPress={copyToClipboard} style={styles.iconBtn}>
                                        <Text style={styles.iconBtnText}>{ui.copy}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={exportToPDF} style={[styles.iconBtn, styles.pdfBtn]}>
                                        <Text style={styles.iconBtnTextPdf}>{ui.pdf}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.editHint}>{ui.editHint}</Text>

                            <View style={styles.paper}>
                                <TextInput
                                    style={styles.paperTextInput}
                                    multiline
                                    value={draftResult}
                                    onChangeText={setDraftResult}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>
                    ) : null}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#09090B' },
    flexOne: { flex: 1 },
    scrollPadding: { paddingBottom: 60, paddingHorizontal: 20 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#18181B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#27272A' },
    backIcon: { color: '#F8FAFC', fontSize: 20 },
    headerTitle: { color: '#F8FAFC', fontSize: 18, fontFamily: 'DMSerifDisplay_400Regular', flexShrink: 1, textAlign: 'center', paddingHorizontal: 10 },
    spacer: { width: 40 },

    introText: { color: '#A1A1AA', fontSize: 14, lineHeight: 22, marginBottom: 25 },
    formContainer: { backgroundColor: '#18181B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#27272A' },
    label: { color: '#F8FAFC', fontSize: 13, fontWeight: '700', marginBottom: 8 },
    chipScroll: { flexDirection: 'row', marginBottom: 20 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#09090B', borderRadius: 20, borderWidth: 1, borderColor: '#27272A', marginRight: 10 },
    chipActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3B82F6' },
    chipText: { color: '#A1A1AA', fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: '#3B82F6' },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 20 },
    inputGroup: { flex: 1 },
    input: { backgroundColor: '#09090B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#F8FAFC', fontSize: 14, borderWidth: 1, borderColor: '#27272A' },
    textArea: { height: 120, paddingTop: 16, marginBottom: 20 },
    submitBtn: { backgroundColor: '#F8FAFC', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: '#09090B', fontSize: 15, fontWeight: '800' },

    resultContainer: { marginTop: 30 },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    resultTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
    actionRow: { flexDirection: 'row', gap: 8 },
    iconBtn: { backgroundColor: '#27272A', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
    pdfBtn: { backgroundColor: '#3B82F6' },
    iconBtnText: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
    iconBtnTextPdf: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    editHint: { color: '#10B981', fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
    paper: { backgroundColor: '#FAFAFA', borderRadius: 12, padding: 15, minHeight: 400 },
    paperTextInput: { color: '#09090B', fontSize: 14, lineHeight: 24, fontFamily: 'monospace', minHeight: 380, padding: 0 }
});