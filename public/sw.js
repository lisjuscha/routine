const CACHE = 'routine-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    await self.clients.claim()
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach(c => c.navigate(c.url))
  })())
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  if (url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()))
          return res
        })
        .catch(() => caches.match(e.request))
    )
    return
  }

  if (url.pathname.includes('apple-touch-icon') || url.pathname.includes('icon-192') || url.pathname.includes('icon-512')) {
    e.respondWith(fetch(e.request))
    return
  }

  e.respondWith(
    caches.match(e.request).then(cached =>
      cached ?? fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()))
        return res
      })
    )
  )
})
