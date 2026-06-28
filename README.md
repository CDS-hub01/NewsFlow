# NewsFlow — Live World News Portal

A sleek, editorial-grade, real-time news dashboard engineered with clean semantic HTML5, custom responsive CSS grid/flexbox properties, and native asynchronous ES6+ JavaScript modules.

Built in Port Harcourt, Nigeria 🇳🇬

---

## 🏗️ Architecture Blueprint

NewsFlow follows a clean, vanilla **Single Page Application (SPA)** design pattern. All visual layout transitions, data tracking, and dynamic content streams are handled entirely on the client side without jarring page reloads.

NewsFlow/
├── index.html   → SPA Semantic Skeleton
├── style.css    → Universal Design Variables & Layout System
└── script.js    → Async Data Pipeline & UI State Controller

## ⚡ Key Capabilities & Logic Systems

1. **Live Asynchronous Ingestion Engine:** Fetches production data patches directly from the NewsAPI REST endpoint using standard browser `fetch()` requests and clean `async/await` operational blocks.
2. **Dynamic UI Rendering & Appending:** Converts incoming JSON payloads cleanly into interactive visual grid cards via array processing methods (`.map().join('')`) and incorporates progressive loading via an advanced "Load More" link.
3. **Persistent Structural Themes:** Toggles high-contrast light and dark visual profiles instantly. Preferences lock into the browser's `localStorage` to ensure design continuity across tab closes and reloads.
4. **Adaptive Response Framework:** Features a clean desktop presentation grid that transitions into a compact mobile view with an off-canvas navigation system.
5. **Auto-Refresh Core:** A background tracking module that wakes up every 5 minutes to fetch the latest stories automatically, keeping the dashboard accurate without manual interaction.
 
