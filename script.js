/*

  Project: EYE SIGHT AI
  Author: Haseef Muhammed PC
  Website: https://haseefmuhammed.netlify.app
  License: Custom MIT-based — Personal and Educational Use Only

*/


const videoElement = document.getElementById('video');
  const objectInfoElement = document.getElementById('object-info');
  const loadingScreen = document.getElementById('loading-screen');
  const loadingPercentage = document.getElementById('loading-percentage');
  const mainContent = document.getElementById('main-content');
  const startBtn = document.getElementById('startBtn');

  let model;
  let lastSpokenObject = "";

  function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
    }
    synth.cancel();
    synth.speak(utterance);
  }

  async function loadModelWithProgress() {
    let percent = 0;
    const interval = setInterval(() => {
      if (percent < 90) {
        percent += Math.floor(Math.random() * 3);
        loadingPercentage.innerText = percent;
      }
    }, 100);

    model = await cocoSsd.load();
    clearInterval(interval);
    loadingPercentage.innerText = 100;

    setTimeout(() => {
      loadingScreen.style.display = 'none';
      mainContent.classList.remove('d-none');
      speak("Model loaded successfully. Starting object detection.");
      objectInfoElement.innerText = "Detecting objects...";
      startObjectDetection();
    }, 1000);
  }

  async function startCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const backCamera = videoDevices.find(device =>
        device.label.toLowerCase().includes('back')
      );

      const constraints = {
        video: {
          deviceId: backCamera ? { exact: backCamera.deviceId } : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream;
    } catch (err) {
      console.error('Camera error:', err);
      objectInfoElement.innerText = 'Unable to access the camera.';
    }
  }

  function startObjectDetection() {
    setInterval(() => {
      model.detect(videoElement).then(predictions => {
        if (predictions.length > 0) {
          const objectName = predictions[0].class;
          objectInfoElement.innerHTML = `Detected: <strong>${objectName}</strong>`;
          if (objectName !== lastSpokenObject) {
            speak(`This is ${objectName}`);
            lastSpokenObject = objectName;
          }
        } else {
          objectInfoElement.innerText = "No object detected!";
        }
      });
    }, 1000);
  }

  startBtn.addEventListener('click', async () => {
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(""));

    setTimeout(() => {
      speak("Model is loading, please wait.");
    }, 500);

    await startCamera();
    await loadModelWithProgress();
  });