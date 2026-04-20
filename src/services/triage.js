const EMERGENCY_KEYWORDS = [
  "chest pain", "chest tightness", "heart attack", "stroke",
  "can't breathe", "cannot breathe", "trouble breathing", "difficulty breathing",
  "severe", "unconscious", "unresponsive", "seizure", "overdose",
  "suicidal", "suicide", "heavy bleeding", "coughing blood",
  "choking", "anaphylaxis", "allergic reaction"
];

export function isEmergency(query) {
  if (!query) return false;
  const lowerQuery = query.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

export function runSimulatedLogic(query) {
  const lowerQuery = query.toLowerCase();
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
