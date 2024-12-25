# Use an official PHP runtime as the base image
FROM php:8.1-cli

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html
# ... [previous Dockerfile content]

# Copy .env file
COPY .env /var/www/html/.env

# Install PHP dotenv via Composer if not already installed
RUN composer require vlucas/phpdotenv

# ... [rest of the Dockerfile]

# Copy existing application directory contents
COPY . /var/www/html

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Expose port 10000 (Render's default port)
EXPOSE 10000

# Define the command to run the PHP built-in server
CMD ["php", "-S", "0.0.0.0:10000", "-t", "public"]

