# Use the official Nginx image from Docker Hub
FROM nginx:alpine

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy game files to the default Nginx public directory
COPY html /usr/share/nginx/html

# Expose port 80 to the host
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
