# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the Vite React app and bundle the server into a single JS file
RUN npm run build && \
    node_modules/.bin/esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=dist/server.js

# Production stage
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]
