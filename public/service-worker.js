self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
// No fetch handler - requests go directly to the network