const PostFilter = require('../content/content.js');

describe('Post Filter Core Functionality', () => {
  beforeEach(() => {
    // Reset state
    PostFilter.setState({ isFilterEnabled: true });

    // Set up test DOM
    document.body.innerHTML = `
      <div data-testid="cellInnerDiv">
        <div data-testid="videoComponent">
          <video poster="test.jpg"></video>
        </div>
      </div>
      <div data-testid="cellInnerDiv">
        <a href="https://example.com">External Link</a>
      </div>
      <div data-testid="cellInnerDiv">
        <p>Regular post</p>
      </div>
    `;
  });

  test('filters video and external link posts when enabled', () => {
    PostFilter.filterUnwantedPosts();

    const posts = document.querySelectorAll('[data-testid="cellInnerDiv"]');
    expect(posts[0].style.display).toBe('none');
    expect(posts[1].style.display).toBe('none');
    expect(posts[2].style.display).toBe('');
  });

  test('does not filter posts when disabled', () => {
    PostFilter.setState({ isFilterEnabled: false });
    PostFilter.filterUnwantedPosts();

    const posts = document.querySelectorAll('[data-testid="cellInnerDiv"]');
    posts.forEach(post => {
      expect(post.style.display).toBe('');
    });
  });

  test('shows all posts after being hidden', () => {
    PostFilter.filterUnwantedPosts();
    PostFilter.showFilteredPosts();

    const posts = document.querySelectorAll('[data-testid="cellInnerDiv"]');
    posts.forEach(post => {
      expect(post.style.display).toBe('');
      expect(post.dataset.filtered).toBeUndefined();
    });
  });
});
