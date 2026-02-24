(function (global) {

    var activeRequests = 0;
    var requestCache = {};   // For caching GET requests
    var ongoingRequests = {}; // For deduplication

    function createLoader() {
        if (!document.getElementById("ajax-global-loader")) {
            var loader = document.createElement("div");
            loader.id = "ajax-global-loader";
            loader.style.cssText = `
                position:fixed;top:0;left:0;
                width:100%;height:100%;
                background:rgba(0,0,0,0.4);
                display:flex;align-items:center;justify-content:center;
                z-index:99999;color:#fff;font-size:18px;
            `;
            loader.innerHTML = "Loading...";
            document.body.appendChild(loader);
        }
    }

    function showLoader() {
        activeRequests++;
        createLoader();
        document.getElementById("ajax-global-loader").style.display = "flex";
    }

    function hideLoader() {
        activeRequests--;
        if (activeRequests <= 0) {
            var loader = document.getElementById("ajax-global-loader");
            if (loader) loader.style.display = "none";
            activeRequests = 0;
        }
    }

    function resolveURL(url) {
        if (/^https?:\/\//i.test(url)) return url;
        var base = window.location.origin;
        return url.startsWith("/") ? base + url : base + "/" + url;
    }

    function normalizeError(error) {
        return {
            status: error.status || 0,
            message: error.message || "Something went wrong",
            data: error.data || null,
            raw: error
        };
    }

    function ajax(options) {

        if (!options || !options.url) {
            throw new Error("URL is required");
        }

        var method = (options.method || "GET").toUpperCase();
        var timeout = ajax.timeout || 15000;
        var retries = options.retries || 0; // Retry count
        var retryDelay = options.retryDelay || 1000;
        var useLoader = options.loader !== false;
        var cacheKey = null;

        var headers = Object.assign({}, ajax.defaultHeaders || {}, options.headers || {});
        var body = null;

        if (options.form instanceof HTMLFormElement) {
            body = new FormData(options.form);
            delete headers["Content-Type"];
        }
        else if (options.data instanceof FormData) {
            body = options.data;
            delete headers["Content-Type"];
        }
        else if (options.data) {
            body = JSON.stringify(options.data);
            headers["Content-Type"] = "application/json";
        }

        // Handle caching only for GET
        if (method === "GET" && options.cache !== false) {
            cacheKey = resolveURL(options.url);
            if (requestCache[cacheKey]) {
                var cached = Promise.resolve(requestCache[cacheKey]);
                cached.success = function(cb){ cached.then(cb); return cached; };
                cached.error = function(cb){ cached.catch(cb); return cached; };
                cached.final = function(cb){ cached.finally(cb); return cached; };
                return cached;
            }
        }

        // Deduplication
        var dedupeKey = method + "::" + resolveURL(options.url);
        if (ongoingRequests[dedupeKey]) {
            return ongoingRequests[dedupeKey];
        }

        function makeFetch(attempt = 0) {
            var controller = new AbortController();
            var timer = setTimeout(function () {
                controller.abort();
            }, timeout);

            if (useLoader) showLoader();

            var fetchPromise = fetch(resolveURL(options.url), {
                method: method,
                headers: headers,
                body: body,
                signal: controller.signal
            })
            .then(async function(response){
                clearTimeout(timer);

                var contentType = response.headers.get("content-type");
                var responseData = contentType && contentType.includes("application/json")
                    ? await response.json()
                    : await response.text();

                if (!response.ok) {
                    throw normalizeError({
                        status: response.status,
                        message: responseData?.message || "Request failed",
                        data: responseData
                    });
                }

                // Cache GET responses
                if (method === "GET" && cacheKey) requestCache[cacheKey] = responseData;

                return responseData;
            })
            .catch(async function(err){
                var normalized = normalizeError(err);
                if (attempt < retries) {
                    await new Promise(r => setTimeout(r, retryDelay));
                    return makeFetch(attempt + 1);
                }
                throw normalized;
            })
            .finally(function(){
                if (useLoader) hideLoader();
                delete ongoingRequests[dedupeKey];
            });

            // Chainable API
            fetchPromise.success = function(cb){ fetchPromise.then(cb); return fetchPromise; };
            fetchPromise.error = function(cb){ fetchPromise.catch(cb); return fetchPromise; };
            fetchPromise.final = function(cb){ fetchPromise.finally(cb); return fetchPromise; };
            fetchPromise.progress = function(cb){
                // Only for upload progress
                if (body instanceof FormData) {
                    var xhr = new XMLHttpRequest();
                    xhr.open(method, resolveURL(options.url), true);
                    for (var key in headers) xhr.setRequestHeader(key, headers[key]);
                    xhr.upload.onprogress = cb;
                    xhr.onload = function(){ fetchPromise.resolve(xhr.response); };
                    xhr.onerror = function(){ fetchPromise.reject(normalizeError({message:"XHR failed"})); };
                    xhr.send(body);
                }
                return fetchPromise;
            };

            ongoingRequests[dedupeKey] = fetchPromise;
            return fetchPromise;
        }

        return makeFetch();
    }

    ajax.timeout = 15000;
    ajax.defaultHeaders = {};

    global.ajax = ajax;

})(window);
