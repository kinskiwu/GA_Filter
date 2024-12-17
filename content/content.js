// Tracks DOM changes and filter state
let postObserver = null;
let isFilterEnabled = false;

const filterUnwantedPosts = () => {
  if (!isFilterEnabled) return;

  document.querySelectorAll('[data-testid="cellInnerDiv"]').forEach(post => {
    const videoComponent = post.querySelector('[data-testid="videoComponent"]');
    const videoElement = videoComponent?.querySelector('video');
    const isGifPost = videoElement?.hasAttribute('poster');
    const hasExternalLink = post.querySelector('a[href^="http://"], a[href^="https://"]');

    if (!post.dataset.filtered && (isGifPost || videoComponent || hasExternalLink)) {
      post.style.display = 'none';
      post.dataset.filtered = 'true';
    }
  });
};

const initializePostObserver = () => {
  if (postObserver) return;

  postObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        filterUnwantedPosts();
      }
    }
  });

  postObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  filterUnwantedPosts();
};

const showFilteredPosts = () => {
  document.querySelectorAll('[data-testid="cellInnerDiv"]').forEach(post => {
    if (post.dataset.filtered) {
      post.style.display = '';
      delete post.dataset.filtered;
    }
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleHidePosts") {
    isFilterEnabled = message.isEnabled;

    if (!isFilterEnabled) {
      postObserver?.disconnect();
      postObserver = null;
      showFilteredPosts();
    } else {
      initializePostObserver();
    }
  }
});

chrome.storage.local.get('hidePostsEnabled', ({ hidePostsEnabled = false }) => {
  isFilterEnabled = hidePostsEnabled;
  if (isFilterEnabled) {
    initializePostObserver();
  }
});
