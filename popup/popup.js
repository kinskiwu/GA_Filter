document.addEventListener('DOMContentLoaded', async () => {
  const button = document.getElementById('toggleButton');

  // Get current state
  const { hidePostsEnabled = false } = await chrome.storage.local.get('hidePostsEnabled');
  updateButtonState(hidePostsEnabled);

  button.addEventListener('click', async () => {
    const { hidePostsEnabled = false } = await chrome.storage.local.get('hidePostsEnabled');
    const newState = !hidePostsEnabled;

    await chrome.storage.local.set({ hidePostsEnabled: newState });
    updateButtonState(newState);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleHidePosts', isEnabled: newState });
    }
  });
});

function updateButtonState(isEnabled) {
  const button = document.getElementById('toggleButton');
  button.textContent = isEnabled ? 'Show All Posts' : 'Hide Videos/GIFs/Links';
  button.classList.toggle('disabled', !isEnabled);
}
