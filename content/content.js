// Global state for MutationObserver and feature toggle
let observer = null;
let hidePostsEnabled = false;

// Hides posts containing videos, GIFs, or external links
const hideVideoGifAndExternalLinkPosts = () => {
  if (!hidePostsEnabled) return;

  document.querySelectorAll('div[data-testid="cellInnerDiv"]').forEach(post => {
    // Check for video components, gifs & external links
    const videoComponent = post.querySelector('[data-testid="videoComponent"]');
    const videoElement = videoComponent ? videoComponent.querySelector('video') : null;
    const isGif = videoElement && videoElement.hasAttribute('poster');
    const externalLink = post.querySelector('a[href^="http://"], a[href^="https://"]');

    // Hide post if it contains any filtered content and hasn't been hidden yet
    if (!post.dataset.hidden && (isGif || videoComponent || externalLink)) {
      post.style.display = 'none';
      post.dataset.hidden = 'true';
    }
  });
};

// Initializes MutationObserver to watch for new posts
const startObserver = () => {
  if (observer) return;

  // Create observer to detect new posts being added to the page
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        hideVideoGifAndExternalLinkPosts();
      }
    }
  });

  // Watch for changes in DOM tree
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Handle existing posts on page
  hideVideoGifAndExternalLinkPosts();
};

// Restores visibility of all hidden posts
const showHiddenPosts = () => {
  document.querySelectorAll('div[data-testid="cellInnerDiv"]').forEach(post => {
    if (post.dataset.hidden) {
      post.style.display = '';
      delete post.dataset.hidden;
    }
  });
};

// Handle toggle messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleHidePosts") {
    hidePostsEnabled = message.isEnabled;
    if (!hidePostsEnabled) {
      // Clean up observer and show posts when disabled
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      showHiddenPosts();
    } else {
      // Start observing when enabled
      startObserver();
    }
  }
});

// Initialize extension state from storage
chrome.storage.local.get('hidePostsEnabled', ({ hidePostsEnabled: hidePosts = false }) => {
  hidePostsEnabled = hidePosts;
  if (hidePostsEnabled) {
    startObserver();
  }
});

// Export functions for testing
module.exports = {
  hideVideoGifAndExternalLinkPosts,
  startObserver
};
