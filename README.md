# Know It All - Chrome Extension

A powerful AI-powered Chrome extension that provides instant explanations, translations, and summaries for any text you highlight on the web.

## Features

-  **Instant Explanations**: Highlight any text and get AI-powered explanations
-  **Translation Support**: Translate text into multiple languages
-  **Smart Summaries**: Get concise summaries of long articles or content
-  **Code Support**: Works with code snippets and technical content
-  **Fast & Intuitive**: Simple highlight-and-click interface
-  **Modern UI**: Beautiful, user-friendly design with smooth animations

## Installation Guide

### Method 1: Load Unpacked Extension (Developer Mode)

Follow these steps to install the extension in your Chrome browser:

#### Step 1: Download the Extension
1. Download or clone this repository to your local machine
2. Extract the files if downloaded as a ZIP
3. Note the location of the `Explain AI v1.0` folder

#### Step 2: Open Chrome Extensions Page
1. Open Google Chrome browser
2. Click the three-dot menu (⋮) in the top-right corner
3. Navigate to **More Tools** → **Extensions**
   
   *Alternatively, you can type `chrome://extensions/` in the address bar and press Enter*

#### Step 3: Enable Developer Mode
1. On the Extensions page, look for the **Developer mode** toggle in the top-right corner
2. Click the toggle to turn **ON** Developer mode
3. You should now see additional buttons appear (Load unpacked, Pack extension, Update)

#### Step 4: Load the Extension
1. Click the **Load unpacked** button
2. A file browser window will open
3. Navigate to and select the `Explain AI v1.0` folder (the folder containing `popup.html`, `panel.html`, and the `Scripts` folder)
4. Click **Select Folder** (or **Open** on some systems)

#### Step 5: Verify Installation
1. The extension should now appear in your extensions list
2. You should see "Know It All" with its icon
3. Make sure the extension is **enabled** (toggle switch should be blue/on)

#### Step 6: Pin the Extension (Optional but Recommended)
1. Click the puzzle piece icon (🧩) in the Chrome toolbar
2. Find "Know It All" in the list
3. Click the pin icon (📌) next to it
4. The extension icon will now appear in your toolbar for easy access

## How to Use

### Basic Usage

1. **Navigate to any webpage** with text content
2. **Highlight/Select** the text you want to understand
3. **Click the AI icon** that appears near your selection
4. **View the response** in the side panel that opens

### Features You Can Use

- **Explain**: Get detailed explanations of complex concepts
- **Translate**: Convert text to different languages
- **Summarize**: Get concise summaries of long content
- **Code Analysis**: Understand code snippets and programming concepts

### Accessing Settings

1. Click the extension icon in your Chrome toolbar
2. Or click the settings gear icon (⚙️) in the side panel
3. Configure your preferences and API settings

## Configuration

### API Setup

This extension requires an API key to function. To set up:

1. Open the extension settings
2. Enter your API key in the designated field
3. Save your settings

*Note: Make sure you have a valid API key from your AI service provider*

## Troubleshooting

### Extension Not Loading
- Make sure Developer mode is enabled
- Verify you selected the correct folder containing all extension files
- Check the Chrome console for any error messages

### AI Not Responding
- Verify your API key is correctly configured in settings
- Check your internet connection
- Ensure you have sufficient API credits/quota

### Icon Not Appearing When Selecting Text
- Refresh the webpage after installing the extension
- Make sure the extension is enabled
- Try disabling and re-enabling the extension

### Extension Disappeared After Chrome Restart
- This is normal for unpacked extensions
- Simply re-enable it from `chrome://extensions/`
- For permanent installation, consider publishing to Chrome Web Store

## File Structure

```
Extension_main/
├── Images/              # Extension icons and images
├── Scripts/             # JavaScript files
│   ├── background.js    # Background service worker
│   ├── side_content.js  # Content script for text selection
│   ├── panel.js         # Side panel functionality
│   ├── settings.js      # Settings page logic
│   └── ...
├── Styles/              # CSS stylesheets
├── popup.html           # Extension popup interface
├── panel.html           # Side panel interface
├── settings.html        # Settings page
└── README.md           # This file
```

## Browser Compatibility

-  Google Chrome (Recommended)
-  Microsoft Edge (Chromium-based)
-  Brave Browser
-  Other Chromium-based browsers

## Privacy & Security

- Your selected text is processed through the configured AI service
- API keys are stored locally in your browser
- No data is collected or stored by the extension itself

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Verify all files are properly installed
3. Check browser console for error messages
4. Ensure your API credentials are valid

## Updates

To update the extension:
1. Download the latest version
2. Go to `chrome://extensions/`
3. Click the refresh icon (🔄) on the extension card
   
   *Or remove the old version and load the new one following the installation steps*

## Tips for Best Experience

-  Pin the extension to your toolbar for quick access
-  Keep the extension updated for the latest features
-  Configure your preferred settings before first use
-  Works best with clear, well-formatted text selections

---

**Enjoy using Know It All! **

For the best experience, make sure to configure your API settings before using the extension.
