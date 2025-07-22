async function captureScreenFrame() {
  try {
    // Request permission for screen sharing
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' },
    });

    return new Promise((resolve, reject) => {
      // Create a hidden video element to capture the screen frame
      const video = document.createElement('video');
      video.srcObject = stream;

      video.onloadedmetadata = async () => {
        await video.play();

        // Create a canvas to draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        // Draw the current frame of the video onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop all tracks in the stream after capturing the frame
        stream.getTracks().forEach(track => track.stop());

        // Resolve the promise with the canvas
        resolve(canvas);
      };

      video.onerror = () => reject('Error capturing video stream');
    });
  } catch (error) {
    console.error("Error requesting screen capture:", error);
    throw new Error("Screen capture failed");
  }
}

async function analyzeScreenWithOCR() {
  try {
    const canvas = await captureScreenFrame(); // Capture the screen frame

    // Use Tesseract.js to recognize text from the canvas
    const result = await Tesseract.recognize(canvas, 'eng');
    
    // Return the recognized text (trimmed of any extra whitespace)
    return result.data.text.trim();
  } catch (error) {
    console.error("ScreenPipe Error:", error);
    return null; // Return null if OCR fails
  }
}
