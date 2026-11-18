---
layout: null
permalink: /sw.js
---
/* Offline support. Generated at build time: the cache name changes with every build, so a new deploy
   replaces the saved copy. Pages: network first, saved copy if offline. Everything else: saved copy first,
   refreshed in the background. */
var CACHE = 'micro-links-{{ site.time | date: "%s" }}';
var V = '?v={{ site.time | date: "%s" }}';
var BASE = '{{ "/" | relative_url }}';
var PRECACHE = [
{%- for p in site.pages -%}
  {%- unless p.url contains 'sw.js' or p.url contains '404' -%}
  {%- assign ext = p.url | split: '.' | last -%}
  {%- if p.url contains '.js' or p.url contains '.json' %}
  '{{ p.url | relative_url }}' + V,
  {%- else %}
  '{{ p.url | relative_url }}',
  {%- endif -%}
  {%- endunless -%}
{%- endfor -%}
{%- for f in site.static_files -%}
  {%- if f.path contains '/assets/' %}
  '{{ f.path | relative_url }}' + V,
  {%- endif -%}
{%- endfor %}
  'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // Add one by one so a single failure (e.g. fonts blocked) does not stop the rest.
    return Promise.all(PRECACHE.map(function (u) {
      var req = u.indexOf('http') === 0 ? new Request(u, { mode: 'no-cors' }) : u;
      return c.add(req).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('micro-links-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;   // external guideline links: leave to the network

  if (req.mode === 'navigate') {
    // Network first, with a short timeout so a weak signal falls back quickly.
    e.respondWith(new Promise(function (resolve) {
      var done = false;
      function fromCache() {
        return caches.match(req, { ignoreSearch: true }).then(function (r) {
          return r || caches.match(url.pathname.replace(/\/?$/, '/'), { ignoreSearch: true }).then(function (r2) {
            return r2 || caches.match(BASE);
          });
        });
      }
      var timer = setTimeout(function () { fromCache().then(function (r) { if (r && !done) { done = true; resolve(r); } }); }, 4000);
      fetch(req).then(function (res) {
        clearTimeout(timer);
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        if (!done) { done = true; resolve(res); }
      }).catch(function () {
        clearTimeout(timer);
        fromCache().then(function (r) { if (!done) { done = true; resolve(r || Response.error()); } });
      });
    }));
    return;
  }

  // Assets and fonts: saved copy first (ignoring the ?v= version), then refresh in the background.
  e.respondWith(caches.match(req, { ignoreSearch: sameOrigin }).then(function (cached) {
    var net = fetch(req).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return cached; });
    return cached || net;
  }));
});
