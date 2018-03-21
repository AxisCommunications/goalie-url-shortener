FROM nginx:1.13

# Install Custom nginx config
COPY nginx.conf /etc/nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy Go frontend assets
COPY build /usr/share/nginx/html
