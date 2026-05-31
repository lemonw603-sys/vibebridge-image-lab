#!/bin/sh

DEFAULT_API_URL=${DEFAULT_API_URL:-https://api.vibebridge.top/v1}
DOCKER_LEGACY_API_URL_USED=false
API_PROXY_AVAILABLE=false
API_PROXY_LOCKED=false

escape_sed_replacement() {
    printf '%s' "$1" | sed 's/[&|\\]/\\&/g'
}

escape_js_string() {
    printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

DEFAULT_API_URL_ESCAPED=$(escape_sed_replacement "$(escape_js_string "$DEFAULT_API_URL")")

find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s|__VITE_DEFAULT_API_URL_PLACEHOLDER__|$DEFAULT_API_URL_ESCAPED|g" {} +
find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s|__VITE_API_PROXY_AVAILABLE_PLACEHOLDER__|$API_PROXY_AVAILABLE|g" {} +
find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s|__VITE_API_PROXY_LOCKED_PLACEHOLDER__|$API_PROXY_LOCKED|g" {} +
find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s|__VITE_DOCKER_DEPLOYMENT_PLACEHOLDER__|true|g" {} +
find /usr/share/nginx/html/assets -type f -name "*.js" -exec sed -i "s|__VITE_DOCKER_LEGACY_API_URL_USED_PLACEHOLDER__|$DOCKER_LEGACY_API_URL_USED|g" {} +

sed -i '/# BEGIN API PROXY/,/# END API PROXY/d' /etc/nginx/conf.d/default.conf

exec "$@"
