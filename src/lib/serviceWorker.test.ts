import { describe, expect, test, vi } from 'vitest'
import * as serviceWorker from './serviceWorker'

function createNavigatorMock() {
  const listeners = new Map<string, () => void>()
  return {
    serviceWorker: {
      controller: {},
      register: vi.fn(() => Promise.resolve()),
      addEventListener: vi.fn((event: string, listener: () => void) => {
        listeners.set(event, listener)
      }),
      emit(event: string) {
        listeners.get(event)?.()
      },
    },
  }
}

describe('service worker registration', () => {
  test('registers versioned service worker and reloads once when a new worker takes control', () => {
    const navigatorRef = createNavigatorMock()
    const locationRef = { reload: vi.fn() }

    expect(typeof serviceWorker.registerAppServiceWorker).toBe('function')

    serviceWorker.registerAppServiceWorker({
      navigatorRef: navigatorRef as unknown as Navigator,
      locationRef: locationRef as unknown as Location,
      baseUrl: './',
      appVersion: '0.5.4',
    })

    expect(navigatorRef.serviceWorker.register).toHaveBeenCalledWith('./sw.js?v=0.5.4')

    navigatorRef.serviceWorker.emit('controllerchange')
    navigatorRef.serviceWorker.emit('controllerchange')

    expect(locationRef.reload).toHaveBeenCalledTimes(1)
  })
})
