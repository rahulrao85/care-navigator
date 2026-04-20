export async function callGeminiAPI(query, apiKey) {
  if (!apiKey || apiKey.length < 5) {
    throw new Error("No valid API key provided.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("Invalid response format from Gemini API");
  }

  const rawText = data.candidates[0].content.parts[0].text;

  // Strip out markdown codeblock formatting if Gemini included it
  const jsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  
  try {
    const parsedData = JSON.parse(jsonString);
    return {
      text: parsedData.explanation_html,
      specialty: parsedData.target_specialty
    };
  } catch (err) {
    throw new Error("Failed to parse JSON from Gemini API");
  }
}
