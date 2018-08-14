"use strict";

console.info('WORKER: executing.');

var version = 'v1.0.0';

var offlineFundamentals = [
    'index.html',
    'js/scripts.js',
    'css/styles.css'
];

self.addEventListener("install", function(event) {
    console.info('WORKER: install event in progress.');
    event.waitUntil(
        caches
            .open(version + 'fundamentals')
            .then(function(cache) {
                return cache.addAll(offlineFundamentals);
            })
            .then(function() {
                console.info('WORKER: install completed');
            })
    );
});

self.addEventListener("fetch", function(event) {
    console.info('WORKER: fetch event in progress.');
    if (event.request.method !== 'GET') {
        console.info('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }
    event.respondWith(
        caches
            .match(event.request)
            .then(function(cached) {
                var networked = fetch(event.request)
                    .then(fetchedFromNetwork, unableToResolve)
                    .catch(unableToResolve);
                console.info('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
                return cached || networked;
                function fetchedFromNetwork(response) {
                    var cacheCopy = response.clone();
                    console.info('WORKER: fetch response from network.', event.request.url);
                    caches
                        .open(version + 'pages')
                        .then(function add(cache) {
                            return cache.put(event.request, cacheCopy);
                        })
                        .then(function() {
                            console.info('WORKER: fetch response stored in cache.', event.request.url);
                        });
                    return response;
                }

                function unableToResolve () {
                    console.info('WORKER: fetch request failed in both cache and network.');
                    return new Response('<h1>Service Unavailable</h1>', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/html'
                        })
                    });
                }
            })
    );
});

self.addEventListener("activate", function(event) {
    console.info('WORKER: activate event in progress.');
    event.waitUntil(
        caches
            .keys()
            .then(function (keys) {
                return Promise.all(
                    keys
                        .filter(function (key) {
                            return !key.startsWith(version);
                        })
                        .map(function (key) {
                            return caches.delete(key);
                        })
                );
            })
            .then(function() {
                console.info('WORKER: activate completed.');
            })
    );
});