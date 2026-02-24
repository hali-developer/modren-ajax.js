# Modren AJAX Library in Vanilla JS AJAX

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
```

---

## ⚡ Basic Usage
GET Request
```script
ajax({ url: "/api/users" })
.success(data => console.log("Users:", data))
.error(err => console.error("Error:", err.message))
.final(() => console.log("Request finished"));
POST Request with JSON
ajax({
    url: "/api/user",
    method: "POST",
    data: { name: "Hammad", email: "hammad@example.com" }
})
.success(res => console.log("User created:", res))
.error(err => console.error(err))
.final(() => console.log("Done"));
```

---

## 🏗 Form Handling & File Upload

```html
<form id="uploadForm">
  <input type="text" name="title">
  <input type="file" name="image">
  <button type="submit">Upload</button>
</form>
```

```script
document.getElementById("uploadForm").addEventListener("submit", function(e){
    e.preventDefault();

    ajax({
        url: "/upload",
        method: "POST",
        form: this
    })
    .progress(e => console.log(`Uploaded: ${Math.round(e.loaded / e.total * 100)}%`))
    .success(res => console.log("Upload Success:", res))
    .error(err => console.error("Upload failed:", err))
    .final(() => console.log("Upload finished"));
});
```

---

## 🔁 Retry Mechanism

```script
ajax({
    url: "/unstable-endpoint",
    retries: 3,
    retryDelay: 1000
})
.success(res => console.log("Success after retry:", res))
.error(err => console.error("Failed after retries:", err));
```

---

## 📊 GET Request Caching

```script
ajax({ url: "/api/users" }).success(res => console.log("First fetch:", res));
ajax({ url: "/api/users" }).success(res => console.log("Second fetch (cached):", res));
```

Only GET requests are cached by default

Can disable caching per request: cache: false

---

## 🔄 Deduplication of Concurrent Requests

```script
ajax({ url: "/api/users" }).success(res => console.log("First:", res));
ajax({ url: "/api/users" }).success(res => console.log("Second:", res));
// Only one network request is made; second waits for the first promise
```

---

## ⏱ Timeout

```script
ajax({
    url: "/api/slow-endpoint",
    timeout: 5000 // 5 seconds
})
.success(res => console.log(res))
.error(err => console.log("Timeout or error:", err.message));
```

---

## 🧩 Advanced Error Standardization

All errors have a consistent object:

```
{
  status: 422,         // HTTP status code or 0 for network errors
  message: "Validation failed",
  data: { field: "email" },
  raw: {...}           // Original error object
}
```

Makes error handling predictable.

---

## 🌐 Smart URL Handling

```script
ajax({ url: "/api/users" }); // Uses current domain
ajax({ url: "users/list" }); // Uses current domain
ajax({ url: "https://jsonplaceholder.typicode.com/users" }); // Full URL used as-is
```

---

## 🧩 Loader Auto Management

Loader auto-appended to <body>

Multi-request safe

Loader shows when request starts, hides when all complete

Disable per request: loader: false

```
ajax({ url: "/api/users", loader: false });
```

---

## 🔧 Options

| Option       | Type            | Description                                |
| ------------ | --------------- | ------------------------------------------ |
| `url`        | string          | Endpoint URL (route or full URL)           |
| `method`     | string          | HTTP method (GET, POST, PUT, DELETE, etc.) |
| `data`       | object/FormData | JSON object or FormData to send            |
| `form`       | HTMLFormElement | Form element to auto-convert to FormData   |
| `headers`    | object          | Custom headers for this request            |
| `loader`     | boolean         | Show/hide loader (default true)            |
| `timeout`    | number          | Request timeout in ms (default 15000)      |
| `retries`    | number          | Number of retry attempts on failure        |
| `retryDelay` | number          | Delay between retries in ms                |
| `cache`      | boolean         | Enable/disable caching for GET requests    |


---

## 🔗 Methods on Promise

| Method          | Description                                         |
| --------------- | --------------------------------------------------- |
| `.success(fn)`  | Called on request success                           |
| `.error(fn)`    | Called on request failure                           |
| `.final(fn)`    | Always called after request completes               |
| `.progress(fn)` | For FormData/file uploads, provides progress events |

---

## 🌟 Async/Await Support

```script
try {
    const res = await ajax({ url: "/api/users" });
    console.log("Users:", res);
} catch(err) {
    console.error("Failed:", err.message);
} finally {
    console.log("Request complete");
}
```

---

## 💡 Full Example: Form + File + Retry + Progress

```script
document.getElementById("uploadForm").addEventListener("submit", function(e){
    e.preventDefault();

    ajax({
        url: "/upload",
        method: "POST",
        form: this,
        retries: 2,
        retryDelay: 1000
    })
    .progress(e => console.log(`Uploaded: ${Math.round(e.loaded / e.total * 100)}%`))
    .success(res => console.log("Uploaded:", res))
    .error(err => console.log("Error:", err))
    .final(() => console.log("Finished"));
});
```

---

## 🔧 Global Configuration

```
ajax.timeout = 15000; // default timeout
ajax.defaultHeaders = {
  "Authorization": "Bearer token",
  "X-Requested-With": "XMLHttpRequest"
};
```

---

## Summary

This library provides a complete AJAX solution for modern Vanilla JS projects, including:

File uploads & FormData support

Automatic loader management

Smart URL handling

Retry and delay options

GET request caching

Deduplication of concurrent requests

Advanced error standardization

Progress tracking for uploads

Promise + .success/.error/.final chainable API

Fully async/await compatible

Perfect for SaaS, Admin Panels, ERP systems, Food Delivery apps, or any production web app.
