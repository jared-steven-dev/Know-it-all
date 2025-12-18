(function() {
    // State management
    let iconElement = null;
    let currentSelection = '';
    let isIconVisible = false;

    // Configuration
    const ICON_SIZE = 24; // pixels
    const ICON_OFFSET = 8; // pixels from selection
    const MIN_SELECTION_LENGTH = 3;
    
    // Get the icon URL when the script loads
    let iconURL = '';
    try {
        iconURL = chrome.runtime.getURL('./Extension_main/Scripts/icon.png');
    } catch (error) {
        console.error('Failed to get icon URL:', error);
        return; // Exit if we can't get the icon URL
    }

    function createIcon() {
        try {
            const icon = document.createElement('img');
            icon.src = iconURL;
            icon.style.cssText = `
                position: absolute;
                width: ${ICON_SIZE}px;
                height: ${ICON_SIZE}px;
                cursor: pointer;
                z-index: 2147483647;
                display: none;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                transition: transform 0.2s ease, opacity 0.2s ease;
                user-select: none;
                -webkit-user-select: none;
                opacity: 0;
            `;
            
            icon.addEventListener('mouseover', () => {
                icon.style.transform = 'scale(1.1)';
            });
            
            icon.addEventListener('mouseout', () => {
                icon.style.transform = 'scale(1)';
            });
            
            icon.addEventListener('click', handleIconClick);
            
            document.body.appendChild(icon);
            return icon;
        } catch (error) {
            console.error('Failed to create icon:', error);
            return null;
        }
    }

    function handleIconClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Create and show popup menu
        const popup = document.createElement('div');
        popup.className = 'ai-explainer-popup';
        popup.innerHTML = `
            <div class="popup-header">
                <img src="${iconURL}" alt="AI Explainer" class="popup-logo">
                <div class="popup-controls">
                    <button class="settings-btn">
                        <img src="${chrome.runtime.getURL('./Extension_main/Scripts/settings.png')}" alt="Settings" style="width: 40px; height: 40px; display: block;">
                    </button>
                    <button class="close-btn">
                        <img src="${chrome.runtime.getURL('./Extension_main/Scripts/close.png')}" alt="Close" style="width: 40px; height: 40px; display: block;">
                    </button>
                </div>
            </div>
            <div class="popup-content">
                <button class="feature-btn" data-feature="explain">Explain It</button>
                <button class="feature-btn" data-feature="summarize">Summarize It</button>
                <button class="feature-btn" data-feature="quiz">Solve This Quiz</button>
                <button class="feature-btn" data-feature="code">Coding Assistant</button>
                <button class="feature-btn" data-feature="quote">Generate Quote</button>
                <button class="feature-btn" data-feature="translate">Translate</button>
            </div>
        `;
        
        // Add styles for the popup
        const style = document.createElement('style');
        style.textContent = `
            .ai-explainer-popup {
                position: fixed;
                background: #002c66;
                color: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 2147483647;
                width: 280px;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .popup-logo {
                height: 32px;
                width: auto;
            }
            
            .popup-controls {
                display: flex;
                gap: 8px;
            }
            
            .popup-controls button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }
            
            .popup-controls button:hover {
                background: rgba(255,255,255,0.1);
            }
            
            .feature-btn {
                display: block;
                width: 100%;
                padding: 12px;
                margin: 8px 0;
                background: rgba(255,255,255,0.1);
                border: 2px solid #feda15;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }
            
            .feature-btn:hover {
                background: #feda15;
                color: #002c66;
            }
        `;
        
        document.head.appendChild(style);
        
        // Position the popup near the icon while ensuring it stays within viewport
        const iconRect = e.target.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate initial position
        let left = iconRect.left;
        let top = iconRect.bottom + 10;
        
        // Check if popup would go off the right edge
        if (left + 280 > viewportWidth) { // 280px is popup width
            left = viewportWidth - 290; // Leave 10px margin
        }
        
        // Check if popup would go off the left edge
        if (left < 10) {
            left = 10; // Leave 10px margin
        }
        
        // Check if popup would go off the bottom edge
        if (top + 300 > viewportHeight) { // Approximate popup height
            // Position above the icon instead
            top = Math.max(10, iconRect.top - 310); // Leave 10px margin at top
        }
        
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
        document.body.appendChild(popup);

        // Add click handlers for feature buttons
        popup.querySelectorAll('.feature-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const feature = button.dataset.feature;
                // Remove popup and hide icon before sending message
                if (popup && popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
                if (style && style.parentNode) {
                    style.parentNode.removeChild(style);
                }
                hideIcon();
                
                try {
                    // Send message to background script
                    await chrome.runtime.sendMessage({
                        action: 'openSidePanel',
                        feature: feature,
                        text: currentSelection
                    });
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            });
        });

        // Add click handler for close button
        popup.querySelector('.close-btn').addEventListener('click', () => {
            if (popup && popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
            if (style && style.parentNode) {
                style.parentNode.removeChild(style);
            }
        });

        // Add click handler for settings button
        popup.querySelector('.settings-btn').addEventListener('click', () => {
            // Send message to background script to handle panel opening
            chrome.runtime.sendMessage({ 
                action: 'openSettingsPanel',
                fromUserClick: true
            });
            if (popup && popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
            if (style && style.parentNode) {
                style.parentNode.removeChild(style);
            }
        });
        
        // Close popup when clicking outside
        const closePopup = (e) => {
            if (!popup.contains(e.target) && e.target !== iconElement) {
                if (popup && popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
                if (style && style.parentNode) {
                    style.parentNode.removeChild(style);
                }
                document.removeEventListener('click', closePopup);
            }
        };
        
        document.addEventListener('click', closePopup);
    }

    function getSelectionCoordinates(selection) {
        try {
            const range = selection.getRangeAt(0);
            const rects = range.getClientRects();
            
            // Get the last rect (end of selection)
            const lastRect = rects[rects.length - 1];
            
            if (!lastRect) {
                const fallbackRect = range.getBoundingClientRect();
                return {
                    left: fallbackRect.right,
                    top: fallbackRect.top + (fallbackRect.height / 2)
                };
            }
            
            return {
                left: lastRect.right,
                top: lastRect.top + (lastRect.height / 2)
            };
        } catch (error) {
            console.error('Error getting selection coordinates:', error);
            return null;
        }
    }

    function calculateIconPosition(selection) {
        try {
            const coords = getSelectionCoordinates(selection);
            if (!coords) return null;

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let left = coords.left + ICON_OFFSET;
            let top = coords.top - (ICON_SIZE / 2);

            // Adjust if icon would be off screen
            if (left + ICON_SIZE + ICON_OFFSET > viewportWidth) {
                left = coords.left - ICON_SIZE - ICON_OFFSET;
            }

            if (top < ICON_OFFSET) {
                top = ICON_OFFSET;
            } else if (top + ICON_SIZE + ICON_OFFSET > viewportHeight) {
                top = viewportHeight - ICON_SIZE - ICON_OFFSET;
            }

            // Convert viewport coordinates to document coordinates
            return {
                left: left + window.pageXOffset,
                top: top + window.pageYOffset
            };
        } catch (error) {
            console.error('Error calculating icon position:', error);
            return null;
        }
    }

    function showIconWithAnimation(left, top) {
        if (!iconElement || left === null || top === null) return;
        
        // Reset any existing transitions
        iconElement.style.transition = 'none';
        iconElement.style.opacity = '0';
        
        // Position the icon
        iconElement.style.position = 'absolute';
        iconElement.style.left = `${left}px`;
        iconElement.style.top = `${top}px`;
        iconElement.style.display = 'block';
        
        // Enable smooth animation
        requestAnimationFrame(() => {
            iconElement.style.transition = 'opacity 0.2s ease';
            iconElement.style.opacity = '1';
        });
        
        isIconVisible = true;
    }

    function positionIcon(selection) {
        if (!iconElement) {
            iconElement = createIcon();
        }

        if (!iconElement) return;

        try {
            const position = calculateIconPosition(selection);
            if (position) {
                showIconWithAnimation(position.left, position.top);
            }
        } catch (error) {
            console.error('Error positioning icon:', error);
            hideIcon();
        }
    }

    function hideIcon() {
        if (iconElement) {
            iconElement.style.opacity = '0';
            setTimeout(() => {
                if (iconElement.style.opacity === '0') {
                    iconElement.style.display = 'none';
                }
            }, 200);
            isIconVisible = false;
        }
    }

    function isValidSelection(selection) {
        if (!selection.rangeCount) return false;
        const range = selection.getRangeAt(0);
        return !range.collapsed;
    }

    function handleSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length >= MIN_SELECTION_LENGTH && isValidSelection(selection)) {
            currentSelection = selectedText;
            
            requestAnimationFrame(() => {
                positionIcon(selection);
            });
        } else {
            hideIcon();
            currentSelection = '';
        }
    }

    // Update mouseup event listener for better selection handling
    document.addEventListener('mouseup', debounce((e) => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText.length >= MIN_SELECTION_LENGTH && isValidSelection(selection)) {
            handleSelection();
        } else {
            hideIcon();
        }
    }, 10));

    // Add selection change listener for better cross-element selection handling
    document.addEventListener('selectionchange', debounce(() => {
        if (isIconVisible) {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText.length < MIN_SELECTION_LENGTH || !isValidSelection(selection)) {
                hideIcon();
            } else {
                handleSelection();
            }
        }
    }, 100));

    // Click handler to hide icon when clicking outside
    document.addEventListener('click', (e) => {
        if (iconElement && e.target !== iconElement) {
            const selection = window.getSelection();
            if (selection.toString().trim().length < MIN_SELECTION_LENGTH) {
                hideIcon();
                currentSelection = '';
            }
        }
    });

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Cleanup on page unload
    window.addEventListener('pagehide', () => {
        if (iconElement && iconElement.parentNode) {
            iconElement.parentNode.removeChild(iconElement);
        }
    });
})();