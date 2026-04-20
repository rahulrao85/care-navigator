import './style.css';
import { callGeminiAPI } from './services/api.js';
import { isEmergency, runSimulatedLogic } from './services/triage.js';
import { sanitizeHtml } from './utils/sanitize.js';

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

// Pull API Key from Environment Variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ---- Pill Button Handlers ----
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

// ---- Enter Key to Submit ----
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

async function processQuery(query) {
  // UI transitions
  resultsSection.classList.remove('hidden');
  loading.classList.remove('hidden');
  resultContent.classList.add('hidden');
  actionButtons.classList.add('hidden');
  submitBtn.disabled = true;

  // 1. Emergency Triage Safety Check
  if (isEmergency(query)) {
    const emergencyHtml = `
      <p style="color: var(--error); font-weight: bold;">
        <span class="material-symbols-rounded">gpp_bad</span>
        WARNING: This sounds like a potential medical emergency.
      </p>
      <p>CareNavigator is not a replacement for emergency services. Please call <strong>911</strong> (US) or your local emergency number, or go to your nearest emergency room immediately.</p>
    `;
    
    // SECURITY PATCH: Use DOMPurify before setting innerHTML
    aiResponse.innerHTML = sanitizeHtml(emergencyHtml);
    setupActionButtons("Emergency Room");
    showResults();
    return;
  }

  // 2. Routing logic: Real API vs Simulated
  let aiTextResult = "";
  let targetSpecialty = "General Practitioner";

  if (GEMINI_API_KEY && GEMINI_API_KEY.length > 5) {
    loadingText.textContent = "Processing with Gemini AI...";
    try {
      const { text, specialty } = await callGeminiAPI(query, GEMINI_API_KEY);
      aiTextResult = text;
      targetSpecialty = specialty;
    } catch (err) {
      console.error("API Error, falling back to simulation...", err);
      ({ aiTextResult, targetSpecialty } = runSimulatedLogic(query));
    }
  } else {
    loadingText.textContent = "Running local analysis (demo mode)...";
    await new Promise(resolve => setTimeout(resolve, 1500));
    ({ aiTextResult, targetSpecialty } = runSimulatedLogic(query));
  }

  // SECURITY PATCH: Sanitize HTML output before injection
  aiResponse.innerHTML = sanitizeHtml(aiTextResult);
  setupActionButtons(targetSpecialty);
  showResults();
}

// ---- Dynamically integrate with Google Services ----
function setupActionButtons(specialty) {
  actionButtons.classList.remove('hidden');

  const mapsQuery = encodeURIComponent(`${specialty} near me`);
  googleMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

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
