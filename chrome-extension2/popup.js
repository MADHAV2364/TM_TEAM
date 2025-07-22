const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const screenCaptureBtn = document.getElementById('screen-capture');

const apiKey = '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'; // ⚠️ Replace with your Groq API key
const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
const model = 'llama3-8b-8192';

let lastScreenText = ""; // Variable to store the last OCR result

sendButton.addEventListener('click', () => {
  const message = userInput.value.trim();
  if (message) {
    appendMessage('user', message);
    userInput.value = '';
    askGroq(message);
  }
});

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendButton.click();
});

screenCaptureBtn.addEventListener('click', async () => {
  appendMessage('bot', '📸 Analyzing your screen...');
  const screenText = await analyzeScreenWithOCR();
  if (screenText) {
    lastScreenText = screenText; // Store the OCR result
    appendMessage('bot', '✅ Screen analysis complete. Feel free to ask anything about it!');
    appendMessage('user', screenText); // Show the OCR result in the chat
  } else {
    appendMessage('bot', '❌ Could not extract any text from the screen.');
  }
});

function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);
  messageDiv.textContent = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function askGroq(content) {
  try {
    // Include OCR result if available
    const messages = [
      { role: 'user', content },
    ];

    if (lastScreenText) {
      // Clarify that the OCR result is context for the current conversation
      messages.push({
        role: 'system',
        content: `The user just analyzed the screen and the text extracted was: "${lastScreenText}".`,
      });
    }

    const response = await fetch(groqApiUrl, {
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

// --- ScreenPipe + OCR logic ---
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

async function analyzeScreenWithOCR() {
  try {
    const canvas = await captureScreenFrame();
    const result = await Tesseract.recognize(canvas, 'eng');
    
    // Clean up the text by removing non-relevant parts like HTML tags, links, etc.
    let text = result.data.text.trim();
    
    // Remove HTML tags if any
    text = text.replace(/<\/?[^>]+(>|$)/g, "");
    
    // Remove URLs from the text
    text = text.replace(/https?:\/\/[^\s]+/g, "");

    // Optional: Remove certain unwanted characters (if any)
    text = text.replace(/[^\w\s]/g, "");

    return text;  // Return the cleaned text for use in conversation
  } catch (error) {
    console.error("OCR failed:", error);
    return null;
  }
}
