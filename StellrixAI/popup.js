const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const screenCaptureBtn = document.getElementById('screen-capture');

// Replace with your OpenAI API key
const apiKey = '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';
const openAiApiUrl = 'https://api.openai.com/v1/chat/completions';
const model = 'gpt-4o-mini';

let lastScreenText = "";

// --- Event Listeners ---
sendButton.addEventListener('click', () => {
  const message = userInput.value.trim();
  if (message) {
    appendMessage('user', message);
    userInput.value = '';
    askOpenAi(message);
  }
});

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendButton.click();
});

screenCaptureBtn.addEventListener('click', async () => {
  appendMessage('bot', '📸 Analyzing your screen...');
  const screenText = await analyzeScreenWithOCR();

  if (screenText) {
    lastScreenText = screenText;

    // Clean up the messy OCR text before showing it
    const cleanedText = await cleanOCRText(screenText);

    appendMessage('bot', '✅ Screen analysis complete. Here’s the cleaned text:');
    appendMessage('bot', cleanedText);
  } else {
    appendMessage('bot', '❌ Could not extract any text from the screen.');
  }
});

// --- Append Chat Message ---
function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);
  messageDiv.textContent = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// --- Ask OpenAI for general chat ---
async function askOpenAi(content) {
  try {
    const messages = [];

    if (lastScreenText) {
      messages.push({
        role: 'system',
        content: `The user just analyzed the screen. The extracted text was: "${lastScreenText}".`
      });
    }

    messages.push({ role: 'user', content });

    const response = await fetch(openAiApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    const data = await response.json();

    if (response.ok && data.choices?.[0]?.message?.content) {
      appendMessage('bot', data.choices[0].message.content.trim());
    } else {
      appendMessage('bot', `❌ Error: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    appendMessage('bot', `⚠️ Request failed: ${error.message}`);
  }
}

// --- Clean OCR Text using OpenAI ---
async function cleanOCRText(rawText) {
  try {
    const response = await fetch(openAiApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: "You are a text cleaner. Rewrite the given OCR text into clean, readable English. Fix grammar, remove irrelevant symbols, and preserve the original meaning."
          },
          {
            role: 'user',
            content: rawText
          }
        ],
      }),
    });

    const data = await response.json();
    if (response.ok && data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    } else {
      return rawText; // fallback
    }
  } catch (error) {
    console.error("Error cleaning OCR text:", error);
    return rawText; // fallback
  }
}

// --- Screen Capture using getDisplayMedia ---
async function captureScreenFrame() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.onloadedmetadata = async () => {
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach(track => track.stop());
      resolve(canvas);
    };
    video.onerror = reject;
  });
}

// --- OCR with Tesseract ---
async function analyzeScreenWithOCR() {
  try {
    const canvas = await captureScreenFrame();
    const result = await Tesseract.recognize(canvas, 'eng');
    let text = result.data.text.trim();
    text = text.replace(/<\/?[^>]+(>|$)/g, "");
    text = text.replace(/https?:\/\/[^\s]+/g, "");
    text = text.replace(/[^\w\s]/g, "");
    return text;
  } catch (error) {
    console.error("OCR failed:", error);
    return null;
  }
}
