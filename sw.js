// 码表离线缓存：在线时优先用网络（保证更新），离线时回退缓存
var CACHE = 'speedometer-v4';
var ASSETS = ['./', './index.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      if (resp && resp.ok) {
        var clone = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
      }
      return resp;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
        return cached || Response.error();
      });
    })
  );
});
