FROM php:7.2-apache

# Enable mod_rewrite
RUN a2enmod rewrite

# Configure Apache to allow .htaccess
RUN sed -i '/<Directory \/var\/www\/html>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy application files
COPY src/ /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html