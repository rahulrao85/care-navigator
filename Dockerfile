# Step 1: Build the Vite app
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve using NGINX
FROM nginx:alpine
# Copy the built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run defaults to port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
