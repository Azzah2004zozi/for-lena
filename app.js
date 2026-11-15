/* Paste your deployed Google Apps Script Web App URL here. */
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbx-Q1i3rWzrKO2honFFqcSFGywKtXYJNf9aWML5vioCsXC83q67KlwzV-G8yJ_EurnC/exec';

const noteElement = document.getElementById('owner-note');
const form = document.getElementById('message-form');
const messageInput = document.getElementById('visitor-message');
const sendButton = document.getElementById('send-button');
const statusElement = document.getElementById('form-status');
const messageFrame = document.getElementById('message-frame');
const requestIdInput = document.getElementById('request-id');

window.alert('this website is exclusively for lena only');
function backendIsConfigured() {
  return BACKEND_URL.startsWith('https://script.google.com/macros/s/') && BACKEND_URL.endsWith('/exec');
}

function loadOwnerNote() {
  if (!backendIsConfigured()) {
    noteElement.textContent = 'The owner’s note will appear here.';
    return;
  }

  const callbackName = 'receiveForLenaNote';
  const oldScript = document.getElementById('for-lena-note-script');
  if (oldScript) oldScript.remove();

  window[callbackName] = function (data) {
    noteElement.textContent = data && typeof data.note === 'string'
      ? data.note
      : 'A little message will appear here.';
    delete window[callbackName];
  };

  const script = document.createElement('script');
  script.id = 'for-lena-note-script';
  script.src = BACKEND_URL + '?callback=' + callbackName + '&t=' + Date.now();
  script.onerror = function () {
    noteElement.textContent = 'The message could not be loaded right now.';
    delete window[callbackName];
  };
  document.body.appendChild(script);
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (!backendIsConfigured()) {
    statusElement.textContent = 'The site is not connected yet.';
    return;
  }

  const message = messageInput.value.trim();
  if (!message) {
    statusElement.textContent = 'Write something first.';
    return;
  }

  const requestId = 'req-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  requestIdInput.value = requestId;
  form.action = BACKEND_URL;
  sendButton.disabled = true;
  statusElement.textContent = 'sending…';
  form.submit();

  // Avoid leaving the form disabled forever if the browser or network blocks the request.
  window.setTimeout(function () {
    if (sendButton.disabled && requestIdInput.value === requestId) {
      sendButton.disabled = false;
      statusElement.textContent = 'No confirmation received. Please try again.';
    }
  }, 20000);
});

window.addEventListener('message', function (event) {
  if (event.source !== messageFrame.contentWindow) return;
  const data = event.data;
  if (!data || data.type !== 'FOR_LENA_RESULT') return;
  if (data.requestId !== requestIdInput.value) return;

  sendButton.disabled = false;
  if (data.ok) {
    messageInput.value = '';
    statusElement.textContent = 'sent ♡';
  } else {
    statusElement.textContent = data.message || 'Something went wrong. Please try again.';
  }
});

loadOwnerNote();
window.setInterval(loadOwnerNote, 30000);
