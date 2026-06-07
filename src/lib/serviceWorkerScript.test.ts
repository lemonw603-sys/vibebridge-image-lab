import { describe, expect, test, vi } from 'vitest'
import swCode from '../../public/sw.js?raw'

function loadServiceWorkerScript(cacheKeys = ['vibebridge-image-lab-v0.1.0', 'vibebridge-image-lab-v0.5.4']) {
  const listeners = new Map<string, (event: { waitUntil: (promise: Promise<unknown>) => void }) => void>()
  const client = { url: 'https://vibebridge-image-lab.pages.dev/', navigate: vi.fn(() => Promise.resolve()) }
  const externalClient = { url: 'https://example.com/', navigate: vi.fn(() => Promise.resolve()) }
  const selfRef = {
    location: { href: 'https://vibebridge-image-lab.pages.dev/sw.js?v=0.5.4', origin: 'https://vibebridge-image-lab.pages.dev' },
    skipWaiting: vi.fn(),
    clients: {
      claim: vi.fn(() => Promise.resolve()),
      matchAll: vi.fn(() => Promise.resolve([client, externalClient])),
    },
    addEventListener: vi.fn((event: string, listener: (event: { waitUntil: (promise: Promise<unknown>) => void }) => void) => {
      listeners.set(event, listener)
    }),
  }
  const cachesRef = {
    keys: vi.fn(() => Promise.resolve(cacheKeys)),
    delete: vi.fn(() => Promise.resolve(true)),
    open: vi.fn(),
  }

  Function('self', 'caches', 'URL', swCode)(selfRef, cachesRef, URL)

  return { listeners, selfRef, cachesRef, client, externalClient }
}

describe('service worker script', () => {
  test('activate removes old caches, claims clients, and refreshes same-origin pages only', async () => {
    const { listeners, selfRef, cachesRef, client, externalClient } = loadServiceWorkerScript()
    let activation: Promise<unknown> | undefined

    listeners.get('activate')?.({
      waitUntil: (promise) => {
        activation = promise
      },
    })

    await activation

    expect(cachesRef.delete).toHaveBeenCalledWith('vibebridge-image-lab-v0.1.0')
    expect(cachesRef.delete).not.toHaveBeenCalledWith('vibebridge-image-lab-v0.5.4')
    expect(selfRef.clients.claim).toHaveBeenCalledOnce()
    expect(selfRef.clients.matchAll).toHaveBeenCalledWith({ type: 'window', includeUncontrolled: true })
    expect(client.navigate).toHaveBeenCalledWith(client.url)
    expect(externalClient.navigate).not.toHaveBeenCalled()
  })

  test('activate also refreshes on first install (no old caches)', async () => {
    const { listeners, selfRef, client } = loadServiceWorkerScript(['vibebridge-image-lab-v0.5.4'])
    let activation: Promise<unknown> | undefined

    listeners.get('activate')?.({
      waitUntil: (promise) => {
        activation = promise
      },
    })

    await activation

    expect(selfRef.clients.claim).toHaveBeenCalledOnce()
    expect(client.navigate).toHaveBeenCalledWith(client.url)
  })
})
