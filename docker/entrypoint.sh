#!/bin/sh
set -e

# Dynamically set port for Render
PORT=${PORT:-10000}
sed -i "s/listen 10000;/listen ${PORT};/g" /etc/nginx/http.d/default.conf

# Cache Laravel configuration & routes for production
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
