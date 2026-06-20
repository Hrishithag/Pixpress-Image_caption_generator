const INTRO_DURATION_MS = 3000;
const MESSAGE_DURATION_MS = 3500;
const MAX_HISTORY_ITEMS = 10;
const CAPTION_ENDPOINT = "/caption";
const HISTORY_KEY = "pixpressCaptionHistory";
const THEME_KEY = "pixpressTheme";
const EMPTY_CAPTION = "Your caption will appear here...";
const LOADING_CAPTION = "Generating caption...";

const elements = {
  logoIntro: document.querySelector(".logo-intro"),
  container: document.querySelector(".container"),
  card: document.querySelector(".card"),
  uploadButton: document.querySelector(".styled-upload-btn"),
  imageUpload: document.getElementById("imageUpload"),
  previewImage: document.getElementById("previewImage"),
  captionOutput: document.getElementById("captionOutput"),
  loadingState: document.getElementById("loadingState"),
  feedbackMessage: document.getElementById("feedbackMessage"),
  playButton: document.getElementById("playBtn"),
  copyButton: document.getElementById("copyBtn"),
  downloadButton: document.getElementById("downloadBtn"),
  themeToggle: document.getElementById("themeToggle"),
  captionHistory: document.getElementById("captionHistory"),
  emptyHistory: document.getElementById("emptyHistory"),
};

let isProcessing = false;
let feedbackTimerId;
let previewUrl;
let currentCaption = "";
let captions = [];

function showMainContent() {
  elements.logoIntro.style.display = "none";
  elements.container.classList.add("show");
}

function getStoredJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (_error) {
    return fallback;
  }
}

function setProcessing(isActive) {
  isProcessing = isActive;
  elements.card.classList.toggle("processing", isActive);
  elements.loadingState.classList.toggle("show", isActive);
  elements.loadingState.setAttribute("aria-hidden", String(!isActive));
  elements.imageUpload.disabled = isActive;
  elements.uploadButton.classList.toggle("disabled", isActive);
  elements.playButton.disabled = isActive || !hasCaption();
  elements.copyButton.disabled = isActive || !hasCaption();
  elements.downloadButton.disabled = isActive || !hasCaption();
}

function showFeedback(message, type = "success", autoHide = true) {
  window.clearTimeout(feedbackTimerId);

  elements.feedbackMessage.textContent = message;
  elements.feedbackMessage.className = `feedback-message show ${type}`;

  if (autoHide) {
    feedbackTimerId = window.setTimeout(clearFeedback, MESSAGE_DURATION_MS);
  }
}

function clearFeedback() {
  elements.feedbackMessage.className = "feedback-message";
  elements.feedbackMessage.textContent = "";
}

function hasCaption() {
  return Boolean(currentCaption);
}

function updateActionButtons() {
  const disabled = isProcessing || !hasCaption();
  elements.playButton.disabled = disabled;
  elements.copyButton.disabled = disabled;
  elements.downloadButton.disabled = disabled;
}

function updateCaption(message, saveAsCurrent = false) {
  elements.captionOutput.textContent = message;

  if (saveAsCurrent) {
    currentCaption = message.trim();
  } else if (message === EMPTY_CAPTION || message === LOADING_CAPTION) {
    currentCaption = "";
  }

  updateActionButtons();
}

function isValidImage(file) {
  return file && file.type.startsWith("image/");
}

function showPreview(file) {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  previewUrl = URL.createObjectURL(file);
  elements.previewImage.src = previewUrl;
  elements.previewImage.classList.add("show");
}

async function requestCaption(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(CAPTION_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  let data = {};

  try {
    data = await response.json();
  } catch (_error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Invalid request. Please try another image.");
  }

  return data;
}

async function processImage(file) {
  if (isProcessing) {
    showFeedback("Please wait for the current caption to finish.", "error");
    return;
  }

  if (!file) {
    showFeedback("Please select an image first.", "error");
    return;
  }

  if (!isValidImage(file)) {
    elements.imageUpload.value = "";
    showFeedback("Please upload a valid image file.", "error");
    return;
  }

  showPreview(file);
  setProcessing(true);
  updateCaption(LOADING_CAPTION);
  showFeedback(LOADING_CAPTION, "success", false);

  try {
    const data = await requestCaption(file);

    if (!data.caption) {
      throw new Error(data.message || "No caption was returned. Please try again.");
    }

    updateCaption(data.caption, true);
    addCaptionToHistory(data.caption);
    showFeedback("Caption generated successfully.");
  } catch (error) {
    updateCaption(EMPTY_CAPTION);
    const message = error instanceof TypeError
      ? "Network error. Please check that the backend is running."
      : error.message || "Something went wrong. Please try again.";

    showFeedback(message, "error");
    console.error(error);
  } finally {
    setProcessing(false);
  }
}

function handleImageUpload(event) {
  processImage(event.target.files[0]);
}

function handleDragOver(event) {
  event.preventDefault();

  if (!isProcessing) {
    elements.card.classList.add("drag-over");
  }
}

function handleDragLeave(event) {
  if (!elements.card.contains(event.relatedTarget)) {
    elements.card.classList.remove("drag-over");
  }
}

function handleDrop(event) {
  event.preventDefault();
  elements.card.classList.remove("drag-over");

  const file = event.dataTransfer.files[0];
  processImage(file);
}

function playCaption() {
  if (!hasCaption()) {
    showFeedback("Generate a caption before playing audio.", "error");
    return;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(currentCaption));
}

async function copyCaption() {
  if (!hasCaption()) {
    showFeedback("No caption available to copy.", "error");
    return;
  }

  if (!navigator.clipboard) {
    showFeedback("Clipboard copying is not available in this browser.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(currentCaption);
    showFeedback("Caption copied to clipboard.");
  } catch (_error) {
    showFeedback("Could not copy caption. Please try again.", "error");
  }
}

function downloadCaption() {
  if (!hasCaption()) {
    showFeedback("No caption available to download.", "error");
    return;
  }

  const blob = new Blob([currentCaption], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "pixpress-caption.txt";
  link.click();
  URL.revokeObjectURL(link.href);
  showFeedback("Caption downloaded.");
}

function addCaptionToHistory(caption) {
  const cleanCaption = caption.trim();

  if (!cleanCaption) {
    return;
  }

  captions = captions.filter((item) => item !== cleanCaption);
  captions.unshift(cleanCaption);
  captions = captions.slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(captions));
  renderHistory();
}

function restoreCaption(caption) {
  updateCaption(caption, true);
  showFeedback("Previous caption restored.");
}

function renderHistory() {
  elements.captionHistory.innerHTML = "";
  elements.emptyHistory.hidden = captions.length > 0;

  captions.forEach((caption) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = caption;
    button.addEventListener("click", () => restoreCaption(caption));
    item.appendChild(button);
    elements.captionHistory.appendChild(item);
  });
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  elements.themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
  elements.themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
  applyTheme(nextTheme);
}

function loadInitialState() {
  captions = getStoredJson(HISTORY_KEY, []);
  renderHistory();
  applyTheme(localStorage.getItem(THEME_KEY) || "light");
  updateActionButtons();
}

function bindEvents() {
  window.addEventListener("load", () => {
    setTimeout(showMainContent, INTRO_DURATION_MS);
  });

  elements.imageUpload.addEventListener("change", handleImageUpload);
  elements.card.addEventListener("dragover", handleDragOver);
  elements.card.addEventListener("dragleave", handleDragLeave);
  elements.card.addEventListener("drop", handleDrop);
  elements.playButton.addEventListener("click", playCaption);
  elements.copyButton.addEventListener("click", copyCaption);
  elements.downloadButton.addEventListener("click", downloadCaption);
  elements.themeToggle.addEventListener("click", toggleTheme);
}

loadInitialState();
bindEvents();
