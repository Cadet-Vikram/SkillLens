import { GOOGLE_TRANSLATE_KEY } from "../constants/config";

const translationCache = new Map();

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
  if (language === "English" || !GOOGLE_TRANSLATE_KEY) return texts;

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
    throw new Error(`Translation failed: ${await res.text()}`);
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
  if (language === "English" || !GOOGLE_TRANSLATE_KEY) return normalized;

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
