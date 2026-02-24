# Advanced Vanilla JS AJAX Library

A **production-ready, feature-rich AJAX library** in Vanilla JavaScript with loader, form handling, file uploads, interceptors, retries, caching, deduplication, progress tracking, and advanced error standardization.

---

## 🌟 Features

- `.success()` → Success callback
- `.error()` → Error callback
- `.final()` → Always runs after request completion
- `.progress()` → Upload progress tracking (for FormData / file uploads)
- Smart base URL: uses current domain if route-only URL provided
- Timeout support
- Multi-request safe loader (auto-appended to body)
- Full form handling (including file uploads)
- Advanced standardized error object
- Concurrent request deduplication
- Caching for GET requests
- Retry mechanism with delay
- Async/Await compatible

---

## 🔧 Installation

Include the script in your HTML:

```html
<script src="ajax.js"></script>
