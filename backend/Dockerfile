FROM node:20-alpine AS builder
WORKDIR /app
# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
