document.addEventListener('DOMContentLoaded', async () => {
  const toggleButton = document.getElementById('toggleButton');

  const { hidePostsEnabled = false } = await chrome.storage.local.get('hidePostsEnabled');
  updateToggleButton(hidePostsEnabled);

  toggleButton.addEventListener('click', async () => {
    const { hidePostsEnabled = false } = await chrome.storage.local.get('hidePostsEnabled');
    const nextState = !hidePostsEnabled;

    await chrome.storage.local.set({ hidePostsEnabled: nextState });
    updateToggleButton(nextState);

    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'toggleHidePosts',
        isEnabled: nextState
      }).catch(() => {});
    }
  });
});

function updateToggleButton(isEnabled) {
  const toggleButton = document.getElementById('toggleButton');
  toggleButton.textContent = isEnabled ? 'Disable GA Filter' : 'Enable GA Filter';
  toggleButton.classList.toggle('disabled', !isEnabled);
}
