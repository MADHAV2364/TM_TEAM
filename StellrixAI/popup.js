const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const screenCaptureBtn = document.getElementById('screen-capture');
const micButton = document.getElementById('mic-button'); // 🎤 button

// 🔑 Replace with your own OpenAI API key
const apiKey = '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';
const openAiApiUrl = 'https://api.openai.com/v1/chat/completions';
const model = 'gpt-4o-mini';

let lastScreenText = "";

// --- Send message ---
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

// --- Screen Capture + OCR ---
screenCaptureBtn.addEventListener('click', async () => {
  appendMessage('bot', '📸 Analyzing your screen...');
  const screenText = await analyzeScreenWithOCR();

  if (screenText) {
    lastScreenText = screenText;
    const cleanedText = await cleanOCRText(screenText);
    appendMessage('bot', '✅ Screen analysis complete:');
    appendMessage('bot', cleanedText);
  } else {
    appendMessage('bot', '❌ Could not extract any text from the screen.');
  }
});

// --- 🎤 Speech Recognition ---
micButton.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window)) {
    appendMessage('bot', '❌ Speech recognition is not supported in this browser.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onstart = () => {
    appendMessage('bot', '🎤 Listening...');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    appendMessage('user', transcript);
    askOpenAi(transcript);
  };

  recognition.onerror = (event) => {
    appendMessage('bot', `❌ Mic error: ${event.error}`);
  };

  recognition.start();
});

// --- Append chat message ---
function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);
  messageDiv.textContent = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// --- Ask OpenAI ---
async function askOpenAi(content) {
  try {
    const messages = [];

    if (lastScreenText) {
      messages.push({
        role: 'system',
        content: `The user analyzed the screen and got: "${lastScreenText}".`
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

// --- Clean OCR text using OpenAI ---
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
            content: "You are a text cleaner. Rewrite the given OCR text into clean, readable English."
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
  } catch {
    return rawText; // fallback
  }
}

// --- Capture screen frame ---
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
      canvas.getContext('2d').drawImage(video, 0, 0);
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
    return text;
  } catch {
    return null;
  }
}

/*my first openai api call key= 
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
 */