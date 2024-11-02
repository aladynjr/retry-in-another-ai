// Add styles to the page
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .retry-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin: 10px 0 10px 12px;
        padding: 3px 6px;
        background-color: #1b1a16;
        color: #9a9a9a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .retry-button:hover {
        background-color: #2b2a26;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .retry-button svg {
        width: 20px;
        height: 20px;
    }

    .retry-arrow {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: #9a9a9a;
        stroke-width: 2;
        opacity: 0.8;
    }

    .retry-button:hover .retry-arrow {
        opacity: 0.8;
    }

    /* Change the Claude-specific selector to use .retry-button.claude */
    .retry-button.claude {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin: 0 0 0 6px;
        padding: 3px 6px;
        background-color: #1b1a16;
        color: #9a9a9a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
    }
`;
document.head.appendChild(styleSheet);

function addRetryButton(article) {
    // Skip if button already exists in this article
    if (article.querySelector('.retry-button')) {
        return;
    }

    const testId = article.getAttribute('data-testid');
    if (!testId) return;  // Skip if no testId found
    
    const turnNumber = parseInt(testId.split('-').pop());
    
    // Only add button if turn number is odd (AI responses)
    if (turnNumber % 2 !== 0) {
        const button = document.createElement('button');
        button.className = 'retry-button';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512">
                <rect fill="#CC9B7A" width="512" height="512" rx="104.187" ry="105.042"/>
                <path fill="#1F1F1E" fillRule="nonzero" d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"/>
            </svg>
            Retry in Claude
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path d="M3.06957 10.8763C3.62331 6.43564 7.40967 3 12 3C14.2824 3 16.4028 3.85067 18.0118 5.25439V4C18.0118 3.44772 18.4595 3 19.0118 3C19.5641 3 20.0118 3.44772 20.0118 4V8C20.0118 8.55228 19.5641 9 19.0118 9H15C14.4477 9 14 8.55228 14 8C14 7.44772 14.4477 7 15 7H16.9571C15.6757 5.76379 13.9101 5 12 5C8.43108 5 5.48466 7.67174 5.0542 11.1237C4.98586 11.6718 4.48619 12.0607 3.93815 11.9923C3.39011 11.924 3.00123 11.4243 3.06957 10.8763ZM20.0618 12.0077C20.6099 12.076 20.9988 12.5757 20.9304 13.1237C20.3767 17.5644 16.5903 21 12 21C9.72322 21 7.60762 20.1535 5.99999 18.7559V20C5.99999 20.5523 5.55228 21 4.99999 21C4.44771 21 3.99999 20.5523 3.99999 20V16C3.99999 15.4477 4.44771 15 4.99999 15H8.99999C9.55228 15 9.99999 15.4477 9.99999 16C9.99999 16.5523 9.55228 17 8.99999 17H7.04285C8.32433 18.2362 10.0899 19 12 19C15.5689 19 18.5153 16.3283 18.9458 12.8763C19.0141 12.3282 19.5138 11.9393 20.0618 12.0077Z" fill="currentColor"></path></svg>
        `;
        
        // Add click handler to open Claude and save message
        button.addEventListener('click', () => {
            // Collect all previous articles up to this one
            let currentArticle = article;
            const conversationParts = [];
            
            while (currentArticle.previousElementSibling) {
                currentArticle = currentArticle.previousElementSibling;
                
                // Skip if not an article element
                if (currentArticle.tagName.toLowerCase() !== 'article') {
                    continue;
                }
                
                // Get the message content from the element with data-message-author-role
                const messageElement = currentArticle.querySelector('[data-message-author-role]');
                if (messageElement) {
                    // Get the role (user or assistant)
                    const role = messageElement.getAttribute('data-message-author-role');
                    
                    // Get text content excluding memories section
                    const memorySection = messageElement.querySelector('.memory-section');
                    let messageText = messageElement.textContent;
                    
                    if (memorySection) {
                        messageText = messageText.replace(memorySection.textContent, '').trim();
                    }
                    
                    if (messageText) {
                        // Add appropriate prefix based on role
                        const prefix = role === 'user' ? 'User: ' : 'Assistant: ';
                        conversationParts.unshift(`<p>${prefix}${messageText}</p>`);
                    }
                }
            }
            
            // Join with paragraph breaks and add final prompt
            const fullConversation = conversationParts.join('<p><br class="ProseMirror-trailingBreak"></p>') + 
                '<p><br class="ProseMirror-trailingBreak"></p><p>Claude:</p>';
            
            // Use Chrome storage instead of localStorage
            chrome.storage.local.set({ messageForClaude: fullConversation }, () => {
                window.open('https://claude.ai/new', '_blank');
            });
        });
        
        // Find the target div within the article
        const targetDiv = article.querySelector('.group\\/conversation-turn .mb-2.flex.gap-3.empty\\:hidden.-ml-2 > div > div');
        if (targetDiv) {
            targetDiv.appendChild(button);
        }
    }
}
// Add new function for Claude messages
function addRetryButtonClaude(div) {
    // Skip if button already exists
    if (div.querySelector('.retry-button')) {
        return;
    }

    const renderCount = div.getAttribute('data-test-render-count');
    if (!renderCount) return;  // Skip if no render count found

    // Get all Claude message divs
    const allClaudeDivs = Array.from(document.querySelectorAll('div[data-test-render-count]'));
    // Find the index of the current div (0-based)
    const currentIndex = allClaudeDivs.indexOf(div);
    
    // Only add button if this is an even-numbered message (index is odd since 0-based)
    if (currentIndex <= 0 || currentIndex % 2 === 0) return;

    const button = document.createElement('button');
    button.className = 'retry-button claude';
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512">
            <rect fill="#10A37F" width="512" height="512" rx="104.187" ry="105.042"/>
            <path fill="#fff" fillRule="nonzero" d="M378.68 230.011a71.432 71.432 0 003.654-22.541 71.383 71.383 0 00-9.783-36.064c-12.871-22.404-36.747-36.236-62.587-36.236a72.31 72.31 0 00-15.145 1.604 71.362 71.362 0 00-53.37-23.991h-.453l-.17.001c-31.297 0-59.052 20.195-68.673 49.967a71.372 71.372 0 00-47.709 34.618 72.224 72.224 0 00-9.755 36.226 72.204 72.204 0 0018.628 48.395 71.395 71.395 0 00-3.655 22.541 71.388 71.388 0 009.783 36.064 72.187 72.187 0 0077.728 34.631 71.375 71.375 0 0053.374 23.992H271l.184-.001c31.314 0 59.06-20.196 68.681-49.995a71.384 71.384 0 0047.71-34.619 72.107 72.107 0 009.736-36.194 72.201 72.201 0 00-18.628-48.394l-.003-.004z"/>
        </svg>
        Retry in ChatGPT
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path d="M3.06957 10.8763C3.62331 6.43564 7.40967 3 12 3C14.2824 3 16.4028 3.85067 18.0118 5.25439V4C18.0118 3.44772 18.4595 3 19.0118 3C19.5641 3 20.0118 3.44772 20.0118 4V8C20.0118 8.55228 19.5641 9 19.0118 9H15C14.4477 9 14 8.55228 14 8C14 7.44772 14.4477 7 15 7H16.9571C15.6757 5.76379 13.9101 5 12 5C8.43108 5 5.48466 7.67174 5.0542 11.1237C4.98586 11.6718 4.48619 12.0607 3.93815 11.9923C3.39011 11.924 3.00123 11.4243 3.06957 10.8763ZM20.0618 12.0077C20.6099 12.076 20.9988 12.5757 20.9304 13.1237C20.3767 17.5644 16.5903 21 12 21C9.72322 21 7.60762 20.1535 5.99999 18.7559V20C5.99999 20.5523 5.55228 21 4.99999 21C4.44771 21 3.99999 20.5523 3.99999 20V16C3.99999 15.4477 4.44771 15 4.99999 15H8.99999C9.55228 15 9.99999 15.4477 9.99999 16C9.99999 16.5523 9.55228 17 8.99999 17H7.04285C8.32433 18.2362 10.0899 19 12 19C15.5689 19 18.5153 16.3283 18.9458 12.8763C19.0141 12.3282 19.5138 11.9393 20.0618 12.0077Z" fill="currentColor"></path></svg>
    `;

    // Add click handler similar to ChatGPT version
    button.addEventListener('click', () => {
        // Collect all previous messages up to this one
        let currentDiv = div;
        const conversationParts = [];
        
        // Get all divs with data-test-render-count (Claude's messages)
        const allMessages = document.querySelectorAll('div[data-test-render-count]');
        allMessages.forEach(messageDiv => {
            // Get text only from p elements, excluding memory-section
            const paragraphs = messageDiv.querySelectorAll('p');
            const messageText = Array.from(paragraphs)
                .map(p => {
                    // Skip if this paragraph is within a memory-section
                    if (p.closest('.memory-section')) return '';
                    return p.textContent.trim();
                })
                .filter(text => text)
                .join('\n');
                
            if (messageText) {
                conversationParts.push(`User: ${messageText}`);
            }
            
            // Get the human message that precedes this Claude message
            const humanMessage = messageDiv.previousElementSibling?.querySelector('.prose');
            if (humanMessage) {
                // Get text only from p elements, excluding memory-section
                const humanParagraphs = humanMessage.querySelectorAll('p');
                const humanText = Array.from(humanParagraphs)
                    .map(p => {
                        // Skip if this paragraph is within a memory-section
                        if (p.closest('.memory-section')) return '';
                        return p.textContent.trim();
                    })
                    .filter(text => text)
                    .join('\n');
                    
                if (humanText) {
                    conversationParts.push(`Assistant: ${humanText}`);
                }
            }
        });
        
        // Format the conversation for ChatGPT
        const fullConversation = conversationParts.join('\n\n');
        alert('Collected conversation:\n\n' + fullConversation);
        
        // Store in Chrome storage and open correct URL
        chrome.storage.local.set({ messageForChatGPT: fullConversation }, () => {
            window.open('https://chatgpt.com/', '_blank');
        });
    });

    // Find the target div for Claude's interface
    const targetDiv = div.querySelector('div.absolute.-bottom-0.-right-1\\.5 > div > div');
    if (targetDiv) {
        targetDiv.appendChild(button);
    }
}
// Debounce the addRetryButtons function
let timeout;
function debounceAddRetryButtons() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        // Handle ChatGPT messages
        const articles = document.querySelectorAll('article');
        articles.forEach(article => {
            addRetryButton(article);
        });

        // Handle Claude messages
        const claudeDivs = document.querySelectorAll('div[data-test-render-count]');
        claudeDivs.forEach(div => {
            addRetryButtonClaude(div);
        });
    }, 100);
}

// Initial load
debounceAddRetryButtons();

// Watch for new articles being added (for dynamic loading)
const observer = new MutationObserver((mutations) => {
    debounceAddRetryButtons();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,  // Reduce unnecessary triggers
    characterData: false  // Reduce unnecessary triggers
});

// Add helper functions
const getInputBox = () => {
    const inputBox = document.querySelector('div[contenteditable="true"]');
    console.log('Looking for input box:', inputBox);
    return inputBox;
};

const setInputContent = (inputBox, content) => {
    inputBox.innerHTML = content;  // Directly set the HTML content
    // Focus and move cursor to end
    inputBox.focus();
    const range = document.createRange();
    range.selectNodeContents(inputBox);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    // Trigger input event
    inputBox.dispatchEvent(new Event('input', { bubbles: true }));
};

// Handle Claude page
if (window.location.href.includes('claude.ai/new')) {
    console.log('On Claude page, waiting for full load...');
    
    window.addEventListener('load', () => {
        console.log('Page fully loaded, checking for message...');
        
        // Use Chrome storage instead of localStorage
        chrome.storage.local.get(['messageForClaude'], (result) => {
            const messageText = result.messageForClaude;
            console.log('Message from chrome storage:', messageText);
            
            if (messageText) {
                console.log('Found message, starting interval to find input box...');
                const interval = setInterval(() => {
                    console.log('Checking for input box...');
                    const inputBox = getInputBox();
                    
                    if (inputBox) {
                        console.log('Found input box, attempting to insert text...');
                        try {
                            setInputContent(inputBox, messageText);
                            console.log('Text inserted successfully');
                            chrome.storage.local.remove('messageForClaude');
                            clearInterval(interval);
                        } catch (error) {
                            console.error('Error inserting text:', error);
                        }
                    } else {
                        console.log('Input box not found yet...');
                    }
                }, 500);

                setTimeout(() => {
                    console.log('Timeout reached, clearing interval');
                    clearInterval(interval);
                }, 10000);
            } else {
                console.log('No message found in chrome storage');
            }
        });
    });
} else {
    console.log('Not on Claude page');
}

// Add ChatGPT page handler (similar to Claude handler)
if (window.location.href.includes('chatgpt.com')) {
    console.log('On ChatGPT page, waiting for full load...');
    
    window.addEventListener('load', () => {
        console.log('Page fully loaded, checking for message...');
        
        chrome.storage.local.get(['messageForChatGPT'], (result) => {
            const messageText = result.messageForChatGPT;
            console.log('Message from chrome storage:', messageText);
            
            if (messageText) {
                console.log('Found message, starting interval to find input box...');
                const interval = setInterval(() => {
                    console.log('Checking for input box...');
                    const inputBox = document.querySelector('#prompt-textarea');
                    
                    if (inputBox) {
                        console.log('Found input box, attempting to insert text...');
                        try {
                            // Set the content
                            inputBox.innerHTML = `<p>${messageText.replace(/\n/g, '</p><p>')}</p>`;
                            
                            // Trigger input event to enable the send button
                            inputBox.dispatchEvent(new Event('input', { bubbles: true }));
                            
                            console.log('Text inserted successfully');
                            chrome.storage.local.remove('messageForChatGPT');
                            clearInterval(interval);
                        } catch (error) {
                            console.error('Error inserting text:', error);
                        }
                    } else {
                        console.log('Input box not found yet...');
                    }
                }, 500);

                // Clear interval after 10 seconds if not found
                setTimeout(() => {
                    console.log('Timeout reached, clearing interval');
                    clearInterval(interval);
                }, 10000);
            } else {
                console.log('No message found in chrome storage');
            }
        });
    });
} 
