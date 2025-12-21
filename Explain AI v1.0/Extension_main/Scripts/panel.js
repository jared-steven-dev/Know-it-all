// Initialize the panel
function initializePanel() {
  checkApiKeyAndShowContent();
  initializeSettings();
}

// Check if API key is configured and show appropriate content
function checkApiKeyAndShowContent() {
  chrome.storage.local.get(['geminiApiKey', 'selectedText', 'explanation'], (result) => {
    const setupScreen = document.getElementById('setupScreen');
    const instructionScreen = document.getElementById('instructionScreen');
    const selectedTextSection = document.getElementById('selectedTextSection');
    const responseSection = document.getElementById('responseSection');
    
    if (!result.geminiApiKey || result.geminiApiKey.trim() === '') {
      // No API key configured - show setup screen
      if (setupScreen) setupScreen.classList.add('show');
      if (instructionScreen) instructionScreen.classList.remove('show');
      if (selectedTextSection) selectedTextSection.style.display = 'none';
      if (responseSection) responseSection.style.display = 'none';
      
      // Add click handler for setup button
      const setupButton = document.getElementById('setupButton');
      if (setupButton) {
        setupButton.addEventListener('click', () => {
          window.location.href = 'settings.html';
        });
      }
    } else if (!result.selectedText && !result.explanation) {
      // API key configured but no content yet - show instruction screen
      if (setupScreen) setupScreen.classList.remove('show');
      if (instructionScreen) instructionScreen.classList.add('show');
      if (selectedTextSection) selectedTextSection.style.display = 'none';
      if (responseSection) responseSection.style.display = 'none';
      
      // Initialize content section for storage listeners
      initializeContentSection();
    } else {
      // API key configured and content exists - show normal content
      if (setupScreen) setupScreen.classList.remove('show');
      if (instructionScreen) instructionScreen.classList.remove('show');
      if (selectedTextSection) selectedTextSection.style.display = 'block';
      if (responseSection) responseSection.style.display = 'block';
      
      // Initialize content section
      initializeContentSection();
    }
  });
}

// Separate function to handle content section
function initializeContentSection() {
  const selectedTextElement = document.getElementById('selectedText');
  const explanationElement = document.getElementById('explanation');
  const loadingElement = document.getElementById('loading');
  const responseTitleElement = document.getElementById('responseTitle');
  const featureButtons = {
    explain: document.getElementById('explainButton'),
    summarize: document.getElementById('summarizeButton'),
    translate: document.getElementById('translateButton'),
    code: document.getElementById('codeButton'),
    quote: document.getElementById('quoteButton'),
    quiz: document.getElementById('quizButton')
  };

  // Configure marked options for security and formatting
  marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
  });

  // Load content from storage
  chrome.storage.local.get(['selectedText', 'explanation', 'currentFeature', 'isLoading'], (result) => {
    if (selectedTextElement && result.selectedText) {
      selectedTextElement.textContent = result.selectedText;
    }
    
    if (explanationElement && result.explanation) {
      renderMarkdownContent(result.explanation, explanationElement);
    }

    // Show/hide loading based on state
    if (loadingElement && explanationElement) {
      if (result.isLoading) {
        loadingElement.style.display = 'flex';
        explanationElement.style.display = 'none';
      } else {
        loadingElement.style.display = 'none';
        explanationElement.style.display = 'block';
      }
    }

    // Update UI based on the current feature
    updateFeatureUI(result.currentFeature);
  });

  // Listen for content updates
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.selectedText && selectedTextElement) {
      selectedTextElement.textContent = changes.selectedText.newValue;
      // Hide instruction screen when text is selected
      const instructionScreen = document.getElementById('instructionScreen');
      const selectedTextSection = document.getElementById('selectedTextSection');
      const responseSection = document.getElementById('responseSection');
      if (changes.selectedText.newValue && instructionScreen) {
        instructionScreen.classList.remove('show');
        if (selectedTextSection) selectedTextSection.style.display = 'block';
        if (responseSection) responseSection.style.display = 'block';
      }
    }
    if (changes.explanation && explanationElement) {
      renderMarkdownContent(changes.explanation.newValue, explanationElement);
    }
    if (changes.isLoading && loadingElement && explanationElement) {
      if (changes.isLoading.newValue) {
        loadingElement.style.display = 'flex';
        explanationElement.style.display = 'none';
      } else {
        loadingElement.style.display = 'none';
        explanationElement.style.display = 'block';
      }
    }
    if (changes.currentFeature) {
      updateFeatureUI(changes.currentFeature.newValue);
    }
  });
}

// Helper function to update UI based on the current feature
function updateFeatureUI(feature) {
  const responseTitleElement = document.getElementById('responseTitle');
  const titles = {
    explain: 'Explanation',
    summarize: 'Summary',
    translate: 'Translation',
    code: 'Code Solution',
    quote: 'Quote',
    quiz: 'Quiz Solution'
  };
  if (!responseTitleElement) return;
  
  switch(feature) {
    case 'explain':
      responseTitleElement.textContent = titles.explain;
      break;
    case 'summarize':
      responseTitleElement.textContent = titles.summarize;
      break;
    case 'translate':
      responseTitleElement.textContent = titles.translate;
      break;
    case 'code':
      responseTitleElement.textContent = titles.code;
      break;
    case 'quote':
      responseTitleElement.textContent = titles.quote;
      break;
    case 'quiz':
      responseTitleElement.textContent = titles.quiz;
      break;
    default:
      responseTitleElement.textContent = 'Response';
  }
}

// Helper function to safely render markdown content
function renderMarkdownContent(markdown, element) {
  if (!element || !markdown) return;

  try {
    // Convert markdown to HTML
    const rawHtml = marked.parse(markdown);
    
    // Sanitize HTML
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    
    // Set the content
    element.innerHTML = cleanHtml;

    // Process code blocks
    const codeBlocks = element.querySelectorAll('pre code');
    codeBlocks.forEach((codeBlock, index) => {
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.innerHTML = '<i class="material-icons">content_copy</i>';
      copyButton.title = 'Copy code';
      
      // Add copy functionality
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeBlock.textContent);
          copyButton.innerHTML = '<i class="material-icons">check</i>';
          copyButton.classList.add('copy-success');
          
          // Reset button after 2 seconds
          setTimeout(() => {
            copyButton.innerHTML = '<i class="material-icons">content_copy</i>';
            copyButton.classList.remove('copy-success');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code:', err);
          copyButton.innerHTML = '<i class="material-icons">error</i>';
          setTimeout(() => {
            copyButton.innerHTML = '<i class="material-icons">content_copy</i>';
          }, 2000);
        }
      });

      // Wrap the code block
      const pre = codeBlock.parentNode;
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(copyButton);
    });
  } catch (error) {
    console.error('Error rendering markdown:', error);
    element.innerHTML = '<p class="error">Error rendering content. Please try again.</p>';
  }
}

// Settings handling - simplified, just navigate to settings page
function initializeSettings() {
  const settingsBtn = document.getElementById('settingsButton');

  if (!settingsBtn) {
    console.error('Settings button not found');
    return;
  }

  // Navigate to settings page
  settingsBtn.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Panel received message:', request);
  if (request.action === 'navigateToSettings') {
    console.log('Navigating to settings.html');
    window.location.href = 'settings.html';
  } else if (request.action === 'featureSelected') {
    // Update UI for the selected feature
    if (request.feature) {
      updateFeatureUI(request.feature);
    }
  } else if (request.action === 'apiKeyUpdated') {
    // Re-check API key status when it's updated
    checkApiKeyAndShowContent();
  }
});

// Also listen for messages in the window context
window.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'navigateToSettings') {
    window.location.href = 'settings.html';
  } else if (event.data && event.data.action === 'featureSelected') {
    if (event.data.feature) {
      updateFeatureUI(event.data.feature);
    }
  } else if (event.data && event.data.action === 'apiKeyUpdated') {
    checkApiKeyAndShowContent();
  }
});

// Listen for storage changes to detect API key updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.geminiApiKey || changes.selectedText || changes.explanation) {
    checkApiKeyAndShowContent();
  }
});

document.addEventListener('DOMContentLoaded', initializePanel);