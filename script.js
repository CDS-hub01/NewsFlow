// GET ALL ELEMENTS — in same order as HTML
// =====================================================

const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');
const darkToggle = document.getElementById('darkToggle');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const homeBtn = document.getElementById('homeBtn');
const tickerContent = document.getElementById('tickerContent');
const heroCard = document.getElementById('heroCard');
const heroLoading = document.getElementById('heroLoading');
const newsLoading = document.getElementById('newsLoading');
const newsError = document.getElementById('newsError');
const newsGrid = document.getElementById('newsGrid');
const retryBtn = document.getElementById('retryBtn');
const loadMoreWrap = document.getElementById('loadMoreWrap');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const newsTimestamp = document.getElementById('newsTimestamp');

// =====================================================
// API CONFIGURATION
// Replace 'YOUR_API_KEY_HERE' with your actual
// NewsAPI key — type it directly in VS Code!
// =====================================================

const API_KEY = '4bb24aa7e9024eadb38c13458c0073d1';
const BASE_URL = 'https://newsapi.org/v2';

// APP STATE
// WHY: Track current category, page and articles
//      so we can load more and filter correctly!

let currentCategory = 'general';
let currentPage = 1;
let currentQuery = '';
let allArticles = [];

// =====================================================
// BUILD API URL
// Type: function returning a string
// WHY: Builds the correct URL based on whether
//      user is searching or browsing by category!
// =====================================================

const buildUrl = (category, page = 1, query = '') => {
  if (query) {
    return `${BASE_URL}/everything?q=${query}&language=en&pageSize=9&page=${page}&apiKey=${API_KEY}`;
  }
  return `${BASE_URL}/top-headlines?country=us&category=${category}&pageSize=9&page=${page}&apiKey=${API_KEY}`;
};

// =====================================================
// FORMAT DATE
// WHY: Converts raw API date into readable format
// Example: "2026-06-20T10:30:00Z" → "Jun 20, 2026"
// =====================================================

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// =====================================================
// FETCH NEWS
// Type: async function + fetch + try/catch
// WHEN: Page loads, category changes, search runs
// WHY: Gets live articles from NewsAPI!
// =====================================================

const fetchNews = async (category = 'general', page = 1, query = '') => {
  try {
    // Show loading state
    if (page === 1) {
      newsGrid.innerHTML = '';
      newsLoading.style.display = 'flex';
      newsError.style.display = 'none';
      loadMoreWrap.style.display = 'none';
    }

    const url = buildUrl(category, page, query);
    const response = await fetch(url);
    const data = await response.json();

    // Hide loading
    newsLoading.style.display = 'none';

    // Check API response status
    if (data.status !== 'ok') {
      throw new Error(data.message || 'API error');
    }

    // Filter out articles with no title or removed content
    const validArticles = data.articles.filter(
      (a) => a.title && a.title !== '[Removed]' && a.url,
    );

    if (page === 1) {
      allArticles = validArticles;

      // Render hero with first article
      if (validArticles.length > 0) {
        renderHero(validArticles[0]);
        renderGrid(validArticles.slice(1));
        updateTicker(validArticles);
      } else {
        heroCard.innerHTML =
          '<p style="padding: 40px; color: var(--text-muted); text-align: center;">No top story available right now.</p>';
        newsGrid.innerHTML =
          '<p style="color: var(--text-muted); text-align: center; padding: 40px 0;">No articles found.</p>';
      }
    } else {
      // Load more — append to existing grid
      allArticles = [...allArticles, ...validArticles];
      appendToGrid(validArticles);
    }

    // Update timestamp
    updateTimestamp();

    // Show load more button if there are more articles
    if (data.totalResults > allArticles.length + 1) {
      loadMoreWrap.style.display = 'block';
    } else {
      loadMoreWrap.style.display = 'none';
    }
  } catch (error) {
    console.log('NewsFlow fetch error:', error);
    newsLoading.style.display = 'none';
    newsError.style.display = 'flex';
  }
};

// =====================================================
// RENDER HERO — TOP STORY
// Type: function + template literal
// WHEN: After first fetch on page load or
//       category change
// WHY: Shows the most important article
//      prominently at the top!
// =====================================================

const renderHero = (article) => {
  const image = article.urlToImage
    ? `<img src="${article.urlToImage}" alt="${article.title}" class="hero-img" onerror="this.style.display='none'" />`
    : `<div class="news-card-img-placeholder"><i class="fas fa-newspaper"></i></div>`;

  heroCard.innerHTML = `
    <div class="hero-card-inner">
      <div class="hero-img-wrap">
        ${image}
      </div>
      <div class="hero-info">
        <span class="hero-badge">
          <i class="fas fa-star"></i> Top Story
        </span>
        <h2 class="hero-title">${article.title}</h2>
        <p class="hero-desc">${article.description || 'Read the full story below.'}</p>
        <div class="hero-meta">
          <span class="hero-source">${article.source?.name || 'Unknown'}</span>
          <span>·</span>
          <span>${formatDate(article.publishedAt)}</span>
        </div>
        <a href="${article.url}" target="_blank" class="btn btn-accent">
          Read Full Story <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
};

// =====================================================
// RENDER NEWS GRID
// Type: Array map + join + innerHTML
// WHEN: After hero is rendered
// WHY: Shows remaining articles as cards!
// =====================================================

const renderGrid = (articles) => {
  if (articles.length === 0) {
    newsGrid.innerHTML =
      '<p style="color: var(--text-muted); text-align: center; padding: 40px 0; grid-column: 1/-1;">No articles found.</p>';
    return;
  }

  newsGrid.innerHTML = articles.map((article) => createCard(article)).join('');
};

// =====================================================
// APPEND TO GRID — for Load More
// Type: insertAdjacentHTML
// WHY: Adds more cards WITHOUT clearing existing ones!
// =====================================================

const appendToGrid = (articles) => {
  const html = articles.map((article) => createCard(article)).join('');
  newsGrid.insertAdjacentHTML('beforeend', html);
};

// =====================================================
// CREATE NEWS CARD HTML
// Type: function returning template literal
// WHEN: Called by renderGrid and appendToGrid
// WHY: One function builds all article cards!
// =====================================================

const createCard = (article) => {
  const image = article.urlToImage
    ? `<img src="${article.urlToImage}" alt="${article.title}" class="news-card-img" loading="lazy" onerror="this.parentElement.innerHTML='<div class=news-card-img-placeholder><i class=fas fa-newspaper></i></div>'" />`
    : `<div class="news-card-img-placeholder"><i class="fas fa-newspaper"></i></div>`;

  return `
    <div class="news-card">
      <div class="news-card-img-wrap">
        ${image}
      </div>
      <div class="news-card-body">
        <span class="news-card-category">${currentQuery ? 'Search Result' : currentCategory}</span>
        <h3 class="news-card-title">${article.title}</h3>
        <p class="news-card-desc">${article.description || ''}</p>
        <a href="${article.url}" target="_blank" class="read-more">
          Read More <i class="fas fa-arrow-right"></i>
        </a>
        <div class="news-card-footer">
          <span class="news-card-source">${article.source?.name || 'Unknown'}</span>
          <span class="news-card-date">${formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </div>
  `;
};

// =====================================================
// UPDATE BREAKING NEWS TICKER
// Type: function + string join
// WHEN: After articles are fetched
// WHY: Shows scrolling headlines in the ticker bar!
// =====================================================

const updateTicker = (articles) => {
  const headlines = articles
    .slice(0, 8)
    .map((a) => `<span class="ticker-item">⚡ ${a.title}</span>`)
    .join('&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;');

  tickerContent.innerHTML = headlines;
};

// =====================================================
// UPDATE TIMESTAMP
// WHY: Shows when the news was last fetched!
// =====================================================

const updateTimestamp = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (newsTimestamp) {
    newsTimestamp.textContent = `Updated at ${time}`;
  }
};

// =====================================================
// CATEGORY TABS
// Type: querySelectorAll + forEach + addEventListener
// WHEN: User clicks a category tab
// WHY: Filters news by the selected category!
// =====================================================

const initCategoryTabs = () => {
  const tabs = document.querySelectorAll('.cat-tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      tabs.forEach((t) => t.classList.remove('active'));

      // Add active to clicked tab
      tab.classList.add('active');

      // Update state and fetch
      currentCategory = tab.getAttribute('data-category');
      currentPage = 1;
      currentQuery = '';

      // Clear search input
      if (searchInput) searchInput.value = '';

      // Save last category to localStorage
      localStorage.setItem('nf_category', currentCategory);

      fetchNews(currentCategory, 1);
    });
  });
};

// =====================================================
// SEARCH FUNCTIONALITY
// Type: addEventListener on button + input
// WHEN: User clicks search or presses Enter
// WHY: Fetches news matching the search query!
// =====================================================

const initSearch = () => {
  if (!searchBtn || !searchInput) return;

  const doSearch = () => {
    const query = searchInput.value.trim();
    if (!query) return;

    // Reset category tabs active state
    document
      .querySelectorAll('.cat-tab')
      .forEach((t) => t.classList.remove('active'));

    currentQuery = query;
    currentCategory = '';
    currentPage = 1;

    fetchNews('', 1, query);
  };

  searchBtn.addEventListener('click', doSearch);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
};

// =====================================================
// LOAD MORE BUTTON
// Type: addEventListener
// WHEN: User clicks "Load More"
// WHY: Fetches the next page of articles!
// =====================================================

const initLoadMore = () => {
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchNews(currentCategory, currentPage, currentQuery);
  });
};

// =====================================================
// RETRY BUTTON
// Type: addEventListener
// WHEN: User clicks Retry after an error
// WHY: Tries fetching news again!
// =====================================================

const initRetry = () => {
  if (!retryBtn) return;

  retryBtn.addEventListener('click', () => {
    fetchNews(currentCategory, currentPage, currentQuery);
  });
};

// =====================================================
// HOME BUTTON — Reset to default
// WHEN: User clicks the NewsFlow logo
// WHY: Returns to General news, clears search!
// =====================================================

const initHomeBtn = () => {
  if (!homeBtn) return;

  homeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    currentCategory = 'general';
    currentPage = 1;
    currentQuery = '';

    if (searchInput) searchInput.value = '';

    // Reset tabs
    document
      .querySelectorAll('.cat-tab')
      .forEach((t) => t.classList.remove('active'));
    const generalTab = document.querySelector(
      '.cat-tab[data-category="general"]',
    );
    if (generalTab) generalTab.classList.add('active');

    fetchNews('general', 1);
  });
};

// =====================================================
// DARK MODE
// Type: classList.toggle + localStorage
// WHEN: User clicks the moon/sun button
// WHY: Switches theme and saves preference!
// =====================================================

const initDarkMode = () => {
  if (!darkToggle) return;

  // Check saved preference
  const saved = localStorage.getItem('nf_darkmode');
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    const icon = darkToggle.querySelector('i');
    if (icon) {
      icon.classList.replace('fa-moon', 'fa-sun');
    }
  }

  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    localStorage.setItem('nf_darkmode', isDark);

    const icon = darkToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-moon', !isDark);
      icon.classList.toggle('fa-sun', isDark);
    }
  });
};

// =====================================================
// HAMBURGER MENU
// Rule 12 — no aria, click outside to close
// Links slide in from RIGHT, right-aligned
// Same pattern as portfolio!
// =====================================================

const initHamburger = () => {
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  // Close when nav link is clicked
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const icon = hamburger.querySelector('i');
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');

      // Fetch the clicked category
      const category = link.getAttribute('data-category');
      if (category) {
        currentCategory = category;
        currentPage = 1;
        currentQuery = '';
        fetchNews(category, 1);
      }
    });
  });

  // Close when clicking outside navbar
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('active');
      const icon = hamburger.querySelector('i');
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');
    }
  });
};

// =====================================================
// SET CURRENT YEAR
// =====================================================

const setCurrentYear = () => {
  document.querySelectorAll('.current-year').forEach((span) => {
    span.textContent = new Date().getFullYear();
  });
};

// =====================================================
// AUTO REFRESH — every 5 minutes
// WHY: Keeps news fresh without user refreshing!
// =====================================================

const startAutoRefresh = () => {
  setInterval(
    () => {
      fetchNews(currentCategory, 1, currentQuery);
    },
    5 * 60 * 1000,
  );
};

// =====================================================
// INITIALIZE — runs when page loads
// =====================================================

// Restore last category from localStorage
const savedCategory = localStorage.getItem('nf_category');
if (savedCategory) {
  currentCategory = savedCategory;
  const savedTab = document.querySelector(
    `.cat-tab[data-category="${savedCategory}"]`,
  );
  if (savedTab) {
    document
      .querySelectorAll('.cat-tab')
      .forEach((t) => t.classList.remove('active'));
    savedTab.classList.add('active');
  }
}

initDarkMode();
initHamburger();
initCategoryTabs();
initSearch();
initLoadMore();
initRetry();
initHomeBtn();
setCurrentYear();

// Fetch news on load
fetchNews(currentCategory, 1);

// Start auto refresh
startAutoRefresh();
