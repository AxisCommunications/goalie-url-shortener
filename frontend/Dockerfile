# Use node image to build static files
FROM node:10-alpine as builder
WORKDIR /usr/src/app
# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean
# Copy frontend files and build
COPY public ./public
COPY src ./src
RUN yarn build

# Use nginx to host the static files, configuration inserted via docker-compose
FROM nginx:1.15-alpine
# Get built frontend files from the node container
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf