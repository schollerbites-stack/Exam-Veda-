# 🚀 Exam Veda - Deployment & Web-to-App Guide (तैनाती एवं मोबाइल ऐप गाइड)

यह गाइड आपको Exam Veda को **GitHub, Vercel, Render, Railway** पर लाइव वेबसाइट के रूप में डिप्लॉय करने और इसे **Android APK / Mobile App (PWA / Web-to-App)** में बदलने के लिए संपूर्ण निर्देश प्रदान करता है।

---

## 1. 📁 GitHub पर कोड अपलोड करना (Push to GitHub)

1. अपने कंप्यूटर पर प्रोजेक्ट फोल्डर में टर्मिनल खोलें:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Exam Veda v1.0"
   ```
2. GitHub पर एक नया रिपॉजिटरी (Repository) बनाएं (उदा. `exam-veda`).
3. GitHub रिपॉजिटरी से जोड़ें और कोड पुश करें:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<आपका-यूजरनेम>/exam-veda.git
   git push -u origin main
   ```

---

## 2. ⚡ Vercel पर डिप्लॉय करना (Fastest Website Deployment - 100% Free)

Exam Veda में `vercel.json` पहले से शामिल है, इसलिए Vercel पर यह 1 क्लिक में डिप्लॉय हो जाता है।

1. [Vercel.com](https://vercel.com) पर जाएं और लॉगिन करें।
2. **"Add New Project"** पर क्लिक करें और अपनी GitHub रिपॉजिटरी (`exam-veda`) चुनें।
3. सेटिंग्स:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. **Environment Variables** (पर्यावरण चर):
   - `GROQ_API_KEY`: आपकी Groq API Key (मुफ़्त: [console.groq.com/keys](https://console.groq.com/keys))
   - `GEMINI_API_KEY`: आपकी Gemini API Key ([aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))
5. **Deploy** पर क्लिक करें। आपकी वेबसाइट 1 मिनट में लाइव हो जाएगी (जैसे `https://exam-veda.vercel.app`)।

---

## 3. 🚂 Render.com पर Full-Stack डिप्लॉयमेंट (Express + Vite)

यदि आप बैकएंड सर्वर (Node.js Express + AI Proxy) के साथ पूर्ण सर्वर होस्टिंग चाहते हैं:

1. [Render.com](https://render.com) पर जाएं और **"New Web Service"** चुनें।
2. अपनी GitHub रिपॉजिटरी कनेक्ट करें।
3. निम्नलिखित सेटिंग्स भरें:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - `GROQ_API_KEY`: `gsk_...`
   - `GEMINI_API_KEY`: `AIzaSy...`
   - `NODE_ENV`: `production`
5. **Create Web Service** पर क्लिक करें। Render आपको लाइव लिंक (जैसे `https://exam-veda.onrender.com`) देगा।

---

## 4. 🛤️ Railway.app पर डिप्लॉयमेंट

1. [Railway.app](https://railway.app) पर जाएं।
2. **"New Project"** -> **"Deploy from GitHub repo"** चुनें।
3. Railway अपने आप `package.json` और `Procfile` पहचान लेगा।
4. **Variables** टैब में `GROQ_API_KEY` और `GEMINI_API_KEY` जोड़ें।
5. **Generate Domain** पर क्लिक करें।

---

## 5. 📱 Web to Mobile App (Android APK / PWA बनाना)

Exam Veda में **Progressive Web App (PWA)**, ऑटो-अपडेटिंग सर्विस वर्कर और मेनिफेस्ट के साथ-साथ अब **ऑटोमेटेड GitHub Actions Android APK Builder** भी शामिल है।

### विकल्प A: GitHub Actions द्वारा 1-क्लिक में Release APK डाउनलोड करें (सबसे आसान और तेज़)
1. अपने GitHub रिपॉजिटरी में **Actions** टैब पर जाएं।
2. बायीं ओर **"Build Exam Veda Android APK"** वर्कफ़्लो चुनें।
3. **"Run workflow"** बटन पर क्लिक करें। (यदि आवश्यक हो तो अपनी वेबसाइट का डिप्लॉयड URL दर्ज कर सकते हैं, अन्यथा डिफ़ॉल्ट URL लोड होगा)।
4. लगभग 2-3 मिनट में वर्कफ़्लो पूरा हो जाएगा।
5. पूर्ण हुए रन पर क्लिक करें और सबसे नीचे **Artifacts** सेक्शन में **"ExamVeda-Release-APK"** पर क्लिक करके सीधे अपने मोबाइल में `.apk` फ़ाइल डाउनलोड व इंस्टॉल करें!

### विकल्प B: 2 मिनट में बिना कोडिंग के Android APK बनाएं (PWABuilder)
1. अपनी वेबसाइट Vercel या Render पर डिप्लॉय करें (जैसे `https://exam-veda.vercel.app`)।
2. [PWABuilder.com](https://www.pwabuilder.com) पर जाएं।
3. अपनी वेबसाइट का URL दर्ज करें और **Start** पर क्लिक करें।
4. PWABuilder आपके मेनिफेस्ट और PWA का परीक्षण करेगा (Score 100/100)।
5. **"Package for Android"** पर क्लिक करें।
6. आपको Google Play Store हेतु हस्ताक्षरित `.apk` और `.aab` फाइल तुरंत डाउनलोड मिल जाएगी!

### विकल्प C: स्थानीय मशीन (Android Studio) से APK बिल्ड करना
1. `android/` डायरेक्टरी को सीधे Android Studio में खोलें।
2. **Build -> Build Bundle(s) / APK(s) -> Build APK(s)** पर क्लिक करें।
3. कुछ ही पलों में `android/app/build/outputs/apk/release/` में आपकी ऐप तैयार हो जाएगी।

### विकल्प D: सीधे मोबाइल ब्राउज़र से इंस्टॉल करें (Install App / Add to Home Screen)
- मोबाइल में वेबसाइट खोलने पर Chrome/Edge में स्वतः **"Install Exam Veda"** या **"Add to Home screen"** का विकल्प आएगा।
- यह बिना किसी ऐप स्टोर के ऐप की तरह फुलस्क्रीन में खुलेगा और ऑफलाइन भी चलेगा!

---

## 6. 🔑 API Keys अपडेट करने की विधि

आप जब चाहें तब निम्नलिखित 2 तरीकों से API Keys अपडेट कर सकते हैं:

1. **उपयोगकर्ता इंटरफ़ेस (UI) से**:
   - Exam Veda ऐप खोलें -> "AI Tutor" टैब में जाएं -> शीर्ष दाईं ओर **सेटिंग्स (गियर आइकन)** पर क्लिक करें।
   - यहाँ आप अपनी नई Groq, Gemini या OpenRouter API Key दर्ज करके सुरक्षित कर सकते हैं। यह आपके ब्राउज़र में सुरक्षित रहेगी।

2. **होस्टिंग डैशबोर्ड (Vercel / Render / Railway) से**:
   - Vercel/Render में **Settings -> Environment Variables** में जाएं।
   - `GROQ_API_KEY` या `GEMINI_API_KEY` का मान बदलें और **Redeploy** दबाएं।
