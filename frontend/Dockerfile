# Use node image to build static files
FROM node:9-slim as builder
WORKDIR /usr/src/app
# Install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install --production
# Copy frontend files and build
COPY . .
RUN yarn build

# Use nginx to host the static files and mount configuration in docker-compose
FROM nginx:1.13
COPY --from=builder /usr/src/app/build /usr/share/nginx/html