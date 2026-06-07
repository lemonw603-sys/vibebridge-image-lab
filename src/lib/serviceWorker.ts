export function getServiceWorkerUrl(baseUrl: string, appVersion: string) {
  return `${baseUrl}sw.js?v=${encodeURIComponent(appVersion)}`
}

export function installServiceWorkerUpdateReload(navigatorRef: Navigator = navigator, locationRef: Location = window.location) {
  const hadController = Boolean(navigatorRef.serviceWorker.controller)
  let refreshing = false

  navigatorRef.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return
    refreshing = true
    locationRef.reload()
  })
}

type RegisterAppServiceWorkerOptions = {
  navigatorRef?: Navigator
  locationRef?: Location
  baseUrl: string
  appVersion: string
}

export function registerAppServiceWorker({
  navigatorRef = navigator,
  locationRef = window.location,
  baseUrl,
  appVersion,
}: RegisterAppServiceWorkerOptions) {
  installServiceWorkerUpdateReload(navigatorRef, locationRef)
  return navigatorRef.serviceWorker.register(getServiceWorkerUrl(baseUrl, appVersion))
}
