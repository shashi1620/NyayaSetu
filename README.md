<div align="center">
  <img src="https://img.shields.io/badge/Project%20Code-CSE%2052-FF5733?style=for-the-badge&logo=appveyor" alt="Project Code">
  <img src="https://img.shields.io/badge/Platform-React_Native-61DAFB?style=for-the-badge&logo=react" alt="Platform">
  <img src="https://img.shields.io/badge/AI_Engine-Gemini_3.1_Flash-4285F4?style=for-the-badge&logo=google" alt="AI Engine">
  <img src="https://img.shields.io/badge/Status-Active-4CAF50?style=for-the-badge" alt="Status">

  <h1>⚖️ NyayaSetu</h1>
  <h3><i>"Justice, Accessible to All."</i></h3>
  <p>A zero-telemetry, localized, and native Legal Aid & Rights Awareness mobile application designed to democratize legal assistance.</p>
</div>

---

## 🛑 The Justice Gap

Millions of citizens in India face a significant gap when accessing justice. The primary barriers include:
* **Complex Procedures:** Legal processes, such as filing an FIR or drafting a formal complaint, are intimidating and convoluted for the average person.
* **Prohibitive Costs:** Access to professional legal advice is expensive, making it inaccessible for minor disputes or initial guidance.
* **Language Barriers:** The legal system heavily depends on complex legal English, which is not understood by a vast majority of the regional population.
* **Lack of Awareness:** From basic constitutional rights to awareness about evolving consumer fraud (phishing, WhatsApp scams), citizens often don't know their rights until it's too late.

---

## 💡 The "Digital Lawyer" Solution

**NyayaSetu** bridges this gap by turning every smartphone into a proactive digital lawyer. By providing localized, empathetic, and actionable legal tools natively on a mobile device, NyayaSetu ensures users can:
- **Understand their rights** in their own language.
- **Draft legally sound documents** (like FIRs) without hiring a lawyer.
- **Identify scams and frauds** before they cause financial damage.
- **Navigate emergencies** with instant SOS capabilities.

Most importantly, our app follows a strict **zero-telemetry, privacy-first** approach. User data remains on the device, ensuring confidentiality—a critical requirement for legal-tech.

---

## 🔥 High-Impact Features

### 1. Multilingual Dashboard 🌐
* **The Problem:** The complex and intimidating nature of legal-English acts as the biggest barrier to entry for the common person.
* **Technical Solution:** We implemented an optimized language engine using `AsyncStorage` for locale persistence. The application's UI completely remaps to regional languages (*English, Hindi, Tamil, Telugu, Kannada*) instantly, complemented by a native Dark UI for accessibility and eye comfort.

### 2. Fraud Checker (Scam Shield) 🛡️
* **The Problem:** Thousands of crores are lost daily to phishing texts, fake payment links, and WhatsApp scams targeting vulnerable users.
* **Technical Solution:** Integrated Google's Gemini 3.1 Flash REST API with a strict temperature setting (`0.0`) for absolute, deterministic logical precision. The validation logic parses suspicious texts or links and outputs a binary **SAFE / SCAM** result.

### 3. Native FIR Drafter (The Disruptor) 📝
* **The Problem:** Reporting a crime requires drafting an FIR, a technical and highly formalized process that deters victims from seeking help.
* **Technical Solution:** NyayaSetu employs AI roleplaying as a legal advocate. It takes plain, informal regional language inputs from the user, maps the scenario to specific **BNS / IPC** sections, and generates a formalized text addressed to the local SHO. An in-app modal allows manual editing, while `expo-print` and native `expo-sharing` generate and distribute professional PDF copies instantly.

### 4. NyayaMITRA (AI Advocate Chat) 💬
* **The Problem:** Minor legal disputes and unreadable legal notices do not justify expensive lawyer fees, leaving people helpless.
* **Technical Solution:** A highly customized "empathetic" and "street-smart" system prompt layered over the Gemini API allows users to query their legal problems. It instantly extracts applicable laws, provides actionable next steps, and identifies early red flags.

### 5. Nyaya Scanner (AI OCR Toolkit) 📸
* **The Problem:** Manually reading and comprehending legal notices, contracts, or court documents is overwhelming and extremely time-consuming.
* **Technical Solution:** Uses device-native document analysis (via `expo-image-picker` and base64 encoding). The logic categorizes the document across 5 axes: 🛑 Scam, 📌 Summary, ⏳ Deadlines, 🚨 Red Flags, and 🛠️ Next Steps—followed by an interactive chat over the analyzed context.

### 6. SOS & Real-World Rights 🚨
* **The Problem:** Emergencies, sudden harassment, or immediate consumer fraud require instantaneous, coordinated responses.
* **Technical Solution:** Utilizes `expo-location` to fetch high-accuracy GPS coordinates, generating pre-filled WhatsApp action triggers with Maps links. A static "Know Your Rights" repository is baked in, alongside deep linking to the National Consumer Helpline portal.

---

## 🏗️ Technical Architecture

Our technical stack is minimal, resilient, and highly secure.

- **Frontend Framework:** React Native via Expo
- **Routing:** Expo Router for performant, file-based navigation.
- **State & Persistence:** `@react-native-async-storage/async-storage` for instantaneous, zero-latency locale and preference management.
- **AI Brain:** Google Gemini 3.1 Flash (Lite) integrated via an optimized REST API to conserve bundle size.
- **Device Integrations:**
  - `expo-location` (High accuracy geospatial data)
  - `expo-image-picker` & `expo-document-picker` (Media ingestion)
  - `expo-file-system` (Base64 chunking and processing)
- **Document Output:** `expo-print` (HTML to PDF logic) and `expo-sharing` (Native OS share-sheet).

> **Core Philosophy:** *Zero-Telemetry.* We do not use server-side tracking, analytics, or remote telemetry. The user's device talks directly to the AI endpoints.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Java Development Kit (JDK 17+)
- Android Studio / Xcode (Ensure SDKs are configured)
- Expo Go App (for quick mobile preview)

### Step-by-Step Guide

**1. Clone the repository:**
```bash
git clone https://github.com/your-org/NyayaSetu.git
cd NyayaSetu
```

**2. Install dependencies:**
```bash
npm install
# or
yarn install
```

**3. Configure Environment Variables:**
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**4. Start the Development Server:**
```bash
npx expo start
```
*Scan the QR code with the Expo Go app on your physical device, or run it on a local Android/iOS emulator.*

---

## 📱 Feature Walkthrough

<!-- Replace the placeholder paths below with actual images/GIFs when ready -->

| Multilingual Dashboard | Nyaya Scanner | FIR Drafter Output |
| :---: | :---: | :---: |
| <img src="./assets/placeholders/dashboard.png" width="200" alt="Dashboard"/> | <img src="./assets/placeholders/scanner.png" width="200" alt="Scanner"/> | <img src="./assets/placeholders/fir_output.png" width="200" alt="FIR PDF"/> |
| *Seamlessly switch between 5 regional languages with our Dark UI.* | *Scan legal notices instantly and get summaries & red flags.* | *Generate professional, formatted PDFs ready to be shared.* |

---

## 🚀 Future Roadmap

- **🗣️ Voice-Based Querying:** Implement multilingual STT/TTS (Speech-to-Text / Text-to-Speech) so users can speak to NyayaMITRA natively.
- **🏛️ Portal Integration:** Seamless API connection with specific state police backend portals for direct digital FIR lodging.
- **👨‍⚖️ Pro-Bono Lawyer Directory:** A verified list of local, rating-based human lawyers for cases that require courtroom representation.

---

## 📜 License

This project is licensed under the **MIT License**.

> *Built with ❤️ to bridge the justice gap in India.*
