# CareNavigator - PromptWars Submission

## The Chosen Vertical 🏥
**Healthcare**

## Approach and Logic 🤖
CareNavigator is a "Smart Healthcare Triage & Organization Assistant." It addresses the overwhelming nature of navigating healthcare by doing three things:
1. **Medical Translation**: Uses AI logic to translate complex medical jargon or lab results into plain, easy-to-understand English.
2. **Specialist Actioning**: Intelligently identifies what type of doctor the user needs based on their query and seamlessly integrates with **Google Maps** to locate the nearest relevant specialist.
3. **Appointment Management**: Generates dynamic **Google Calendar** integration links to help the user schedule and remember their follow-ups.

## How the Solution Works ⚙️
* The app is a lightweight, responsive Web App (HTML/CSS/JS) ensuring the repo stays well under 1MB.
* **UI/UX**: It features a calming, accessible design (high contrast, readable fonts) to accommodate elderly or visually impaired users (hitting the *Accessibility* evaluation criteria).
* **Security & Responsibility**: The assistant enforces strict disclaimers stating it is not a medical professional. All input data is processed locally/temporarily in the browser without being stored in a database, ensuring PHI (Personal Health Information) privacy.
* **Google Services**: Meaningfully integrates **Google Maps (Location mapping)** and **Google Calendar (Event scheduling)**. 

## Assumptions Made 🤔
* It is assumed the user has a Google Account (for the Calendar integration to work).
* It is assumed the user will share their location with their browser for the 'near me' Maps functionality to be accurate.
* This prototype supports a real Gemini API key via `VITE_GEMINI_API_KEY` in `.env`. The fallback simulation covers 10 medical specialties for demo purposes.

## Security Note 🔒
* **API Key**: In this browser prototype, the Gemini API key is loaded client-side via Vite's env system. In a production deployment, this would be proxied through a secure backend (e.g., a serverless function) to prevent client-side key exposure. This is a known and intentional trade-off for this prototype's simplicity.
* **Privacy**: No user-entered health data is transmitted to any third-party server other than the Google Gemini API (when a key is provided). All fallback logic runs entirely in the browser.
