import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
  LayoutAnimation, UIManager, Modal, Linking
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language } from '../constants/translations';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GEMINI_API_KEY = 'AIzaSyBXV_PqXxbQFBL52ytvrGk3o-V4UsBWYfM';

const quickTaps = [
  { id: 'fir', icon: '🚨', label: { en: 'File FIR', hi: 'FIR दर्ज करें', ta: 'FIR தாக்கல்', te: 'FIR దాఖలు', kn: 'FIR ದಾಖಲಿಸಿ' }, template: { en: 'I need to file an FIR. The incident is: ', hi: 'मुझे FIR दर्ज करनी है। घटना यह है: ' } },
  { id: 'salary', icon: '💼', label: { en: 'Unpaid Salary', hi: 'रुका हुआ वेतन', ta: 'சம்பள பாக்கி', te: 'చెల్లించని జీతం', kn: 'ಪಾವತಿಸದ ವೇತನ' }, template: { en: 'My employer is not paying my salary. The details are: ', hi: 'मेरा नियोक्ता मेरा वेतन नहीं दे रहा है। विवरण हैं: ' } },
  { id: 'rent', icon: '🏠', label: { en: 'Tenant Issue', hi: 'किरायेदार विवाद', ta: 'குத்தகைதாரர் பிரச்சனை', te: 'అద్దెదారు సమస్య', kn: 'ಬಾಡಿಗೆದಾರರ సమస్య' }, template: { en: 'I am facing an issue with my landlord regarding: ', hi: 'मुझे अपने मकान मालिक के साथ इस बारे में समस्या आ रही है: ' } },
  { id: 'cyber', icon: '💻', label: { en: 'Cyber Fraud', hi: 'साइबर धोखाधड़ी', ta: 'சைபர் மோசடி', te: 'సైబర్ మోసం', kn: 'ಸೈಬರ್ ವಂಚನೆ' }, template: { en: 'I am a victim of online fraud. What happened was: ', hi: 'मैं ऑनलाइन धोखाधड़ी का शिकार हुआ हूँ। हुआ यह कि: ' } },
  { id: 'women', icon: '👩', label: { en: 'Women Safety', hi: 'महिला सुरक्षा', ta: 'பெண்கள் பாதுகாப்பு', te: 'మహిళల భద్రత', kn: 'ಮಹಿಳಾ ಸುರಕ್ಷತೆ' }, template: { en: 'I need legal help regarding women’s safety/harassment. The situation is: ', hi: 'मुझे महिला सुरक्षा/उत्पीड़न के संबंध में कानूनी मदद चाहिए। स्थिति यह है: ' } },
];

const cleanText = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
    .replace(/###\s*/g, '').replace(/##\s*/g, '').replace(/#\s*/g, '').trim();
};

const isDraftMessage = (text: string) => {
  if (text.length < 50) return false;
  if (text.includes('📌') || text.includes('🛠️')) return false;
  if (text.includes('[') && text.includes(']')) return true;
  if (text.toLowerCase().includes('subject:') || text.toLowerCase().includes('respected')) return true;
  return false;
};

const LawBackgroundPattern = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={styles.patternGrid}><Text style={styles.patternIcon}>⚖️</Text><Text style={styles.patternIcon}>🏛️</Text><Text style={styles.patternIcon}>📜</Text></View>
    <View style={[styles.patternGrid, { marginTop: 150, marginLeft: 50 }]}><Text style={styles.patternIcon}>📜</Text><Text style={styles.patternIcon}>⚖️</Text><Text style={styles.patternIcon}>🏛️</Text></View>
  </View>
);

export default function ChatScreen() {
  const { topic, lang: paramLang } = useLocalSearchParams();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular });
  const [lang, setLang] = useState<Language>('en');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (paramLang) setLang(paramLang as Language);
    else AsyncStorage.getItem('selectedLanguage').then(val => { if (val) setLang(val as Language); });
  }, [paramLang]);

  const t = translations[lang];

  const getWelcomeMessage = () => {
    return lang === 'hi' ? `नमस्ते जी! मैं न्यायमित्र हूँ। आइए बैठिए, बताइए मैं आपकी क्या कानूनी मदद कर सकता हूँ?` : `Hello! I am NyayaMitra, your personal advocate. Come sit, tell me how I can help you today?`;
  };

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([{ role: 'assistant', text: getWelcomeMessage() }]);
    if (topic) setInput(`I need help regarding ${topic}. Specifically: `);
  }, [lang, topic]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages, isTyping]);

  const handleQuickTap = (templateText: string) => {
    setInput(templateText);
    setTimeout(() => { inputRef.current?.focus(); }, 150);
  };

  const resetChat = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([{ role: 'assistant', text: getWelcomeMessage() }]);
    setInput('');
  };

  const exportToPDF = async (textToExport: string) => {
    try {
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { 
                font-family: 'Times New Roman', Times, serif; 
                padding: 40px; 
                font-size: 14px; 
                line-height: 1.6; 
                color: #000; 
              }
              p { margin-bottom: 12px; }
            </style>
          </head>
          <body>
            <div style="text-align: justify;">
              ${textToExport.replace(/\n/g, '<br/>')}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Export Legal Document' });
        setIsEditorVisible(false);
      } else {
        Alert.alert('Sharing Not Available', 'PDF sharing is not supported on this device.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    }
  };

  const openEditor = (text: string) => {
    setEditingText(text);
    setIsEditorVisible(true);
  };

  const simulateTypingEffect = (fullText: string) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      let currentText = '';
      const chars = fullText.split('');
      let i = 0;
      setMessages(prev => [...prev, { role: 'assistant', text: '' }]);
      const typeInterval = setInterval(() => {
        const chunk = chars.slice(i, i + 3).join('');
        currentText += chunk;
        setMessages(prev => { const newMsgs = [...prev]; newMsgs[newMsgs.length - 1].text = currentText; return newMsgs; });
        i += 3;
        if (i >= chars.length) { clearInterval(typeInterval); setIsTyping(false); resolve(); }
      }, 15);
    });
  };

  const callGemini = async (userMsg: string, chatHistory: any[]) => {
    // 🧠 UPDATED PROMPT: "KEEP IT SIMPLE STUPID" RULE ADDED FOR DRAFTS
    const systemInstruction = `You are NyayaMitra, a highly experienced, deeply empathetic, and street-smart senior Indian advocate.

🔴 CRITICAL LANGUAGE RULE: Respond ENTIRELY in ${t?.aiLanguage || 'English'}.

CORE PERSONALITY:
1. THE HUMAN TOUCH: If they are stressed, start with a warm, conversational, reassuring sentence (e.g. "Ghabrane ki baat nahi hai").
2. SARAL BHASHA: Explain their legal rights in very simple terms.
3. HELPFUL LINKS: Provide official URLs starting with https:// so the user can click them.

OUTPUT STRUCTURE FOR ADVICE (STEP 1):
📌 The Law : [1-2 lines explaining their legal standing smoothly]
🛠️ Next Steps: [2-3 immediate, highly actionable steps. Include portal links if relevant]
🚨 Red Flag: [1 critical mistake they MUST NOT do]

🤝 SMART CONDITIONAL DRAFTING OFFER:
ONLY if the user's situation clearly requires a formal document, ask them nicely at the very end: "Agar aap chahein, toh kya main aapke liye iski ek formal application/draft taiyar kar doon?" (Translate to ${t?.aiLanguage || 'English'}).

📝 DRAFTING MODE (STEP 2 - ONLY IF REQUESTED):
If the user replies "Yes", instantly generate a SIMPLE, TO-THE-POINT, and FACTUAL formal application/letter template.
CRITICAL DRAFTING RULES:
- KEEP IT SHORT. Do not write long essays.
- NO UNNECESSARY LEGALESE. Police and courts prefer plain language. Stick to the facts provided by the user.
- DO NOT add dramatic emotional pleas or overly complex vocabulary.
- Use simple placeholders like [Your Name], [Date], [Police Station].
- Do not use the emojis from Step 1 here.`;

    const contents = chatHistory.map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: contents, systemInstruction: { parts: [{ text: systemInstruction }] }, generationConfig: { temperature: 0.4, maxOutputTokens: 800 } })
    });
    const data = await response.json();
    return cleanText(data.candidates[0].content.parts[0].text);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || isTyping) return;
    const msg = input.trim();
    setInput('');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const replyText = await callGemini(msg, [...messages, { role: 'user', text: msg }]);
      setLoading(false);
      await simulateTypingEffect(replyText);
    } catch (e: any) {
      setLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ Network error. Please try again.` }]);
    }
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Text
            key={index}
            style={styles.linkText}
            onPress={() => Linking.openURL(part).catch(() => Alert.alert('Error', 'Could not open the link.'))}
          >
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const renderFormattedText = (text: string, role: string) => {
    if (role === 'user') return <Text style={styles.userText}>{renderTextWithLinks(text)}</Text>;

    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.includes('📌')) return <Text key={index} style={styles.lawHighlight}>{renderTextWithLinks(line)}</Text>;
      if (line.includes('🛠️')) return <Text key={index} style={styles.stepHighlight}>{renderTextWithLinks(line)}</Text>;
      if (line.includes('🚨')) return <Text key={index} style={styles.redFlagHighlight}>{renderTextWithLinks(line)}</Text>;
      return <Text key={index} style={styles.botText}>{renderTextWithLinks(line)}</Text>;
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderInfo}>
          <View style={styles.chatAvatar}><Text style={styles.chatAvatarText}>⚖️</Text></View>
          <View>
            <Text style={styles.chatLawyerName}>NyayaMitra</Text>
            <Text style={styles.chatLawyerTitle}>{isTyping || loading ? "Typing..." : "Online • Digital Advocate"}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={resetChat}><Text style={styles.resetIcon}>🔄</Text><Text style={styles.resetText}>{lang === 'hi' ? 'नया केस' : 'New Case'}</Text></TouchableOpacity>
      </View>

      <View style={styles.chatArea}>
        <LawBackgroundPattern />
        <ScrollView ref={scrollRef} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {messages.map((msg, i) => {
            const showDraftActions = msg.role === 'assistant' && i > 0 && (!isTyping || i !== messages.length - 1) && isDraftMessage(msg.text);

            return (
              <View key={i} style={[styles.bubbleWrapper, msg.role === 'user' ? styles.userWrapper : styles.botWrapper]}>
                {msg.role === 'assistant' && <View style={styles.avatar}><Text style={styles.avatarText}>⚖️</Text></View>}
                <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
                  {renderFormattedText(msg.text, msg.role)}
                  {isTyping && i === messages.length - 1 && <Text style={styles.cursor}> ⬤</Text>}

                  {showDraftActions && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => openEditor(msg.text)}>
                        <Text style={styles.actionIcon}>📝 Edit Draft</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => exportToPDF(msg.text)}>
                        <Text style={styles.actionIconSecondary}>📄 PDF</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {loading && !isTyping && (
            <View style={[styles.bubbleWrapper, styles.botWrapper]}>
              <View style={styles.avatar}><Text style={styles.avatarText}>⚖️</Text></View>
              <View style={[styles.bubble, styles.botBubble, { paddingVertical: 12 }]}><ActivityIndicator size="small" color="#FBBF24" /></View>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.inputWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickTapContainer} contentContainerStyle={styles.quickTapContent} keyboardShouldPersistTaps="handled">
          {quickTaps.map((tap) => (
            <TouchableOpacity key={tap.id} style={styles.quickTapChip} onPress={() => handleQuickTap(tap.template[lang] || tap.template.en)}>
              <Text style={styles.quickTapIcon}>{tap.icon}</Text><Text style={styles.quickTapText}>{tap.label[lang] || tap.label.en}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput ref={inputRef} style={styles.input} value={input} onChangeText={setInput} placeholder={lang === 'hi' ? "अपनी समस्या यहाँ लिखें..." : "Explain your legal issue..."} placeholderTextColor="#64748B" multiline maxLength={500} editable={!isTyping} />
            <TouchableOpacity style={styles.micBtn} onPress={() => Alert.alert("Bol Bhai", "Voice Input coming soon!")}><Text style={styles.micIcon}>🎙️</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.sendBtn, (!input.trim() || loading || isTyping) && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || loading || isTyping}>
              <LinearGradient colors={input.trim() && !loading && !isTyping ? ['#F59E0B', '#D97706'] : ['#334155', '#334155']} style={styles.sendGradient}><Text style={styles.sendText}>↑</Text></LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.uiDisclaimerText}>
            {lang === 'hi'
              ? '⚠️ न्यायमित्र एक AI है। किसी भी आधिकारिक कानूनी कार्रवाई के लिए पंजीकृत वकील से सलाह लें।'
              : '⚠️ NyayaMitra is an AI. Please consult a registered advocate for official legal actions.'}
          </Text>

        </View>
      </View>

      <Modal visible={isEditorVisible} animationType="slide" transparent={true} onRequestClose={() => setIsEditorVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View><Text style={styles.modalTitle}>Edit Legal Draft</Text><Text style={styles.modalSub}>Replace placeholders like [Your Name]</Text></View>
              <TouchableOpacity onPress={() => setIsEditorVisible(false)} style={styles.closeBtn}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
            </View>

            <TextInput style={styles.editorInput} value={editingText} onChangeText={setEditingText} multiline textAlignVertical="top" autoFocus />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveShareBtn} onPress={() => exportToPDF(editingText)}>
                <LinearGradient colors={['#DC2626', '#991B1B']} style={styles.saveShareGradient}>
                  <Text style={styles.saveShareText}>📄 Export as Professional PDF</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 55, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#0B0F19', borderBottomWidth: 1, borderBottomColor: '#1E293B', zIndex: 10 },
  chatHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FBBF24' },
  chatAvatarText: { fontSize: 22 },
  chatLawyerName: { fontSize: 20, fontWeight: '800', color: '#F8FAFC', fontFamily: 'DMSerifDisplay_400Regular', letterSpacing: 0.5 },
  chatLawyerTitle: { fontSize: 12, color: '#10B981', marginTop: 2, fontWeight: '600' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  resetIcon: { fontSize: 12, marginRight: 4 },
  resetText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  chatArea: { flex: 1, backgroundColor: '#0B0F19' },
  patternGrid: { flexDirection: 'row', justifyContent: 'space-around', width: '150%', opacity: 0.03, marginBottom: 80 },
  patternIcon: { fontSize: 60, transform: [{ rotate: '-15deg' }] },
  chatContent: { padding: 16, paddingBottom: 20 },
  bubbleWrapper: { flexDirection: 'row', marginVertical: 8, alignItems: 'flex-end' },
  userWrapper: { justifyContent: 'flex-end' },
  botWrapper: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 2, borderWidth: 1, borderColor: '#334155' },
  avatarText: { fontSize: 14 },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 18 },
  userBubble: { backgroundColor: '#3730A3', borderBottomRightRadius: 4 },
  userText: { color: '#F8FAFC', fontSize: 15, lineHeight: 22 },
  botBubble: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4, borderLeftWidth: 3, borderLeftColor: '#FBBF24', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 3 },
  botText: { color: '#E2E8F0', fontSize: 15, lineHeight: 24, marginBottom: 4 },
  cursor: { color: '#FBBF24', fontSize: 12 },
  lawHighlight: { color: '#FBBF24', fontSize: 15, fontWeight: '700', lineHeight: 24, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden', marginTop: 8, marginBottom: 4 },
  stepHighlight: { color: '#34D399', fontSize: 15, fontWeight: '600', lineHeight: 24, marginTop: 8, marginBottom: 4 },
  redFlagHighlight: { color: '#FCA5A5', fontSize: 15, fontWeight: '700', lineHeight: 24, backgroundColor: 'rgba(153, 27, 27, 0.3)', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden', marginTop: 8, marginBottom: 4 },
  linkText: { color: '#60A5FA', textDecorationLine: 'underline', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3730A3', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionIcon: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },
  actionBtnSecondary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionIconSecondary: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },
  inputWrapper: { backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B' },
  quickTapContainer: { maxHeight: 55, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  quickTapContent: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', gap: 10 },
  quickTapChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  quickTapIcon: { fontSize: 14, marginRight: 6 },
  quickTapText: { fontSize: 13, color: '#E2E8F0', fontWeight: '600' },
  inputContainer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, backgroundColor: '#1E293B', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, color: '#F8FAFC', maxHeight: 100, borderWidth: 1, borderColor: '#334155' },
  micBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  micIcon: { fontSize: 18 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendGradient: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  uiDisclaimerText: { fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 10, paddingHorizontal: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11, 15, 25, 0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', height: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  modalSub: { fontSize: 13, color: '#FBBF24', marginTop: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  closeIcon: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  editorInput: { flex: 1, backgroundColor: '#0F172A', borderRadius: 16, padding: 16, color: '#E2E8F0', fontSize: 15, lineHeight: 24, borderWidth: 1, borderColor: '#334155' },
  modalFooter: { paddingTop: 16 },
  saveShareBtn: { borderRadius: 16, overflow: 'hidden' },
  saveShareGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  saveShareText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});