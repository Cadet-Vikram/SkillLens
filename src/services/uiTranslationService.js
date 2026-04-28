import { GOOGLE_TRANSLATE_KEY } from "../constants/config";

const translationCache = new Map();

const LOCAL_TRANSLATIONS = {
  hi: {
    "Know your gaps. Own your future.": "अपनी कमियाँ जानिए. अपना भविष्य खुद बनाइए.",
    "AI detects your exact skill gaps": "AI आपकी सटीक कौशल कमियाँ पहचानता है",
    "Personalized 4-week learning path": "व्यक्तिगत 4-सप्ताह का सीखने का मार्ग",
    "Works in Hindi, Tamil, Telugu & more": "हिंदी, तमिल, तेलुगु और अन्य भाषाओं में काम करता है",
    "100% free - always": "100% मुफ़्त - हमेशा",
    "Your personal AI career coach.\nSpeak your goal. We'll map your path.": "आपका व्यक्तिगत AI करियर कोच.\nअपना लक्ष्य बोलिए. हम आपका रास्ता बनाएँगे.",
    "Get Started - It's Free": "शुरू करें - यह मुफ़्त है",
    "I already have an account": "मेरे पास पहले से खाता है",
    "Welcome Back": "वापसी पर स्वागत है",
    "Continue your learning journey": "अपनी सीखने की यात्रा जारी रखें",
    "Email Address": "ईमेल पता",
    "Password": "पासवर्ड",
    "Sign In": "साइन इन",
    "Don't have an account?": "क्या आपके पास खाता नहीं है?",
    "Sign up free": "मुफ़्त में साइन अप करें",
    "Create Account": "खाता बनाएँ",
    "Join thousands learning smarter with AI": "AI के साथ हज़ारों लोगों की तरह स्मार्ट तरीके से सीखें",
    "Full Name": "पूरा नाम",
    "Email": "ईमेल",
    "At least 6 characters": "कम से कम 6 अक्षर",
    "Already have an account?": "क्या आपके पास पहले से खाता है?",
    "Back": "वापस",
    "Continue": "जारी रखें",
    "Language": "भाषा",
    "Your Goal": "आपका लक्ष्य",
    "Choose your preferred language": "अपनी पसंदीदा भाषा चुनें",
    "SkillLens will coach you in this language": "SkillLens आपको इसी भाषा में कोच करेगा",
    "What's your career dream? 🎯": "आपका करियर सपना क्या है? 🎯",
    "Be specific! e.g. \"I want to become a data analyst and get a job at a tech company\"": "स्पष्ट लिखिए! जैसे: \"मैं डेटा एनालिस्ट बनना चाहता हूँ और किसी टेक कंपनी में नौकरी पाना चाहता हूँ\"",
    "Type your career goal...": "अपना करियर लक्ष्य लिखें...",
    "Analyze My Skills": "मेरे कौशल का विश्लेषण करें",
    "Hi": "नमस्ते",
    "Good day, ": "शुभ दिन, ",
    "Your career journey starts here": "आपकी करियर यात्रा यहीं से शुरू होती है",
    "Job Readiness": "नौकरी के लिए तैयारी",
    "Keep going!": "जारी रखें!",
    "Path done": "मार्ग पूरा",
    "Today's Task": "आज का कार्य",
    "Start Learning": "सीखना शुरू करें",
    "Your Skill Gaps": "आपकी कौशल कमियाँ",
    "See all": "सभी देखें",
    "Skill": "कौशल",
    "Now": "अभी",
    "Goal": "लक्ष्य",
    "Quick Actions": "त्वरित कार्य",
    "Learning Path": "सीखने का मार्ग",
    "AI Coach": "AI कोच",
    "Skill Report": "कौशल रिपोर्ट",
    "Progress": "प्रगति",
    "Updating language...": "भाषा अपडेट हो रही है...",
    "This takes a few seconds ☕": "इसमें कुछ सेकंड लगेंगे ☕",
    "Updating language & regenerating content...": "भाषा अपडेट हो रही है और सामग्री फिर से बन रही है...",
    "Updating Language": "भाषा अपडेट",
    "Changing the app language to {lang}.": "ऐप की भाषा {lang} में बदली जा रही है.",
    "App language changed to {lang}.": "ऐप की भाषा {lang} में बदल गई है.",
    "App language has been updated.": "ऐप की भाषा अपडेट हो गई है.",
    "If some AI-generated content is still in the old language, it will continue to work and can be refreshed later.": "यदि कुछ AI-जनित सामग्री अभी भी पुरानी भाषा में है, तो वह काम करती रहेगी और बाद में रीफ़्रेश की जा सकती है.",
    "All app text will switch to your chosen language.": "ऐप का सारा पाठ आपकी चुनी हुई भाषा में बदल जाएगा.",
    "Tap to change - updates the app language": "बदलने के लिए टैप करें - ऐप भाषा अपडेट होती है",
    "Settings": "सेटिंग्स",
    "Actions": "कार्रवाइयाँ",
    "Share Portfolio": "पोर्टफोलियो साझा करें",
    "Show your progress to employers": "अपनी प्रगति नियोक्ताओं को दिखाएँ",
    "Re-analyze Skills": "कौशल का पुनः विश्लेषण करें",
    "Update your skill gap report": "अपनी कौशल गैप रिपोर्ट अपडेट करें",
    "Sign Out": "साइन आउट",
    "See you soon!": "फिर मिलेंगे!",
    "Choose Language": "भाषा चुनें",
    "Not set": "सेट नहीं है",
    "Done!": "हो गया!",
    "Error": "त्रुटि",
    "Language change failed. Please try again.": "भाषा बदलने में विफल रहा. कृपया फिर से कोशिश करें.",
    "This will re-run the AI analysis on your current goal. Continue?": "यह आपके वर्तमान लक्ष्य का AI विश्लेषण फिर से चलाएगा. जारी रखें?",
    "SkillLens Coach": "SkillLens कोच",
    "Always available": "हमेशा उपलब्ध",
    "Thinking...": "सोच रहा हूँ...",
    "Ask your coach anything...": "अपने कोच से कुछ भी पूछें...",
    "How do I start learning SQL?": "मैं SQL सीखना कैसे शुरू करूँ?",
    "What are the best free resources?": "सबसे अच्छे मुफ़्त संसाधन कौन से हैं?",
    "How long will it take to get job-ready?": "नौकरी के लिए तैयार होने में कितना समय लगेगा?",
    "Explain Python in simple terms": "Python को सरल शब्दों में समझाइए",
    "How do I practice data analysis?": "मैं डेटा विश्लेषण का अभ्यास कैसे करूँ?",
    "Sorry, I had trouble connecting. Please try again!": "माफ़ कीजिए, कनेक्ट करने में समस्या हुई. कृपया फिर से कोशिश करें!",
    "Your Skill Report": "आपकी कौशल रिपोर्ट",
    "Target role": "लक्षित भूमिका",
    "Ready": "तैयार",
    "Job Readiness Score": "नौकरी तैयारी स्कोर",
    "Focus Areas": "ध्यान देने वाले क्षेत्र",
    "Skill-by-Skill Breakdown": "कौशल-दर-कौशल विवरण",
    "Current": "वर्तमान",
    "Required": "आवश्यक",
    "Gap": "अंतर",
    "to close": "भरने के लिए",
    "high priority": "उच्च प्राथमिकता",
    "medium priority": "मध्यम प्राथमिकता",
    "low priority": "निम्न प्राथमिकता",
    "days done": "दिन पूरे",
    "Week": "सप्ताह",
    "Focus": "ध्यान",
    "Open Resource": "संसाधन खोलें",
    "Resource": "संसाधन",
    "Open your learning platform and search for this topic.": "अपना सीखने वाला प्लेटफ़ॉर्म खोलें और इस विषय को खोजें.",
    "Could not open link": "लिंक नहीं खोला जा सका",
    "Daily Quiz": "दैनिक क्विज़",
    "Task": "कार्य",
    "Great job! That's correct.": "बहुत बढ़िया! यह सही है.",
    "Close": "बंद करें",
    "Mark Day Complete": "दिन पूरा चिह्नित करें",
    "Your Progress": "आपकी प्रगति",
    "Days Done": "दिन पूरे",
    "Day Streak": "लगातार दिन",
    "Path Done": "मार्ग पूरा",
    "Readiness": "तैयारी",
    "Overall Progress": "कुल प्रगति",
    "of": "में से",
    "days completed": "दिन पूरे हुए",
    "Skill Growth Tracker": "कौशल वृद्धि ट्रैकर",
    "Initial": "शुरुआती",
    "Growth": "वृद्धि",
    "Week by Week": "सप्ताह दर सप्ताह",
    "Complete": "पूरा",
    "Achievement Unlocked!": "उपलब्धि अनलॉक!",
    "5-Day Starter - great momentum!": "5-दिवसीय शुरुआत - शानदार गति!",
    "Halfway there - amazing progress!": "आधा सफर पूरा - शानदार प्रगति!",
    "Path Complete! You're job-ready!": "मार्ग पूरा! आप नौकरी के लिए तैयार हैं!",
    "SkillLens v1.0 - Built with ❤️ for India": "SkillLens v1.0 - भारत के लिए ❤️ के साथ बनाया गया",
    "Getting started": "शुरू हो रहा है",
    "Updating language and regenerating content...": "भाषा अपडेट हो रही है और सामग्री फिर से बन रही है...",
    "Tell us more": "हमें और बताइए",
    "Please describe your career goal in a bit more detail.": "कृपया अपने करियर लक्ष्य को थोड़ा और विस्तार से बताएँ.",
    "Analysis Failed": "विश्लेषण विफल",
    "Something went wrong. Please try again.": "कुछ गलत हो गया. कृपया फिर से कोशिश करें.",
    "Analyzing your career goal...": "आपके करियर लक्ष्य का विश्लेषण किया जा रहा है...",
    "Building Week 1 of your learning path...": "आपके सीखने के मार्ग का सप्ताह 1 बनाया जा रहा है...",
    "Saving your profile...": "आपकी प्रोफ़ाइल सहेजी जा रही है...",
    "This takes about 30-40 seconds ☕": "इसमें लगभग 30-40 सेकंड लगते हैं ☕",
    "Missing Info": "जानकारी नहीं मिली",
    "Please enter your email and password.": "कृपया अपना ईमेल और पासवर्ड दर्ज करें.",
    "Login Failed": "लॉगिन विफल",
    "Login failed. Please try again.": "लॉगिन विफल रहा. कृपया फिर से कोशिश करें.",
    "No account found with this email.": "इस ईमेल के साथ कोई खाता नहीं मिला.",
    "Incorrect password. Please try again.": "गलत पासवर्ड. कृपया फिर से कोशिश करें.",
    "Please enter a valid email address.": "कृपया एक वैध ईमेल पता दर्ज करें.",
    "Email or password is incorrect.": "ईमेल या पासवर्ड गलत है.",
    "Too many attempts. Please wait and try again.": "बहुत अधिक प्रयास. कृपया प्रतीक्षा करें और फिर कोशिश करें.",
    "Please fill in all fields.": "कृपया सभी फ़ील्ड भरें.",
    "Weak Password": "कमज़ोर पासवर्ड",
    "Password must be at least 6 characters.": "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए.",
    "Signup Failed": "साइनअप विफल",
    "SkillGrowth Tracker": "कौशल वृद्धि ट्रैकर",
    "Loading...": "लोड हो रहा है...",
  },
};

function getLanguageCode(language) {
  const normalized = String(language || "").trim().toLowerCase();
  const map = {
    english: "en",
    en: "en",
    "हिंदी (hindi)": "hi",
    hindi: "hi",
    "हिंदी": "hi",
    "tamil": "ta",
    "தமிழ் (tamil)": "ta",
    ta: "ta",
    "telugu": "te",
    "తెలుగు (telugu)": "te",
    te: "te",
    "bengali": "bn",
    "বাংলা (bengali)": "bn",
    bn: "bn",
    "marathi": "mr",
    "मराठी (marathi)": "mr",
    mr: "mr",
  };
  return map[normalized] || "en";
}

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
  let translated = [];
  try {
    for (const chunk of chunkArray(uniqueTexts, 20)) {
      translated.push(...await translateBatch(chunk, language));
    }
  } catch (_) {
    translated = uniqueTexts.map((text) => localFallbackTranslate(text, language));
  }

  uniqueMissing.forEach((item, index) => {
    const value = translated[index] ?? localFallbackTranslate(item.text, language);
    translationCache.set(item.cacheKey, value);
  });

  missing.forEach((item) => {
    output[item.index] = translationCache.get(item.cacheKey) ?? localFallbackTranslate(item.text, language);
  });

  return output;
}
