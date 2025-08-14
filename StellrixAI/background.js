// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['openaiApiKey'], (result) => {
    if (!result.openaiApiKey) {
      chrome.storage.local.set({ openaiApiKey: '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' }); // Replace with your key or leave for user input
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getOpenAiApiKey') {
    chrome.storage.local.get(['openaiApiKey'], (result) => {
      sendResponse({ apiKey: result.openaiApiKey });
    });
    return true;
  } else if (request.action === 'callOpenAiApi') {
    fetch('https://api.openai.com/v1/chat/completions', {
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
    return true;
  }
});



//my first openai api call key=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