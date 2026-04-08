# NyayaSetu - Detailed Application Summary

NyayaSetu is a comprehensive, multi-lingual legal aid platform developed for Indian citizens. It acts as a "Digital Lawyer," offering features ranging from AI-powered legal advice to document scanning, formal legal drafting, and SOS emergency mechanisms. The entire application is built to be accessible, completely free, and operates natively on mobile devices.

---

## 🛠️ Technology Stack Detail
The application relies heavily on modern frontend web and mobile technologies, with specialized Expo libraries and Google's Gemini AI.

### Core Frameworks & Libraries
- **React Native (v0.81.5)** & **React (v19.1.0)**: The core libraries for building the mobile user interface natively.
- **Expo (v54)**: The chosen development framework for building React Native apps seamlessly.
- **Expo Router (v6) & React Navigation**: Handles all the nested routing, tab-based navigation, and deep linking across the application.
- **AsyncStorage (`@react-native-async-storage/async-storage`)**: Used robustly for persisting user data locally (e.g., `isLoggedIn`, `userName`, `userPhone`, `selectedLanguage`, `nyaya_vault`).

### Intelligent Features (AI)
- **Google Gemini 3.1 Flash Lite (via REST API)**: Used extensively for core app brain logic including:
  - Validating "Scam/Safe" inputs (0.0 temp for high logic precision).
  - Powering the NyayaMitra AI advocate chat bot mapping user issues to Indian law.
  - Analyzing multi-page document setups and highlighting legal red flags and summaries.
  - Transforming simple user complaints into formal FIR legal drafts.

### Hardware / Native APIs Connectivity
- **Expo Location (`expo-location`)**: Captures live GPS coordinates used in the Emergency SOS feature.
- **Expo Image / Document Picker (`expo-image-picker`, `expo-document-picker`)**: Allows capturing pictures via camera or uploading files (PDF/images) for document analysis natively.
- **Expo File System (`expo-file-system`)**: Used for converting selected documents into base64 payloads to be sent to Gemini AI.
- **Expo Print & Sharing (`expo-print`, `expo-sharing`)**: Automatically generates formatted HTML and converts them into PDFs (used to print FIRs / chats) and triggers the native OS sharing functionalities.

### UI / UX & Styling
- **Google Fonts (`@expo-google-fonts/dm-serif-display`)**: Gives a premium serif aesthetic reflecting formal law aesthetics to headers.
- **Expo Linear Gradient (`expo-linear-gradient`)**: Used heavily across screens, buttons, and splash screens for premium gradients (usually `#1E1B4B` to `#3730A3`).
- **Standard Layout Animations**: `LayoutAnimation` and `Animated` API utilized across floating logos, ripple backgrounds, pulsating chat indicators, and list changes.

---

## 📱 Navigation & App Flow (Screen by Screen)

### 1. Splash Screen (`app/splash.tsx`)
- **Visuals**: Displays an intricately animated sequence featuring a floating 'Scales of Justice' icon (⚖️), glowing ripple circles, and a dynamically staggering background of law-related emojis (🔨, 📚, 📜, etc.).
- **Logic**: Stays on screen for 5 seconds while loading Google fonts. Determines user's next route by querying `AsyncStorage`:
  - If `isLoggedIn` & `selectedLanguage` present $\rightarrow$ Routes to `/(tabs)`.
  - If only `isLoggedIn` $\rightarrow$ Routes to `/language`.
  - Else $\rightarrow$ Routes to `/login`.

### 2. Login / Authentication Flow (`app/login.tsx`)
- **Theme**: Dark immersive gradient background with animated circles.
- **Step 1 (User Info)**: Asks for "Full Name" and a "10-digit Mobile Number". Includes a "Continue as Guest" fallback. 
- **Step 2 (OTP Verification)**: Mock OTP setup ("Demo Mode") taking a 6-digit pin. Once validated, saves details to `AsyncStorage` securely and redirects the user to the language selection.

### 3. Language Selection (`app/language.tsx`)
- **Dynamic Localization Base**: Serves as the core initialization of the user experience.
- Supported Languages:
  - English (en): 🏛️ All India
  - Hindi (hi): 🕍 North India
  - Tamil (ta): 🛕 Tamil Nadu
  - Telugu (te): 🏯 Andhra & Telangana
  - Kannada (kn): 🐘 Karnataka
- Saves the users locale preference to globally trigger dictionary translations throughout all downstream tabs via `AsyncStorage`.

### 4. Onboarding Carousel (`app/onboarding.tsx`)
- **Information Flow**: 4 dynamic slides detailing the USPs of NyayaSetu (Legal aid platform, AI Lawyer 24/7, Emergency Help, Completely Free). 
- **Interactivity**: Fully translated based on previous language selection. Utilizes a React Native `FlatList` with `pagingEnabled` for smooth swiping. Final slide transitions user directly into the main app dashboard.

---

## 🗂️ The Core Hub: Bottom Tabs Layout (`app/(tabs)/_layout.tsx`)
- Controls consistent styling for the bottom bar, localized tab names based on the active language. 
- Features custom emojis as tab icons (🏠 Home, 🤖 AI Lawyer, 📄 Scanner, 📍 Centers, 👤 Profile) and provides dynamic translation scaling.

### Tab 1: Home Dashboard (`app/(tabs)/index.tsx`)
The central command center of the citizen.
- **Header**: Greets the user (`Namaste, [UserName]`) and features an ever-present, glowing **Emergency SOS (🚨)** trigger.
- **SOS Modal**: Requests Location Permissions $\rightarrow$ Fetches High-Accuracy GPS $\rightarrow$ Generates an exact Google Maps string $\rightarrow$ Opens a pre-filled WhatsApp share overlay instantly. Also displays quick access to 112 (National Emergency), 100 (Police), 1091 (Women Helpline), 1930 (Cyber Crime).
- **WhatsApp Fraud Checker (Scam Shield)**: User pastes a text/link. The system sends it to Gemini with `temperature: 0.0` ensuring absolute logical reasoning. Returns an immediate "SAFE" or "SCAM" flag natively.
- **Word of the Hour (Legal Glossary)**: An educational section that changes every hour (calculated against the phone's clock) dropping simple definitions for words like "F.I.R", "Bail", "Alimony", etc.
- **Paperwork Assistant / Document Tools**: Action cards allowing quick leaps to "Scan Notice" or "Draft FIR".
- **Nyaya Locker (Vault)**: Mock integration tracking recently processed documents and interactions reading from `AsyncStorage`.
- **Aaj Ka Kanoon (Facts Tracker)**: Displays everyday law facts citizens ignore (eg. Traffic police can't take ignition keys, female arrest protections post-sunset).

### Tab 2: AI Lawyer / Chat (`app/(tabs)/explore.tsx`)
A highly specialized Chatbot named **NyayaMitra**.
- **Specialized Law Prompting**: Injected system prompt ensures NyayaMitra acts as an empathetic, "street-smart" senior Indian advocate. Output strictly adheres to:
  1. The Law 📌
  2. Next Steps 🛠️ (Actionables with links)
  3. Red Flags 🚨
- **Smart Draft Trigger**: If the user's issue requires a formal application, the AI independently offers to build a draft (Keep-It-Simple constraint).
- **Interactive UI Renderings**: Regex string manipulations dynamically highlight these emojis mapping them to styled colored cards natively overriding flat texts.
- **Quick Taps (Suggested Prompts)**: Horizontally scrollable chips for high-frequency queries (File FIR, Unpaid Salary, Cyber Fraud).
- **Export to PDF**: If a draft is generated, an `Edit Draft` modal appears, post which the user can directly export the text as a polished PDF using `expo-print`.

### Tab 3: Nyaya Scanner (`app/(tabs)/scanner.tsx`)
AI OCR and context analyzing toolkit.
- **Input Methods**: Access to `Camera` (Take photo), `Gallery` (upload images), or `PDF Upload` (via Expo Document Picker).
- **Multi-Document Tray**: Allows queuing and cross-analyzing multiple pages/images dynamically. Converts data to Base64 arrays.
- **AI Analytics**: The Gemini API processes the image data strictly adhering to returning 5 categories: Scam Analysis 🛑, Summary 📌, Deadlines ⏳, Red Flags 🚨, and Next Steps 🛠️.
- **Document Q&A**: Once an analysis is pulled, a sub-chat unlocks where the user can interrogate the uploaded documents (e.g., "Where do I sign?"). 
- **Share Summary**: Pure native text sharing capability.

### Tab 4: Legal Aid & Map (`app/(tabs)/map.tsx`)
Connects users to real-world resources.
- **Consumer Hotline DeepLink**: Immediately ties users to `consumerhelpline.gov.in`.
- **Pro-Bono / Clinics Directory Grid**: Employs upcoming feature mock alerts stating mapping is currently underway.
- **Know Your Rights Library**: A highly visible, simple list ensuring citizens know what to do at critical friction points (Tenant eviction, Police arrest, Workplace harassment).

### Tab 5: Profile (`app/(tabs)/profile.tsx`)
- Visual display of initials and login tracking payload.
- Allows jumping back to `/language` to toggle translation states across the entirety of the application logic. 
- Logout logic securely clears all variables from `AsyncStorage`.

---

## 📝 Dedicated Feature: Draft FIR (`app/draft.tsx`)
A standalone route explicitly decoupled from the chat bot to create focused procedural documents.
- **Input Formats**: Accepts "Type of Incident" tags, Date/Time, Location Strings, and a plain-language description paragraph ("What happened?").
- **Generation Logic**: Forces the AI to roleplay as a criminal lawyer, mapping common scenarios (like stolen phones at a metro) directly into Indian Penal Code / BNS sections seamlessly in the background.
- **Output Capabilities**: Offers an immediate in-app text editor (so users can manually tweak names and police station placeholders), followed by immediate clipboard copying or `expo-print` generated A4 PDF exports ready for authoritative printing.

## 🌟 Application Philosophy & Policies
Every feature natively maps back to local variables `['en', 'hi', 'ta', 'te', 'kn']` using dictionary objects to remap UI string instances perfectly inline prior to render. NyayaSetu embraces absolute minimalism, emphasizing accessibility, and prioritizes safety (0 data telemetry setup seen, `temperature 0` logical locks on scam checks) serving an A-grade utility for the common Indian citizen.
