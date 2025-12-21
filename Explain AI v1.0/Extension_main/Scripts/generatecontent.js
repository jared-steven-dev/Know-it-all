// This script sends a POST request to the Gemini API to generate content
// NOTE: This is a test script. The main extension uses background.js which fetches the API key from settings.

// API key is now configured in the extension settings
const apiKey = ''; // Set via extension settings
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

// Request payload
const payload = {
    contents: [
        {
            parts: [
                { text: "Explain how AI works" }
            ]
        }
    ]
};

// Function to send the request
async function generateContent() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract and log the text from the "parts" array
        const textParts = data.candidates.map(candidate =>
            candidate.content.parts.map(part => part.text).join('\n')
        );

        console.log('Generated Text:', textParts.join('\n\n'));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the function
generateContent();
