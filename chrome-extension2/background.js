// background.js
chrome.runtime.onInstalled.addListener(() => {
    // Check if the API key is already stored, otherwise prompt the user
    chrome.storage.local.get(['groqApiKey'], (result) => {
      if (!result.groqApiKey) {
        // If no API key is stored, you can ask the user to enter it or set a default key
        chrome.storage.local.set({ groqApiKey: 'YOUR_DEFAULT_API_KEY' });
      }
    });
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getGroqApiKey') {
      chrome.storage.local.get(['groqApiKey'], (result) => {
        sendResponse({ apiKey: result.groqApiKey });
      });
      return true; // Indicate that you will send a response asynchronously
    } else if (request.action === 'callGroqApi') {
      fetch('https://api.groq.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${request.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request.payload)
      })
      .then(response => response.json())
      .then(data => sendResponse({ data }))
      .catch(error => sendResponse({ error: error.message }));
      return true; // Indicate that you will send a response asynchronously
    }
  });
  