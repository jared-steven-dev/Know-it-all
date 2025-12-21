document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('language');
    const translateLanguageInput = document.getElementById('translateLanguage');
    const translateModeSelect = document.getElementById('translateMode');
    const summaryTypeSelect = document.getElementById('summaryType');
    const explanationTypeSelect = document.getElementById('explanationType');
    const programmingLanguageInput = document.getElementById('programmingLanguage');
    const geminiApiKeyInput = document.getElementById('geminiApiKey');
    const backButton = document.getElementById('backButton');

    // Back button handler
    backButton.addEventListener('click', () => {
        window.location.href = 'panel.html';
    });

    // Settings change handlers
    const settingsControls = {
        language: languageSelect,
        translateLanguage: translateLanguageInput,
        translateMode: translateModeSelect,
        summaryType: summaryTypeSelect,
        explanationType: explanationTypeSelect,
        programmingLanguage: programmingLanguageInput,
        geminiApiKey: geminiApiKeyInput
    };

    // Add change listeners to all settings controls
    Object.entries(settingsControls).forEach(([key, control]) => {
        control.addEventListener('change', (e) => {
            const settings = { [key]: e.target.value };
            // Save to chrome storage
            chrome.storage.local.set(settings);
        });
    });

    // Load all settings from storage on page load
    chrome.storage.local.get(Object.keys(settingsControls), (result) => {
        Object.entries(result).forEach(([key, value]) => {
            const control = settingsControls[key];
            if (control && value) {
                control.value = value;
            }
        });
    });
});