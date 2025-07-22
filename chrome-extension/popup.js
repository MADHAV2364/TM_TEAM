// popup.js
let liveStream, liveInterval;

async function extractTextFromImage(dataURL) {
  const worker = Tesseract.createWorker();
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const { data: { text } } = await worker.recognize(dataURL);
  await worker.terminate();
  return text;
}

function saveContext(newText) {
  chrome.storage.local.get(["context"], (result) => {
    const existing = result.context || "";
    const updated = existing + "\n" + newText;
    chrome.storage.local.set({ context: updated });
  });
}

document.getElementById("startCapture").addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const track = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(track);
  const bitmap = await imageCapture.grabFrame();
  track.stop();
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  const dataURL = canvas.toDataURL();
  const text = await extractTextFromImage(dataURL);
  saveContext(text);
  alert("Screen captured and text extracted.");
});

document.getElementById("startLive").addEventListener("click", async () => {
  liveStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const track = liveStream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(track);
  liveInterval = setInterval(async () => {
    try {
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      const dataURL = canvas.toDataURL();
      const text = await extractTextFromImage(dataURL);
      saveContext(text);
    } catch (err) {
      console.error("Live capture error:", err);
    }
  }, 5000); // capture every 5 seconds

  alert("Live feed started. Capturing every 5 seconds...");
});

document.getElementById("stopLive").addEventListener("click", () => {
  if (liveInterval) clearInterval(liveInterval);
  if (liveStream) liveStream.getTracks().forEach(track => track.stop());
  alert("Live feed stopped.");
});

document.getElementById("uploadPdf").addEventListener("click", () => {
  document.getElementById("pdfInput").click();
});

document.getElementById("pdfInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }
  saveContext(fullText);
  alert("PDF uploaded and text extracted.");
});

document.getElementById("clearContext").addEventListener("click", () => {
  chrome.storage.local.remove("context", () => {
    alert("Chat context cleared.");
  });
});

document.getElementById("send").addEventListener("click", async () => {
  const userInput = document.getElementById("chatInput").value;
  chrome.storage.local.get(["context"], async (result) => {
    const context = result.context || "";
    chrome.runtime.sendMessage({ type: "askGroq", prompt: userInput, context }, (response) => {
      const chatHistory = document.getElementById("chatHistory");
      const entry = document.createElement("div");
      entry.innerHTML = `<b>You:</b> ${userInput}<br><b>AI:</b> ${response}<hr>`;
      chatHistory.prepend(entry);
      document.getElementById("chatInput").value = "";
    });
  });
});
