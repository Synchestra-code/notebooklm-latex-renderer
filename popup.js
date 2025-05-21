// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const latexBgColorInput = document.getElementById('latexBgColor');

  // Load saved settings and populate the input
  chrome.storage.sync.get(['latexBgColorSetting'], (result) => {
    if (result.latexBgColorSetting) {
      latexBgColorInput.value = result.latexBgColorSetting;
    } else {
      // If no setting stored, use the input's default and save it
      chrome.storage.sync.set({ latexBgColorSetting: latexBgColorInput.value });
    }
  });

  // Save settings on change (using 'input' for live update)
  latexBgColorInput.addEventListener('input', () => {
    chrome.storage.sync.set({ latexBgColorSetting: latexBgColorInput.value });
  });
});
