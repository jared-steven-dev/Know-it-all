chrome.runtime.onInstalled.addListener(() => {
  console.log("Know It All Extension Installed!");
});

// Register the side panel
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSettingsPanel' && request.fromUserClick) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // First open the panel
      chrome.sidePanel.open({tabId: tabs[0].id}).then(() => {
        // Wait a bit for the panel to load
        setTimeout(() => {
          // Try both direct message and tab message
          chrome.runtime.sendMessage({ action: 'navigateToSettings' });
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'navigateToSettings',
            target: 'panel'
          });
        }, 500); // Increased delay to ensure panel is fully loaded
      });
    });
  } else if (request.action === 'openSidePanel') {
    // Set loading state to true
    chrome.storage.local.set({ isLoading: true });
    
    // Store the selected text
    chrome.storage.local.set({
      selectedText: request.text,
      currentFeature: request.feature
    });

    // Process the text based on the feature
    processText(request.text, request.feature)
      .then(response => {
        chrome.storage.local.set({
          explanation: response,
          isLoading: false
        }, () => {
          sendResponse({ success: true }); // Send response after setting storage
        });
      })
      .catch(error => {
        console.error('Error processing text:', error);
        chrome.storage.local.set({
          explanation: 'An error occurred while processing your request. Please try again.',
          isLoading: false
        }, () => {
          sendResponse({ success: false, error: error.message }); // Send response on error
        });
      });

    // Open the side panel
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.sidePanel.open({tabId: tabs[0].id}).then(() => {
        // Notify the panel about the selected feature
        setTimeout(() => {
          chrome.runtime.sendMessage({ 
            action: 'featureSelected',
            feature: request.feature
          });
        }, 500); // Give panel time to load
      });
    });
    
    return true; // Indicates async response
  } else if (request.action === 'navigateToSettings') {
    // Send message to the panel to navigate
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'navigateToSettings' });
    });
  } else if (request.action === 'openSettingsInPanel') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.sidePanel.setOptions({
        tabId: tabs[0].id,
        path: 'settings.html'
      });
      chrome.sidePanel.open({tabId: tabs[0].id});
    });
  } else if (request.action === 'openSettings') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // First set the panel to settings.html
      chrome.sidePanel.setOptions({
        tabId: tabs[0].id,
        path: 'settings.html'
      }).then(() => {
        // Then ensure it's open
        chrome.sidePanel.open({tabId: tabs[0].id});
      });
    });
  }
  return true;
});

async function processText(text, feature) {
  try {
    // No authentication required - free usage with user's own API key

    // For translation, we'll pass the text directly to generateContent
    if (feature === 'translate') {
      const response = await generateContent(text, feature);
      return response;
    }

    // Set the feature and prompt based on the selected feature
    let prompt = '';
    switch(feature) {
      case 'explain':
        prompt = `Please explain this text in detail:\n${text}`;
        break;
      case 'summarize':
        prompt = `Please provide a concise summary of this text:\n${text}`;
        break;
      case 'quiz':
        prompt = `Based on this quiz question and its context, please provide the correct answer with a detailed explanation:\n${text}`;
        break;
      case 'code':
        // Get the selected programming language from settings
        const { programmingLanguage } = await chrome.storage.local.get(['programmingLanguage']);
        const language = programmingLanguage || 'Python'; // Default to Python if not set
        prompt = `Please provide a ${language} solution for this programming problem. Include comments explaining the code:\n${text}`;
        break;
      case 'quote':
        prompt = `Generate an insightful or humorous quote that relates to this text:\n${text}`;
        break;
      default:
        prompt = `Please explain this text:\n${text}`;
    }

    const response = await generateContent(prompt, feature);
    return response;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

// Gemini API integration
async function generateContent(selectedText, feature) {
  try {
    const { 
      preferredLanguage, 
      translateLanguage, 
      summaryType, 
      explanationType, 
      translateMode,
      programmingLanguage,
      geminiApiKey 
    } = await chrome.storage.local.get([
      'preferredLanguage', 
      'translateLanguage', 
      'summaryType', 
      'explanationType', 
      'translateMode',
      'programmingLanguage',
      'geminiApiKey'
    ]);

    // Check if API key is configured
    if (!geminiApiKey) {
      throw new Error('API key not configured. Please add your Gemini API key in Settings.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    let promptText = '';
    
    switch(feature) {
      case 'translate':
        if (translateMode === 'learn') {
          promptText = `Translate the following text to ${translateLanguage || 'English'}. Additionally:
1. Break down the translation word by word
2. Provide pronunciation guide for each word using IPA
3. Add example usage of key phrases
4. Format the response in markdown with:
   - Original text
   - Translation
   - Word-by-word breakdown with pronunciations
   - Example usage section

Text to translate: "${selectedText}"`;
        } else {
          promptText = `Translate the following text to ${translateLanguage || 'English'}:
"${selectedText}"`;
        }
        break;
        
      case 'explain':
        promptText = `Explain the following text. Use the explanation type: ${explanationType || 'detailed'}
Format your response in markdown with these guidelines:
- Use headers for main points
- Use bullet points for key details
- Use code blocks for technical terms
- Use bold for emphasis
- Include a brief summary at the end
${preferredLanguage ? `Provide the response in ${preferredLanguage}` : ''}

Text to explain: "${selectedText}"`;
        break;
        
      case 'code':
        promptText = `Write code to solve the following problem. Follow these guidelines:
- Use clean, well-documented code
- Include necessary imports and dependencies
- Add comments explaining complex logic
- Follow best practices for ${programmingLanguage || 'the most suitable programming language'}
- Include example usage if applicable

Problem: ${selectedText}

Please provide a solution in a markdown code block.`;
        break;
        
      case 'quote':
        promptText = `Generate a witty, insightful, or humorous quote based on the following text. The quote should be:
- Clever and memorable
- Related to the core message or theme
- Written in a style similar to famous quotes
- Include a touch of humor or wisdom
- Keep it concise (1-2 sentences)

Text to quote from: "${selectedText}"

Format the response as a quote with attribution, like this:
"[The quote]" - AI Wisdom`;
        break;
        
      case 'quiz':
        promptText = `Analyze this quiz question and provide a comprehensive solution. Format your response in markdown with:
- The original question
- Available choices (if any)
- The correct answer clearly marked
- A detailed step-by-step explanation of why this is the correct answer
- Key concepts and formulas used (if applicable)
- Additional notes or tips for similar problems

Question: "${selectedText}"`;
        break;
        
      default: // summary
        promptText = `Summarize the following text. Use the summary type: ${summaryType || 'concise'}
Format your response in markdown with these guidelines:
- Use headers for main points
- Use bullet points for key details
- Use code blocks for technical terms
- Use bold for emphasis
- Include a brief summary at the end
${preferredLanguage ? `Provide the response in ${preferredLanguage}` : ''}

Text to summarize: "${selectedText}"`;
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: promptText
        }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error:', error);
    return '### Error\n\nSorry, there was an error processing your request.';
  }
}
