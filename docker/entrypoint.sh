#!/bin/sh
set -e

# Dynamically set port for Render
PORT=${PORT:-10000}
sed -i "s/listen 10000;/listen ${PORT};/g" /etc/nginx/http.d/default.conf

# Ensure storage directory structure and permissions
mkdir -p /var/www/html/storage/framework/views /var/www/html/storage/framework/cache /var/www/html/storage/framework/sessions /var/www/html/storage/logs
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Clear cached config so Laravel reads live environment variables from Render
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
