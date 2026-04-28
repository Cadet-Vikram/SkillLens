import { GROQ_API_KEY } from "../constants/config";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function callGroq(systemPrompt, userPrompt, temperature = 0.2, max_tokens = 1500) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      temperature,
      max_tokens,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function extractJSON(raw) {
  const cleaned = raw.replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON found");
  let depth = 0, end = -1;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    else if (cleaned[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error("Incomplete JSON");
  const jsonStr = cleaned.slice(start, end + 1);
  try { return JSON.parse(jsonStr); }
  catch (_) { return JSON.parse(jsonStr.replace(/,(\s*[}\]])/g, "$1")); }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Step 1: Analyze in English first (no cutoff risk) ───────────────────────
async function analyzeSkillGapsEnglish(userGoal, userName) {
  const system = `You are SkillLens AI. Output ONLY a JSON object, nothing else. No extra text.`;
  const user = `${userName} wants: "${userGoal}".
Return ONLY this JSON (all values in English):
{"jobRole":"job title","summary":"2 short sentences about gap","skills":[{"name":"skill","current":20,"required":80,"gap":60,"priority":"high","description":"why it matters"}],"topGaps":["s1","s2","s3"],"readinessScore":25,"motivationalMessage":"encouraging message"}
Exactly 5 skills. priority = high/medium/low. Numbers = integers 0-100. Keep summary under 120 chars.`;

  const raw = await callGroq(system, user, 0.2, 900);
  return extractJSON(raw);
}

// ─── Step 2: Translate display fields using Google Cloud Translation ──────────
async function translateFields(report, language, googleTranslateKey) {
  if (language === "English" || !googleTranslateKey) return report;

  const TRANSLATE_URL = `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateKey}`;

  // Collect all text that needs translation
  const textsToTranslate = [
    report.jobRole,
    report.summary,
    report.motivationalMessage,
    ...report.topGaps,
    ...report.skills.map(s => s.name),
    ...report.skills.map(s => s.description),
  ];

  try {
    const res = await fetch(TRANSLATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: textsToTranslate,
        source: "en",
        target: getLanguageCode(language),
        format: "text",
      }),
    });

    if (!res.ok) throw new Error("Translation failed");
    const data = await res.json();
    const translated = data.data.translations.map(t => t.translatedText);

    return {
      ...report,
      jobRole: translated[0],
      summary: translated[1],
      motivationalMessage: translated[2],
      topGaps: report.topGaps.map((_, i) => translated[3 + i]),
      skills: report.skills.map((s, i) => ({
        ...s,
        name: translated[3 + report.topGaps.length + i],
        description: translated[3 + report.topGaps.length + report.skills.length + i],
      })),
    };
  } catch (e) {
    console.warn("Translation failed, using English:", e.message);
    return report; // fallback to English if translation fails
  }
}

function getLanguageCode(language) {
  const map = {
    "English": "en", "हिंदी (Hindi)": "hi", "தமிழ் (Tamil)": "ta",
    "తెలుగు (Telugu)": "te", "বাংলা (Bengali)": "bn", "मराठी (Marathi)": "mr",
  };
  return map[language] || "en";
}

// ─── Public: Analyze + Translate ─────────────────────────────────────────────
export async function analyzeSkillGaps(userGoal, userName, language = "English", googleTranslateKey = null) {
  const report = await analyzeSkillGapsEnglish(userGoal, userName);
  return await translateFields(report, language, googleTranslateKey);
}

// ─── Learning Path: one week at a time in English then translate ──────────────
async function generateOneWeek(weekNum, jobRole, topSkills, userName) {
  const system = `You are SkillLens. Output ONLY a JSON object, nothing else.
theme, focus, skill, resource, resourceUrl, resourceType: English only.
title, task, quiz.question, quiz.options: English only (will be translated separately).
resourceType: exactly "video" or "article" or "exercise". answer: integer 0-3. Exactly 5 days.`;

  const user = `Week ${weekNum}, role: ${jobRole}, skills: ${topSkills}, user: ${userName}.
Return ONLY:
{"week":${weekNum},"theme":"theme","focus":"skill","days":[{"day":1,"title":"short title","skill":"skill","duration":"15 mins","resource":"name","resourceUrl":"https://youtube.com/watch?v=dQw4w9WgXcQ","resourceType":"video","task":"what to do","quiz":{"question":"question?","options":["a","b","c","d"],"answer":0}}]}
All 5 days. Real URLs from YouTube, freeCodeCamp, Khan Academy, GeeksforGeeks.`;

  const raw = await callGroq(system, user, 0.2, 1600);
  const parsed = extractJSON(raw);
  if (parsed.week !== undefined && parsed.days) return parsed;
  if (Array.isArray(parsed.weeks)) return parsed.weeks[0];
  throw new Error("Bad week structure");
}

async function translateWeek(week, language, googleTranslateKey) {
  if (language === "English" || !googleTranslateKey) return week;
  const TRANSLATE_URL = `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateKey}`;
  const langCode = getLanguageCode(language);

  const texts = [];
  texts.push(week.theme, week.focus);
  week.days.forEach(d => {
    texts.push(d.title, d.skill, d.resource, d.task, d.quiz.question, ...d.quiz.options);
  });

  try {
    const res = await fetch(TRANSLATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: texts, source: "en", target: langCode, format: "text" }),
    });
    if (!res.ok) return week;
    const data = await res.json();
    const t = data.data.translations.map(x => x.translatedText);

    let idx = 0;
    return {
      ...week,
      theme: t[0],
      focus: t[1],
      days: week.days.map(d => ({
        ...d,
        title: t[idx++],
        skill: t[idx++],
        resource: t[idx++],
        task: t[idx++],
        quiz: {
          ...d.quiz,
          question: t[idx++],
          options: [t[idx++], t[idx++], t[idx++], t[idx++]],
        },
      })),
    };
  } catch (e) {
    console.warn("Week translation failed:", e.message);
    return week;
  }
}

export async function generateLearningPath(jobRole, skills, userName, language = "English", googleTranslateKey = null) {
  const topSkills = skills
    .filter(s => s.priority === "high" || s.priority === "medium")
    .slice(0, 3).map(s => s.name).join(", ");

  const weeks = [];
  for (let w = 1; w <= 4; w++) {
    const week = await generateOneWeek(w, jobRole, topSkills, userName);
    const translated = await translateWeek(week, language, googleTranslateKey);
    weeks.push(translated);
    if (w < 4) await sleep(1000);
  }
  return { weeks };
}

// ─── AI Coach Chat ────────────────────────────────────────────────────────────
export async function chatWithCoach(messages, jobRole, userName, language = "English") {
  const system = `You are SkillLens Coach helping ${userName} become a ${jobRole}.
Reply in ${language}. 2-3 sentences max. Be warm. Only suggest free platforms.`;
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7, max_tokens: 200,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
}

// ─── Quiz Explanation ─────────────────────────────────────────────────────────
export async function generateQuizExplanation(question, userAnswer, correctAnswer, skill) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: `Quiz on ${skill}. Q: "${question}". Student: "${userAnswer}". Correct: "${correctAnswer}". Give 2 friendly sentences explaining the correct answer.` }],
      temperature: 0.5, max_tokens: 150,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
}
