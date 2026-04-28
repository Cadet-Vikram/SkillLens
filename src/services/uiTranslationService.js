import { GOOGLE_TRANSLATE_KEY } from "../constants/config";

const translationCache = new Map();

const LOCAL_TRANSLATIONS = {
  hi: {
    "Home": "होम",
    "Skills": "कौशल",
    "Learn": "सीखें",
    "Coach": "कोच",
    "Progress": "प्रगति",
    "Profile": "प्रोफ़ाइल",
    "SkillLens": "स्किललेंस",
    "Know your gaps. Own your future.": "अपनी कमियों को जानें। अपना भविष्य खुद बनाएं।",
    "AI detects your exact skill gaps": "एआई आपकी असली कौशल कमियों को पहचानता है",
    "Personalized 4-week learning path": "व्यक्तिगत 4-सप्ताह का सीखने का रास्ता",
    "Works in Hindi, Tamil, Telugu & more": "हिंदी, तमिल, तेलुगु और अन्य भाषाओं में काम करता है",
    "100% free - always": "100% मुफ़्त - हमेशा",
    "Your personal AI career coach.\nSpeak your goal. We'll map your path.": "आपका व्यक्तिगत एआई करियर कोच।\nअपना लक्ष्य बोलिए। हम आपका रास्ता बनाएंगे।",
    "Get Started - It's Free": "शुरू करें - यह मुफ़्त है",
    "I already have an account": "मेरे पास पहले से खाता है",
    "Welcome Back": "वापसी पर स्वागत है",
    "Continue your learning journey": "अपनी सीखने की यात्रा जारी रखें",
    "Email Address": "ईमेल पता",
    "Password": "पासवर्ड",
    "Sign In": "साइन इन",
    "Don't have an account?": "क्या आपके पास खाता नहीं है?",
    "Sign up free": "मुफ़्त में साइन अप करें",
    "Create Account": "खाता बनाएं",
    "Join thousands learning smarter with AI": "एआई के साथ हजारों लोगों की तरह स्मार्ट तरीके से सीखें",
    "Full Name": "पूरा नाम",
    "Email": "ईमेल",
    "At least 6 characters": "कम से कम 6 अक्षर",
    "Already have an account?": "क्या आपके पास पहले से खाता है?",
    "Back": "वापस",
    "Continue": "जारी रखें",
    "Choose your preferred language": "अपनी पसंदीदा भाषा चुनें",
    "SkillLens will coach you in this language": "स्किललेंस आपको इसी भाषा में कोच करेगा",
    "What's your career dream? 🎯": "आपका करियर सपना क्या है? 🎯",
    "Be specific! e.g. \"I want to become a data analyst and get a job at a tech company\"": "स्पष्ट लिखिए! जैसे: \"मैं डेटा एनालिस्ट बनकर किसी टेक कंपनी में नौकरी करना चाहता/चाहती हूँ\"",
    "Type your career goal...": "अपना करियर लक्ष्य लिखें...",
    "Analyze My Skills": "मेरे कौशल का विश्लेषण करें",
    "Good day, ": "शुभ दिन, ",
    "Your career journey starts here": "आपकी करियर यात्रा यहीं से शुरू होती है",
    "Job Readiness": "नौकरी के लिए तैयारी",
    "Keep going!": "जारी रखें!",
    "Path done": "पथ पूरा",
    "Today's Task": "आज का कार्य",
    "Start Learning": "सीखना शुरू करें",
    "Your Skill Gaps": "आपकी कौशल कमियाँ",
    "See all": "सब देखें",
    "Skill": "कौशल",
    "Now": "अब",
    "Goal": "लक्ष्य",
    "Quick Actions": "त्वरित कार्य",
    "Learning Path": "सीखने का मार्ग",
    "AI Coach": "एआई कोच",
    "Skill Report": "कौशल रिपोर्ट",
    "Updating language...": "भाषा अपडेट हो रही है...",
    "This takes a few seconds ☕": "इसमें कुछ सेकंड लगेंगे ☕",
    "Updating language & regenerating content...": "भाषा अपडेट हो रही है और सामग्री बन रही है...",
    "Updating Language": "भाषा अपडेट",
    "Changing the app language to {lang}.": "ऐप की भाषा {lang} में बदली जा रही है।",
    "App language changed to {lang}.": "ऐप की भाषा {lang} में बदल गई है।",
    "All app text will switch to your chosen language.": "ऐप का सारा पाठ आपकी चुनी हुई भाषा में बदल जाएगा।",
    "Language": "भाषा",
    "Tap to change - updates the app language": "बदलने के लिए टैप करें - ऐप भाषा अपडेट होगी",
    "Settings": "सेटिंग्स",
    "Actions": "कार्य",
    "Share Portfolio": "पोर्टफ़ोलियो शेयर करें",
    "Show your progress to employers": "अपनी प्रगति नियोक्ताओं को दिखाएं",
    "Re-analyze Skills": "कौशल का पुनः विश्लेषण",
    "Update your skill gap report": "अपनी कौशल गैप रिपोर्ट अपडेट करें",
    "Sign Out": "साइन आउट",
    "See you soon!": "फिर मिलेंगे!",
    "Choose Language": "भाषा चुनें",
    "Not set": "सेट नहीं है",
    "Done!": "हो गया!",
    "Error": "त्रुटि",
    "Language change failed. Please try again.": "भाषा बदलना विफल रहा। कृपया फिर कोशिश करें।",
    "This will re-run the AI analysis on your current goal. Continue?": "यह आपके वर्तमान लक्ष्य का एआई विश्लेषण फिर से करेगा। जारी रखें?",
    "SkillLens Coach": "स्किललेंस कोच",
    "Always available": "हमेशा उपलब्ध",
    "Thinking...": "सोच रहा हूँ...",
    "Ask your coach anything...": "अपने कोच से कुछ भी पूछें...",
    "How do I start learning SQL?": "मैं SQL सीखना कैसे शुरू करूँ?",
    "What are the best free resources?": "सबसे अच्छे मुफ़्त संसाधन कौन से हैं?",
    "How long will it take to get job-ready?": "नौकरी के लिए तैयार होने में कितना समय लगेगा?",
    "Explain Python in simple terms": "Python को सरल शब्दों में समझाइए",
    "How do I practice data analysis?": "मैं डेटा विश्लेषण का अभ्यास कैसे करूँ?",
    "Your Skill Report": "आपकी कौशल रिपोर्ट",
    "Target role": "लक्षित भूमिका",
    "Ready": "तैयार",
    "Job Readiness Score": "नौकरी तैयारी स्कोर",
    "Focus Areas": "ध्यान देने वाले क्षेत्र",
    "Skill-by-Skill Breakdown": "कौशल-वार विवरण",
    "Current": "वर्तमान",
    "Required": "आवश्यक",
    "Gap": "अंतर",
    "to close": "भरने के लिए",
    "Your Progress": "आपकी प्रगति",
    "Days Done": "दिन पूरे",
    "Day Streak": "लगातार दिन",
    "Overall Progress": "कुल प्रगति",
    "days completed": "दिन पूरे हुए",
    "Skill Growth Tracker": "कौशल वृद्धि ट्रैकर",
    "Initial": "शुरुआत",
    "Growth": "वृद्धि",
    "Week by Week": "सप्ताह दर सप्ताह",
    "Complete": "पूरा",
    "Achievement Unlocked!": "उपलब्धि अनलॉक!",
    "5-Day Starter - great momentum!": "5-दिन शुरुआत - शानदार गति!",
    "Halfway there - amazing progress!": "आधा सफर पूरा - शानदार प्रगति!",
    "Path Complete! You're job-ready!": "मार्ग पूरा! आप नौकरी के लिए तैयार हैं!",
    "Open Resource": "संसाधन खोलें",
    "Resource": "संसाधन",
    "Open your learning platform and search for this topic.": "अपना सीखने का प्लेटफ़ॉर्म खोलें और इस विषय को खोजें।",
    "Could not open link": "लिंक नहीं खुल सका",
    "Daily Quiz": "दैनिक क्विज़",
    "Task": "कार्य",
    "Great job! That's correct.": "बहुत बढ़िया! यह सही है।",
    "Close": "बंद करें",
    "Mark Day Complete": "दिन पूरा चिह्नित करें",
    "Updating language and regenerating content...": "भाषा अपडेट हो रही है और सामग्री बन रही है...",
  },
};

function localFallbackTranslate(text, language) {
  const code = getLanguageCode(language);
  if (code === "en") return text;
  return LOCAL_TRANSLATIONS[code]?.[text] || text;
}

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getLanguageCode(language) {
  const map = {
    English: "en",
    "हिंदी (Hindi)": "hi",
    "தமிழ் (Tamil)": "ta",
    "తెలుగు (Telugu)": "te",
    "বাংলা (Bengali)": "bn",
    "मराठी (Marathi)": "mr",
  };
  return map[language] || "en";
}

async function translateBatch(texts, language) {
  if (language === "English") return texts;
  if (!GOOGLE_TRANSLATE_KEY) return texts.map((text) => localFallbackTranslate(text, language));

  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source: "en",
      target: getLanguageCode(language),
      format: "text",
    }),
  });

  if (!res.ok) {
    return texts.map((text) => localFallbackTranslate(text, language));
  }

  const data = await res.json();
  return (data?.data?.translations || []).map((item) => decodeHtmlEntities(item.translatedText));
}

function chunkArray(values, size) {
  const chunks = [];
  for (let i = 0; i < values.length; i += size) {
    chunks.push(values.slice(i, i + size));
  }
  return chunks;
}

export async function translateTexts(texts, language) {
  const normalized = texts.map((text) => String(text ?? ""));
  if (language === "English") return normalized;
  if (!GOOGLE_TRANSLATE_KEY) {
    return normalized.map((text) => localFallbackTranslate(text, language));
  }

  const output = new Array(normalized.length);
  const missing = [];

  normalized.forEach((text, index) => {
    const cacheKey = `${language}::${text}`;
    if (translationCache.has(cacheKey)) {
      output[index] = translationCache.get(cacheKey);
      return;
    }
    missing.push({ text, index, cacheKey });
  });

  if (!missing.length) return output;

  const uniqueMissing = [];
  const seen = new Set();
  missing.forEach((item) => {
    if (seen.has(item.cacheKey)) return;
    seen.add(item.cacheKey);
    uniqueMissing.push(item);
  });

  const uniqueTexts = uniqueMissing.map((item) => item.text);
  const translated = [];
  for (const chunk of chunkArray(uniqueTexts, 20)) {
    translated.push(...await translateBatch(chunk, language));
  }

  uniqueMissing.forEach((item, index) => {
    const value = translated[index] ?? item.text;
    translationCache.set(item.cacheKey, value);
  });

  missing.forEach((item) => {
    output[item.index] = translationCache.get(item.cacheKey) ?? item.text;
  });

  return output;
}
