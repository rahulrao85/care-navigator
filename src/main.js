import './style.css'

// Accessibility: Text Resizer
const fontSizeBtn = document.getElementById('fontSizeBtn');
fontSizeBtn.addEventListener('click', () => {
  document.body.classList.toggle('large-text');
});

// UI Elements
const submitBtn = document.getElementById('submitBtn');
const userInput = document.getElementById('userInput');
const pillBtns = document.querySelectorAll('.pill-btn');
const askAgainBtn = document.getElementById('askAgainBtn');

const resultsSection = document.getElementById('resultsSection');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const resultContent = document.getElementById('resultContent');
const aiResponse = document.getElementById('aiResponse');
const actionButtons = document.getElementById('actionButtons');

const googleMapsLink = document.getElementById('googleMapsLink');
const googleCalendarLink = document.getElementById('googleCalendarLink');

// Pull API Key from Environment Variables (if provided)
// NOTE: In production, this key should be proxied through a secure backend
// to prevent client-side exposure. This is a browser prototype for demonstration.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ---- Pill Button Handlers (auto-fire query on click) ----
pillBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const query = btn.getAttribute('data-query');
    userInput.value = query;
    userInput.focus();
    processQuery(query);
  });
});

// ---- Main Submit Handler ----
submitBtn.addEventListener('click', () => {
  const query = userInput.value.trim();
  if (!query) {
    alert("Please enter your symptoms or medical text first.");
    return;
  }
  processQuery(query);
});

// ---- Enter Key to Submit (Shift+Enter for newline) ----
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const query = userInput.value.trim();
    if (query) processQuery(query);
  }
});

// ---- Ask Again / Reset ----
askAgainBtn.addEventListener('click', () => {
  resultsSection.classList.add('hidden');
  resultContent.classList.add('hidden');
  actionButtons.classList.add('hidden');
  userInput.value = '';
  userInput.focus();
});

// ---- Expanded Emergency Keywords ----
const EMERGENCY_KEYWORDS = [
  "chest pain", "chest tightness", "heart attack", "stroke",
  "can't breathe", "cannot breathe", "trouble breathing", "difficulty breathing",
  "severe", "unconscious", "unresponsive", "seizure", "overdose",
  "suicidal", "suicide", "heavy bleeding", "coughing blood",
  "choking", "anaphylaxis", "allergic reaction"
];

function isEmergency(query) {
  return EMERGENCY_KEYWORDS.some(keyword => query.includes(keyword));
}

async function processQuery(query) {
  // UI transitions
  resultsSection.classList.remove('hidden');
  loading.classList.remove('hidden');
  resultContent.classList.add('hidden');
  actionButtons.classList.add('hidden');
  submitBtn.disabled = true;

  const lowerQuery = query.toLowerCase();

  // 1. Emergency Triage Safety Check (Runs locally and immediately)
  if (isEmergency(lowerQuery)) {
    aiResponse.innerHTML = `
      <p style="color: var(--error); font-weight: bold;">
        <span class="material-symbols-rounded">gpp_bad</span>
        WARNING: This sounds like a potential medical emergency.
      </p>
      <p>CareNavigator is not a replacement for emergency services. Please call <strong>911</strong> (US) or your local emergency number, or go to your nearest emergency room immediately.</p>
    `;
    setupActionButtons("Emergency Room");
    showResults();
    return;
  }

  // 2. Routing logic: Use Real Gemini if key exists, otherwise fallback to local Demo logic
  let aiTextResult = "";
  let targetSpecialty = "General Practitioner";

  if (GEMINI_API_KEY && GEMINI_API_KEY.length > 5) {
    loadingText.textContent = "Processing with Gemini AI...";
    try {
      const { text, specialty } = await callGeminiAPI(query);
      aiTextResult = text;
      targetSpecialty = specialty;
    } catch (err) {
      console.error("Gemini API Error, falling back to simulation...", err);
      ({ aiTextResult, targetSpecialty } = runSimulatedLogic(lowerQuery));
    }
  } else {
    loadingText.textContent = "Running local analysis (demo mode)...";
    // Artificial delay to simulate network feeling
    await new Promise(resolve => setTimeout(resolve, 1500));
    ({ aiTextResult, targetSpecialty } = runSimulatedLogic(lowerQuery));
  }

  // Format the output
  aiResponse.innerHTML = aiTextResult;
  setupActionButtons(targetSpecialty);
  showResults();
}

// ---- Real Gemini API Integration ----
async function callGeminiAPI(query) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Prompt engineering to force Gemini to return JSON
  const systemPrompt = `
    You are a medical vocabulary translator and triage assistant.
    Analyze the user's input safely. Do NOT diagnose.
    Instead, explain any medical jargon clearly, and determine exactly what singular medical SPECIALTY (e.g. "Cardiologist", "Dentist", "Gastroenterologist") they should search for.
    You MUST return your answer in valid JSON format ONLY, perfectly matching this schema:
    {
      "explanation_html": "<p>Your clear explanation of their symptoms or the terms, using basic html formatting like <strong> where appropriate.</p><p><strong>Next Step:</strong> Your advice on seeking care.</p>",
      "target_specialty": "The single medical specialist name"
    }
  `;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: systemPrompt }, { text: "User Input: " + query }]
      }]
    })
  });

  if (!response.ok) throw new Error("Network response was not ok");

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;

  // Strip out markdown codeblock formatting if Gemini included it
  const jsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsedData = JSON.parse(jsonString);

  return {
    text: parsedData.explanation_html,
    specialty: parsedData.target_specialty
  };
}

// ---- Simulated Local Fallback Logic (expanded) ----
function runSimulatedLogic(lowerQuery) {
  let text = "";
  let specialty = "General Practitioner";

  // Lab results
  if (lowerQuery.includes("lab result") || lowerQuery.includes("leukocytosis") || lowerQuery.includes("blood test")) {
    text = `
      <p><strong>Translation (Demo):</strong> "Mild leukocytosis with left shift" means your white blood cell count is slightly elevated, and there are some immature cells present.</p>
      <p><strong>What it implies:</strong> This often signals a mild infection, inflammation, or stress response.</p>
      <p><strong>Next Step:</strong> Follow up with your primary care physician to interpret results in the context of your full health history.</p>
    `;
    specialty = "Primary Care Physician";

  // Digestive
  } else if (lowerQuery.includes("stomach") || lowerQuery.includes("abdomen") || lowerQuery.includes("bloating") || lowerQuery.includes("diarrhea") || lowerQuery.includes("constipation") || lowerQuery.includes("nausea")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Digestive symptoms like abdominal discomfort, bloating, or nausea can be caused by dietary issues, infections, IBS, or other GI conditions.</p>
      <p><strong>Next Step:</strong> A Gastroenterologist specializes in the digestive system. Seek care if symptoms persist more than a few days.</p>
    `;
    specialty = "Gastroenterologist";

  // Dental
  } else if (lowerQuery.includes("dentist") || lowerQuery.includes("tooth") || lowerQuery.includes("gum") || lowerQuery.includes("cavity") || lowerQuery.includes("jaw pain")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Dental pain, sensitivity, or gum issues require professional evaluation. Untreated dental conditions can worsen quickly.</p>
      <p><strong>Next Step:</strong> Schedule an appointment with a Dentist or Orthodontist as soon as possible.</p>
    `;
    specialty = "Dentist";

  // Cardiac / Heart
  } else if (lowerQuery.includes("heart") || lowerQuery.includes("palpitation") || lowerQuery.includes("irregular heartbeat") || lowerQuery.includes("hypertension") || lowerQuery.includes("blood pressure")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Heart palpitations, high blood pressure, or irregular heartbeat are cardiovascular symptoms that shouldn't be ignored.</p>
      <p><strong>Next Step:</strong> A Cardiologist can perform an ECG and other tests to identify any underlying heart conditions.</p>
    `;
    specialty = "Cardiologist";

  // Mental Health
  } else if (lowerQuery.includes("anxiety") || lowerQuery.includes("depression") || lowerQuery.includes("mental health") || lowerQuery.includes("stress") || lowerQuery.includes("panic attack") || lowerQuery.includes("insomnia")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Mental health symptoms like persistent anxiety, low mood, or sleep problems are real medical concerns that respond well to treatment.</p>
      <p><strong>Next Step:</strong> A Psychiatrist or licensed therapist can provide a proper evaluation and support. You are not alone.</p>
    `;
    specialty = "Psychiatrist";

  // Skin / Dermatology
  } else if (lowerQuery.includes("skin") || lowerQuery.includes("rash") || lowerQuery.includes("acne") || lowerQuery.includes("eczema") || lowerQuery.includes("mole") || lowerQuery.includes("itching")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Skin conditions range from mild (acne, dryness) to conditions requiring prompt attention (rapidly changing moles, widespread rashes).</p>
      <p><strong>Next Step:</strong> A Dermatologist can diagnose and treat skin, hair, and nail conditions effectively.</p>
    `;
    specialty = "Dermatologist";

  // Eyes / Vision
  } else if (lowerQuery.includes("eye") || lowerQuery.includes("vision") || lowerQuery.includes("blurry") || lowerQuery.includes("redness in eye") || lowerQuery.includes("glasses")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Changes in vision, eye redness, or pain in the eye should be evaluated promptly, as some conditions can worsen without treatment.</p>
      <p><strong>Next Step:</strong> An Ophthalmologist (eye doctor) can perform a full eye exam and screen for conditions like glaucoma or retinal issues.</p>
    `;
    specialty = "Ophthalmologist";

  // Respiratory
  } else if (lowerQuery.includes("cough") || lowerQuery.includes("asthma") || lowerQuery.includes("wheeze") || lowerQuery.includes("shortness of breath") || lowerQuery.includes("lung") || lowerQuery.includes("pneumonia")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Persistent cough, wheezing, or shortness of breath may indicate respiratory conditions such as asthma, bronchitis, or an infection.</p>
      <p><strong>Next Step:</strong> A Pulmonologist (lung specialist) can assess your breathing and run pulmonary function tests if needed.</p>
    `;
    specialty = "Pulmonologist";

  // Bone / Joint / Ortho
  } else if (lowerQuery.includes("bone") || lowerQuery.includes("joint") || lowerQuery.includes("knee") || lowerQuery.includes("back pain") || lowerQuery.includes("spine") || lowerQuery.includes("fracture") || lowerQuery.includes("arthritis")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Bone, joint, or musculoskeletal pain can stem from injury, inflammation, or chronic conditions like arthritis.</p>
      <p><strong>Next Step:</strong> An Orthopedic Surgeon or Rheumatologist can evaluate your mobility and imaging to suggest treatment options.</p>
    `;
    specialty = "Orthopedic Surgeon";

  // Neurology
  } else if (lowerQuery.includes("headache") || lowerQuery.includes("migraine") || lowerQuery.includes("dizziness") || lowerQuery.includes("numbness") || lowerQuery.includes("memory") || lowerQuery.includes("nerve")) {
    text = `
      <p><strong>Analysis (Demo):</strong> Recurring headaches, numbness, dizziness, or memory concerns can be neurological in origin and deserve a professional evaluation.</p>
      <p><strong>Next Step:</strong> A Neurologist can assess brain and nervous system health and rule out serious conditions.</p>
    `;
    specialty = "Neurologist";

  // Generic fallback
  } else {
    text = `
      <p><strong>Analysis (Demo):</strong> Based on what you shared, this may require a general health evaluation to determine the right course of action.</p>
      <p><strong>Next Step:</strong> A General Practitioner or Walk-in Clinic is a great first point of contact. They can refer you to a specialist if needed.</p>
    `;
    specialty = "General Practitioner";
  }

  return { aiTextResult: text, targetSpecialty: specialty };
}

// ---- Dynamically integrate with Google Services ----
function setupActionButtons(specialty) {
  actionButtons.classList.remove('hidden');

  // 1. Google Maps Integration
  const mapsQuery = encodeURIComponent(`${specialty} near me`);
  googleMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // 2. Google Calendar Integration
  const eventTitle = encodeURIComponent(`Consultation: ${specialty}`);
  const eventDetails = encodeURIComponent(`Remember to bring any relevant medical records and your ID. CareNavigator generated this reminder.`);
  googleCalendarLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}`;
}

// ---- Transition UI state ----
function showResults() {
  loading.classList.add('hidden');
  resultContent.classList.remove('hidden');
  submitBtn.disabled = false;
}
