import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StatusBar as RNStatusBar, Animated, Alert, Modal, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// ⚠️ Replace with your actual Gemini API Key
const GEMINI_API_KEY = 'AIzaSyBXV_PqXxbQFBL52ytvrGk3o-V4UsBWYfM';

type VaultItem = { id: string; type: 'doc' | 'chat'; title: string; subtitle: string; timestamp: number; };

// 🔥 DICTIONARY
const homeUi: Record<string, any> = {
  en: {
    aiLang: "English",
    greetingPrefix: "Namaste, ", subGreeting: "Welcome to NyayaSetu", sosText: "SOS",
    scamTitle: "WhatsApp Fraud Checker", scamSub: "Verify suspicious links or messages instantly.", scamPlaceholder: "Paste link or message here...", checkBtn: "Verify",
    wothTitle: "Word of the Hour", wothTimerPrefix: "Next in ",
    wordsList: [
      { term: "F.I.R.", meaning: "First Information Report. The very first complaint given to police about a crime.", usage: "Example: You file an FIR if your phone gets stolen." },
      { term: "Bail", meaning: "Money or condition given to the court to release a person from jail while the case is going on.", usage: "Example: The judge granted him bail for ₹10,000." },
      { term: "Warrant", meaning: "An official written order by a judge allowing police to make an arrest or search a home.", usage: "Example: Police cannot search your house without a search warrant." },
      { term: "Defamation", meaning: "Saying or publishing false things about someone to ruin their reputation.", usage: "Example: Spreading fake rumors about a colleague online is defamation." },
      { term: "Alimony", meaning: "Financial support that the court orders one spouse to pay the other after a divorce.", usage: "Example: The husband was ordered to pay ₹15,000 monthly as alimony." },
      { term: "Affidavit", meaning: "A written promise or statement made under oath. If you lie in it, it's a crime.", usage: "Example: You need an affidavit to change your name officially." }
    ],
    paperworkTitle: "Legal Paperwork", paperworkSub: "AI-powered document tools", actionScan: "Scan Notice", actionDraft: "Draft FIR",
    vaultTitle: "Nyaya Locker", emptyVault: "No recent activity.", factsTitle: "Aaj Ka Kanoon", viewAll: "View All",
    facts: [
      { id: 1, icon: '🛑', title: "Traffic Rules", desc: "A traffic police officer cannot take your keys out of the ignition." },
      { id: 2, icon: '👩', title: "Women's Safety", desc: "A woman cannot be arrested after sunset without a magistrate's order." },
      { id: 3, icon: '🛒', title: "Consumer Rights", desc: "No shopkeeper can charge you more than the printed MRP on a product." },
      { id: 4, icon: '💼', title: "Unpaid Salary", desc: "You can send a legal notice to your employer for delaying or not paying your salary." },
      { id: 5, icon: '🤰', title: "Maternity Rights", desc: "It is illegal for an employer to fire a pregnant working woman." }
    ],
    sosModalTitle: "Emergency SOS", sosModalSub: "Send your live location or call for help instantly.", waBtnText: "Send Live Location", helplinesTitle: "Direct Helplines",
    helplines: [
      { name: "National Emergency", number: "112", icon: "🚨" }, { name: "Police", number: "100", icon: "🚓" }, { name: "Women Helpline", number: "1091", icon: "🛡️" }, { name: "Cyber Crime", number: "1930", icon: "💻" }
    ]
  },
  hi: {
    aiLang: "Hindi",
    greetingPrefix: "नमस्ते, ", subGreeting: "न्यायसेतु में आपका स्वागत है", sosText: "आपातकाल",
    scamTitle: "व्हाट्सएप फ्रॉड चेकर", scamSub: "संदिग्ध लिंक या मैसेज को तुरंत जांचें।", scamPlaceholder: "लिंक या मैसेज पेस्ट करें...", checkBtn: "जांचें",
    wothTitle: "शब्द प्रति घंटा", wothTimerPrefix: "अगला ",
    wordsList: [
      { term: "F.I.R. (प्राथमिकी)", meaning: "पुलिस को किसी अपराध के बारे में दी गई सबसे पहली लिखित शिकायत।", usage: "उदाहरण: फोन चोरी होने पर आप पुलिस में FIR दर्ज कराते हैं।" },
      { term: "ज़मानत (Bail)", meaning: "केस चलने के दौरान आरोपी को जेल से बाहर रखने के लिए कोर्ट में जमा की गई राशि या शर्त।", usage: "उदाहरण: जज ने उसे ₹10,000 के मुचलके पर ज़मानत दे दी।" }
    ],
    paperworkTitle: "कानूनी दस्तावेज़", paperworkSub: "AI दस्तावेज़ टूल", actionScan: "नोटिस स्कैन", actionDraft: "FIR ड्राफ्ट",
    vaultTitle: "न्याय लॉकर", emptyVault: "कोई हालिया गतिविधि नहीं।", factsTitle: "आज का कानून", viewAll: "सभी देखें",
    facts: [
      { id: 1, icon: '🛑', title: "ट्रैफिक नियम", desc: "ट्रैफिक पुलिस आपकी कार या बाइक से चाबी नहीं निकाल सकती है।" },
      { id: 2, icon: '👩', title: "महिला सुरक्षा", desc: "सूर्यास्त के बाद और सूर्योदय से पहले महिला को गिरफ्तार नहीं किया जा सकता।" },
      { id: 3, icon: '🛒', title: "उपभोक्ता अधिकार", desc: "कोई भी दुकानदार आपसे MRP से ज्यादा पैसे नहीं मांग सकता।" },
      { id: 4, icon: '💼', title: "रुकी हुई सैलरी", desc: "आप अपनी बकाया सैलरी के लिए कंपनी को कानूनी नोटिस भेज सकते हैं।" },
      { id: 5, icon: '🤰', title: "मातृत्व अधिकार", desc: "किसी भी गर्भवती महिला कर्मचारी को नौकरी से निकालना गैरकानूनी है।" }
    ],
    sosModalTitle: "आपातकालीन SOS", sosModalSub: "अपनी लाइव लोकेशन भेजें या तुरंत मदद के लिए कॉल करें।", waBtnText: "लाइव लोकेशन भेजें", helplinesTitle: "सीधे हेल्पलाइन्स",
    helplines: [
      { name: "राष्ट्रीय आपातकाल", number: "112", icon: "🚨" }, { name: "पुलिस", number: "100", icon: "🚓" }, { name: "महिला हेल्पलाइन", number: "1091", icon: "🛡️" }, { name: "साइबर अपराध", number: "1930", icon: "💻" }
    ]
  },
  ta: {
    aiLang: "Tamil",
    greetingPrefix: "வணக்கம், ", subGreeting: "NyayaSetu-விற்கு வரவேற்கிறோம்", sosText: "அவசரம்",
    scamTitle: "WhatsApp மோசடி சரிபார்ப்பு", scamSub: "சந்தேகத்திற்குரிய இணைப்புகளை உடனடியாக சரிபார்க்கவும்.", scamPlaceholder: "இணைப்பை ஒட்டவும்...", checkBtn: "சரிபார்",
    wothTitle: "மணிநேரத்தின் சொல்", wothTimerPrefix: "அடுத்து ",
    wordsList: [
      { term: "பிடியாணை இன்றி கைது செய்யக்கூடிய குற்றம்", meaning: "நீதிமன்ற உத்தரவின்றி காவல்துறை கைது செய்து விசாரணையைத் தொடங்கக்கூடிய ஒரு தீவிர குற்றம்.", usage: "உதாரணம்: கொலை மற்றும் ஆள்கடத்தல்." }
    ],
    paperworkTitle: "சட்ட ஆவணங்கள்", paperworkSub: "AI ஆவணக் கருவிகள்", actionScan: "நோட்டீஸ் ஸ்கேன்", actionDraft: "FIR உருவாக்கு",
    vaultTitle: "நியாய லாக்கர்", emptyVault: "சமீபத்திய செயல்பாடு இல்லை.", factsTitle: "இன்றைய சட்டம்", viewAll: "அனைத்தையும் பார்",
    facts: [
      { id: 1, icon: '🛑', title: "போக்குவரத்து விதிகள்", desc: "போக்குவரத்து காவலர் உங்கள் வாகன சாவியை எடுக்க முடியாது." },
      { id: 2, icon: '👩', title: "பெண்கள் பாதுகாப்பு", desc: "சூரிய அஸ்தமனத்திற்குப் பிறகு பெண்களைக் கைது செய்ய முடியாது." },
      { id: 3, icon: '🛒', title: "நுகர்வோர் உரிமைகள்", desc: "MRP-யை விட அதிக கட்டணம் வசூலிக்க கடைக்காரருக்கு உரிமை இல்லை." },
      { id: 4, icon: '💼', title: "சம்பள பிரச்சனை", desc: "நிலுவையில் உள்ள சம்பளத்திற்காக நீங்கள் நிறுவனத்திற்கு நோட்டீஸ் அனுப்பலாம்." },
      { id: 5, icon: '🤰', title: "மகப்பேறு உரிமைகள்", desc: "கர்ப்பிணிப் பெண்ணை வேலையிலிருந்து நீக்குவது சட்டவிரோதமானது." }
    ],
    sosModalTitle: "அவசர SOS", sosModalSub: "உங்கள் நேரலை இருப்பிடத்தை அனுப்பவும் அல்லது உதவிக்கு அழைக்கவும்.", waBtnText: "நேரலை இருப்பிடத்தை அனுப்பு", helplinesTitle: "உதவி எண்கள்",
    helplines: [
      { name: "தேசிய அவசரம்", number: "112", icon: "🚨" }, { name: "காவல்துறை", number: "100", icon: "🚓" }, { name: "பெண்கள் உதவி", number: "1091", icon: "🛡️" }, { name: "சைபர் கிரைம்", number: "1930", icon: "💻" }
    ]
  },
  te: {
    aiLang: "Telugu",
    greetingPrefix: "నమస్కారం, ", subGreeting: "NyayaSetu కు స్వాగతం", sosText: "అత్యవసరం",
    scamTitle: "WhatsApp మోసం తనిఖీ", scamSub: "అనుమానాస్పద లింక్‌లను తక్షణమే ధృవీకరించండి.", scamPlaceholder: "లింక్ లేదా సందేశాన్ని పేస్ట్ చేయండి...", checkBtn: "తనిఖీ",
    wothTitle: "గంట పదం", wothTimerPrefix: "తదుపరి ",
    wordsList: [
      { term: "కాగ్నిజబుల్ నేరం", meaning: "పోలీసులు వారెంట్ లేకుండా అరెస్టు చేసి కోర్టు ఆదేశం లేకుండా దర్యాప్తు ప్రారంభించే తీవ్రమైన నేరం.", usage: "ఉదాహరణ: హత్య మరియు కిడ్నాప్." }
    ],
    paperworkTitle: "చట్టపరమైన పత్రాలు", paperworkSub: "AI పత్ర సాధనాలు", actionScan: "నోటీసు స్కాన్", actionDraft: "FIR డ్రాఫ్ట్",
    vaultTitle: "న్యాయ లాకర్", emptyVault: "ఇటీవలి కార్యాచరణ లేదు.", factsTitle: "నేటి చట్టం", viewAll: "అన్ని చూడండి",
    facts: [
      { id: 1, icon: '🛑', title: "ట్రాఫిక్ రూల్స్", desc: "ట్రాఫిక్ పోలీసులు మీ వాహనం నుండి తాళాన్ని తీయలేరు." },
      { id: 2, icon: '👩', title: "మహిళా భద్రత", desc: "సూర్యాస్తమయం తర్వాత మహిళలను అరెస్టు చేయలేరు." },
      { id: 3, icon: '🛒', title: "వినియోగదారుల హక్కులు", desc: "ఏ దుకాణదారుడు MRP కంటే ఎక్కువ వసూలు చేయకూడదు." },
      { id: 4, icon: '💼', title: "చెల్లించని జీతం", desc: "మీ జీతం ఇవ్వకపోతే మీరు కంపెనీకి లీగల్ నోటీసు పంపవచ్చు." },
      { id: 5, icon: '🤰', title: "ప్రసూతి హక్కులు", desc: "గర్భిణీ స్త్రీని ఉద్యోగం నుండి తొలగించడం చట్టవిరుద్ధం." }
    ],
    sosModalTitle: "అత్యవసర SOS", sosModalSub: "మీ ప్రత్యక్ష స్థానాన్ని పంపండి లేదా సహాయం కోసం కాల్ చేయండి.", waBtnText: "ప్రత్యక్ష స్థానాన్ని పంపండి", helplinesTitle: "హెల్ప్‌లైన్‌లు",
    helplines: [
      { name: "జాతీయ అత్యవసరం", number: "112", icon: "🚨" }, { name: "పోలీస్", number: "100", icon: "🚓" }, { name: "మహిళా హెల్ప్‌లైన్", number: "1091", icon: "🛡️" }, { name: "సైபர் క్రైమ్", number: "1930", icon: "💻" }
    ]
  },
  kn: {
    aiLang: "Kannada",
    greetingPrefix: "ನಮಸ್ಕಾರ, ", subGreeting: "NyayaSetu ಗೆ ಸ್ವಾಗತ", sosText: "ತುರ್ತು",
    scamTitle: "WhatsApp ವಂಚನೆ ಪರಿಶೀಲನೆ", scamSub: "ಅನುಮಾನಾಸ್ಪದ ಲಿಂಕ್‌ಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ.", scamPlaceholder: "ಲಿಂಕ್ ಅಥವಾ ಸಂದೇಶವನ್ನು ಅಂಟಿಸಿ...", checkBtn: "ಪರಿಶೀಲಿಸಿ",
    wothTitle: "ಗಂಟೆಯ ಪದ", wothTimerPrefix: "ಮುಂದಿನ ",
    wordsList: [
      { term: "ಕಾಗ್ನಿಜೆಬಲ್ ಅಪರಾಧ", meaning: "ವಾರಂಟ್ ಇಲ್ಲದೆ ಪೊಲೀಸರು ಬಂಧಿಸಿ ತನಿಖೆ ಆರಂಭಿಸಬಹುದಾದ ಗಂಭೀರ ಅಪರಾಧ.", usage: "ಉದಾಹರಣೆ: ಕೊಲೆ ಮತ್ತು ಅಪಹರಣ." }
    ],
    paperworkTitle: "ಕಾನೂನು ದಾಖಲೆಗಳು", paperworkSub: "AI ದಾಖಲೆ ಪರಿಕರಗಳು", actionScan: "ನೋಟಿಸ್ ಸ್ಕ್ಯಾನ್", actionDraft: "FIR ರಚಿಸಿ",
    vaultTitle: "ನ್ಯಾಯ ಲಾಕರ್", emptyVault: "ಇತ್ತೀಚಿನ ಯಾವುದೇ ಚಟುವಟಿಕೆ ಇಲ್ಲ.", factsTitle: "ಇಂದಿನ ಕಾನೂನು", viewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    facts: [
      { id: 1, icon: '🛑', title: "ಸಂಚಾರ ನಿಯಮಗಳು", desc: "ಟ್ರಾಫಿಕ್ ಪೊಲೀಸರು ನಿಮ್ಮ ವಾಹನದ ಕೀಲಿಯನ್ನು ಕಿತ್ತುಕೊಳ್ಳುವಂತಿಲ್ಲ." },
      { id: 2, icon: '👩', title: "ಮಹಿಳಾ ಸುರಕ್ಷತೆ", desc: "ಸೂರ್ಯಾಸ್ತದ ನಂತರ ಮಹಿಳೆಯರನ್ನು ಬಂಧಿಸುವಂತಿಲ್ಲ." },
      { id: 3, icon: '🛒', title: "ಗ್ರಾಹಕರ ಹಕ್ಕುಗಳು", desc: "MRP ಗಿಂತ ಹೆಚ್ಚಿನ ಹಣವನ್ನು ಕೇಳಲು ಯಾವುದೇ ಅಂಗಡಿಯವನಿಗೆ ಹಕ್ಕಿಲ್ಲ." },
      { id: 4, icon: '💼', title: "ಪಾವತಿಸದ ವೇತನ", desc: "ನಿಮ್ಮ ಬಾಕಿ ಇರುವ ವೇತನಕ್ಕಾಗಿ ನೀವು ಕಂಪನಿಗೆ ಕಾನೂನು ನೋಟಿಸ್ ಕಳುಹಿಸಬಹುದು." },
      { id: 5, icon: '🤰', title: "ಹೆರಿಗೆ ಹಕ್ಕುಗಳು", desc: "ಗರ್ಭಿಣಿ ಮಹಿಳೆಯನ್ನು ಕೆಲಸದಿಂದ ವಜಾಗೊಳಿಸುವುದು ಕಾನೂನುಬಾಹಿರ." }
    ],
    sosModalTitle: "ತುರ್ತು SOS", sosModalSub: "ನಿಮ್ಮ ಲೈವ್ ಸ್ಥಳವನ್ನು ಕಳುಹಿಸಿ ಅಥವಾ ಸಹಾಯಕ್ಕಾಗಿ ಕರೆ ಮಾಡಿ.", waBtnText: "ಲೈವ್ ಸ್ಥಳವನ್ನು ಕಳುಹಿಸಿ", helplinesTitle: "ಸಹಾಯವಾಣಿಗಳು",
    helplines: [
      { name: "ರಾಷ್ಟ್ರೀಯ ತುರ್ತು", number: "112", icon: "🚨" }, { name: "ಪೊಲೀಸ್", number: "100", icon: "🚓" }, { name: "ಮಹಿಳಾ ಸಹಾಯವಾಣಿ", number: "1091", icon: "🛡️" }, { name: "ಸೈಬರ್ ಕ್ರೈಮ್", number: "1930", icon: "💻" }
    ]
  }
};

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular });
  const [lang, setLang] = useState<'en' | 'hi' | 'ta' | 'te' | 'kn'>('en');
  const [userName, setUserName] = useState<string>('Citizen');
  const router = useRouter();

  const [scamInput, setScamInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [scamResult, setScamResult] = useState<string | null>(null);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);

  const [isSosVisible, setIsSosVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    AsyncStorage.multiGet(['selectedLanguage', 'userName']).then(values => {
      const storedLang = values[0][1];
      const storedName = values[1][1];
      if (storedLang && ['en', 'hi', 'ta', 'te', 'kn'].includes(storedLang)) setLang(storedLang as any);
      if (storedName) setUserName(storedName);
    });

    loadVault();

    const calculateTimeLeft = () => {
      const now = new Date();
      const nextHour = new Date();
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      return Math.floor((nextHour.getTime() - now.getTime()) / 1000);
    };

    setTimeLeft(calculateTimeLeft());
    setCurrentHour(new Date().getHours());

    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (left === 3599) setCurrentHour(new Date().getHours());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadVault = async () => {
    const stored = await AsyncStorage.getItem('nyaya_vault');
    if (stored) setVaultItems(JSON.parse(stored));
    else {
      const mock: VaultItem[] = [{ id: '1', type: 'doc', title: 'Rental_Agreement.pdf', subtitle: 'Analyzed', timestamp: Date.now() - 86400000 }];
      setVaultItems(mock);
    }
  };

  const ui = homeUi[lang] || homeUi.en;
  const currentWordData = ui.wordsList[currentHour % ui.wordsList.length] || ui.wordsList[0];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const sendWhatsAppLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need location access to send your SOS.");
        setIsLocating(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude } = location.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message = `🚨 *EMERGENCY SOS* 🚨\nI need immediate help! Here is my exact live location:\n${mapsUrl}\n\nSent via NyayaSetu App.`;

      const whatsappUri = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUri);

      if (canOpen) {
        await Linking.openURL(whatsappUri);
        setIsSosVisible(false);
      } else {
        Alert.alert("WhatsApp Not Found", "Please make sure WhatsApp is installed on your device.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch location. Please ensure your phone's GPS is ON.");
    } finally {
      setIsLocating(false);
    }
  };

  const callHelpline = (number: string) => Linking.openURL(`tel:${number}`);

  // 🔥 100% ACCURATE & STRICTLY LOCALIZED SCAM CHECKER
  const checkScam = async () => {
    if (!scamInput.trim()) return;
    setIsChecking(true); setScamResult(null);

    const prompt = `As a strict Cyber Security Expert, analyze the input and classify it as SCAM or SAFE. 
    
    STEP 1 (Analyze): Ignore the output language for now. Check the intent.
    - SCAM: Asks for OTP/PIN, urgent money, unknown/shortened links (bit.ly), electricity disconnect threats, fake lottery (KBC), fake WFH jobs.
    - SAFE: Normal conversation, general questions, greetings.

    STEP 2 (Format): Now, translate your final decision into EXACTLY the ${ui.aiLang} language. Do NOT output in English unless the requested language is English.

    Use this EXACT format in the ${ui.aiLang} language:
    If SCAM: "🛑 [Translate 'SCAM ALERT' to ${ui.aiLang}]: [1 short precise reason in ${ui.aiLang}]"
    If SAFE: "✅ [Translate 'SAFE' to ${ui.aiLang}]: [1 short precise reason in ${ui.aiLang}]"

    Input: "${scamInput}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.0 } // 🔥 TEMPERATURE 0.0 FOR 100% LOCK ON LOGIC
        })
      });
      const data = await response.json();
      setScamResult(data.candidates[0].content.parts[0].text);
    } catch (e) {
      setScamResult("⚠️ Network error.");
    } finally {
      setIsChecking(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <RNStatusBar barStyle="light-content" backgroundColor="#09090B" translucent={false} />

      {/* SOS MODAL */}
      <Modal visible={isSosVisible} transparent={true} animationType="fade" onRequestClose={() => setIsSosVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🚨 {ui.sosModalTitle}</Text>
              <TouchableOpacity onPress={() => setIsSosVisible(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>{ui.sosModalSub}</Text>
            <TouchableOpacity style={styles.waButton} onPress={sendWhatsAppLocation} disabled={isLocating}>
              {isLocating ? <ActivityIndicator color="#FFF" size="small" /> : <><Text style={styles.waIcon}>📍</Text><Text style={styles.waBtnText}>{ui.waBtnText}</Text><Text style={styles.waBrandIcon}>💬</Text></>}
            </TouchableOpacity>
            <View style={styles.dividerModal} />
            <Text style={styles.helplineTitle}>{ui.helplinesTitle}</Text>
            {ui.helplines.map((hp: any, idx: number) => (
              <TouchableOpacity key={idx} style={styles.helplineRow} onPress={() => callHelpline(hp.number)}>
                <View style={styles.hpInfo}><Text style={styles.hpIcon}>{hp.icon}</Text><Text style={styles.hpName}>{hp.name}</Text></View>
                <View style={styles.hpCallBox}><Text style={styles.hpNumber}>{hp.number}</Text><Text style={styles.hpCallIcon}>📞</Text></View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flexShrink: 1, paddingRight: 10 }}>
            <Text style={styles.greeting}>{ui.greetingPrefix}{userName}</Text>
            <Text style={styles.subGreeting}>{ui.subGreeting}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsSosVisible(true)} style={styles.sosBubble}>
            <Text style={styles.sosBubbleIcon}>🚨</Text>
            <Text style={styles.sosBubbleText}>{ui.sosText}</Text>
          </TouchableOpacity>
        </View>

        {/* 1. SCAM CHECKER */}
        <View style={styles.section}>
          <View style={styles.scamCard}>
            <Text style={styles.scamTitle}>🛡️ {ui.scamTitle}</Text>
            <Text style={styles.scamSub}>{ui.scamSub}</Text>
            <View style={styles.scamInputRow}>
              <TextInput style={styles.scamInput} placeholder={ui.scamPlaceholder} placeholderTextColor="#71717A" value={scamInput} onChangeText={setScamInput} />
              <TouchableOpacity style={styles.scamBtn} onPress={checkScam} disabled={isChecking}>
                {isChecking ? <ActivityIndicator color="#09090B" size="small" /> : <Text style={styles.scamBtnText}>{ui.checkBtn}</Text>}
              </TouchableOpacity>
            </View>
            {scamResult && <View style={[styles.resultBox, scamResult.includes('🛑') || scamResult.includes('SCAM') ? styles.dangerBox : styles.safeBox]}><Text style={styles.resultText}>{scamResult}</Text></View>}
          </View>
        </View>

        {/* 2. WORD OF THE HOUR */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{ui.wothTitle}</Text>
            <View style={styles.wothTimerBadge}>
              <Text style={styles.wothTimerText}>🕒 {ui.wothTimerPrefix}{formatTime(timeLeft)}</Text>
            </View>
          </View>
          <LinearGradient colors={['#1E1B4B', '#0F172A']} style={styles.wothCard}>
            <Text style={styles.wothTerm}>{currentWordData.term}</Text>
            <Text style={styles.wothMeaning}>{currentWordData.meaning}</Text>
            <View style={styles.usageTag}><Text style={styles.usageText}>{currentWordData.usage}</Text></View>
          </LinearGradient>
        </View>

        {/* 3. PAPERWORK ASSISTANT */}
        <View style={styles.section}>
          <View style={styles.paperworkCard}>
            <Text style={styles.paperworkTitle}>{ui.paperworkTitle}</Text>
            <Text style={styles.paperworkSub}>{ui.paperworkSub}</Text>
            <View style={styles.paperworkActions}>
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => router.push('/scanner')}>
                <Text style={styles.actionIcon}>📄</Text><Text style={styles.actionBtnText}>{ui.actionScan}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => router.push('/draft')}>
                <Text style={styles.actionIcon}>✍️</Text><Text style={styles.actionBtnTextSecondary}>{ui.actionDraft}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. NYAYA LOCKER */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{ui.vaultTitle}</Text>
            <TouchableOpacity><Text style={styles.linkText}>{ui.viewAll}</Text></TouchableOpacity>
          </View>
          <View style={styles.vaultCard}>
            {vaultItems.length === 0 ? <Text style={styles.emptyText}>{ui.emptyVault}</Text> : vaultItems.map((item, index) => (
              <View key={item.id}>
                <View style={styles.vaultItem}>
                  <View style={styles.vaultIconBox}><Text style={styles.vaultIcon}>{item.type === 'doc' ? '📄' : '💬'}</Text></View>
                  <View style={styles.vaultTextGroup}>
                    <Text style={styles.vaultItemName}>{item.title}</Text>
                    <Text style={styles.vaultItemSub}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.vaultArrow}>›</Text>
                </View>
                {index < vaultItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* 5. AAJ KA KANOON */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>{ui.factsTitle}</Text>
          <View style={styles.factsVerticalList}>
            {ui.facts.map((fact: any) => (
              <View key={fact.id} style={styles.factCardVertical}>
                <View style={styles.factHeader}>
                  <Text style={styles.factIcon}>{fact.icon}</Text>
                  <Text style={styles.factTitle}>{fact.title}</Text>
                </View>
                <Text style={styles.factDesc}>{fact.desc}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#09090B' }, container: { flex: 1 }, scrollPadding: { paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20 },
  greeting: { fontSize: 14, color: '#A1A1AA', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  subGreeting: { fontSize: 24, color: '#F8FAFC', fontFamily: 'DMSerifDisplay_400Regular', marginTop: 4 },

  sosBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#450a0a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, borderWidth: 1.5, borderColor: '#ef4444', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  sosBubbleIcon: { fontSize: 16, marginRight: 6 },
  sosBubbleText: { color: '#fca5a5', fontWeight: '900', fontSize: 15, letterSpacing: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#18181B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: '#27272A', borderBottomWidth: 0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#27272A', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#A1A1AA', fontSize: 16, fontWeight: '700' },
  modalSub: { color: '#A1A1AA', fontSize: 14, marginBottom: 24 },
  waButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#22c55e', paddingVertical: 16, borderRadius: 16, marginBottom: 24 },
  waIcon: { fontSize: 20, marginRight: 8 },
  waBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
  waBrandIcon: { fontSize: 20, marginLeft: 8, marginRight: 16 },
  dividerModal: { height: 1, backgroundColor: '#27272A', marginBottom: 20 },
  helplineTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  helplineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#09090B', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#27272A' },
  hpInfo: { flexDirection: 'row', alignItems: 'center' },
  hpIcon: { fontSize: 20, marginRight: 12 },
  hpName: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  hpCallBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  hpNumber: { color: '#3B82F6', fontSize: 14, fontWeight: '700', marginRight: 6 },
  hpCallIcon: { fontSize: 14 },

  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', flexShrink: 1 },
  linkText: { color: '#38bdf8', fontSize: 13, fontWeight: '600', alignSelf: 'center' },

  scamCard: { backgroundColor: '#18181B', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#27272A' },
  scamTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  scamSub: { color: '#A1A1AA', fontSize: 13, marginBottom: 16 },
  scamInputRow: { flexDirection: 'row', gap: 10 },
  scamInput: { flex: 1, height: 46, backgroundColor: '#09090B', borderRadius: 12, paddingHorizontal: 14, color: '#F8FAFC', borderWidth: 1, borderColor: '#27272A' },
  scamBtn: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 20, height: 46, justifyContent: 'center' },
  scamBtnText: { color: '#09090B', fontWeight: '800' },
  resultBox: { marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  dangerBox: { backgroundColor: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)' },
  safeBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  resultText: { color: '#F8FAFC', fontSize: 13, lineHeight: 20 },

  wothTimerBadge: { backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', alignSelf: 'center' },
  wothTimerText: { color: '#38bdf8', fontSize: 11, fontWeight: '700' },
  wothCard: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#312E81' },
  wothTerm: { color: '#818CF8', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  wothMeaning: { color: '#F8FAFC', fontSize: 14, lineHeight: 22, marginBottom: 14 },
  usageTag: { backgroundColor: 'rgba(129, 140, 248, 0.1)', padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#818CF8' },
  usageText: { color: '#A5B4FC', fontSize: 13, fontStyle: 'italic', lineHeight: 20 },

  paperworkCard: { backgroundColor: '#18181B', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#27272A' },
  paperworkTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  paperworkSub: { color: '#A1A1AA', fontSize: 13, marginBottom: 16 },
  paperworkActions: { flexDirection: 'row', gap: 12 },
  actionBtnPrimary: { flex: 1, flexDirection: 'row', backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionBtnSecondary: { flex: 1, flexDirection: 'row', backgroundColor: '#27272A', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { fontSize: 16, marginRight: 6 },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  actionBtnTextSecondary: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },

  vaultCard: { backgroundColor: '#18181B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#27272A' },
  emptyText: { color: '#71717A', fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  vaultItem: { flexDirection: 'row', alignItems: 'center' },
  vaultIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#27272A', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  vaultIcon: { fontSize: 18 },
  vaultTextGroup: { flex: 1 },
  vaultItemName: { color: '#F8FAFC', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  vaultItemSub: { color: '#A1A1AA', fontSize: 12 },
  vaultArrow: { color: '#52525B', fontSize: 20, fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#27272A', marginVertical: 12 },

  factsVerticalList: { gap: 14 },
  factCardVertical: { backgroundColor: '#18181B', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#27272A', width: '100%' },
  factHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  factIcon: { fontSize: 18, marginRight: 8 },
  factTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  factDesc: { color: '#A1A1AA', fontSize: 13, lineHeight: 20 }
});