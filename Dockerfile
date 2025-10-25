# # Use Node.js 20 Alpine for smaller image size
# FROM node:20-alpine

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# RUN npm ci --only=production

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# # Expose port
# EXPOSE 5000

# # Set environment variables
# ENV NODE_ENV=production

# # Start the application
# CMD ["npm", "run", "start"]
# Use full Node.js 20 image











FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# RUN npm ci
RUN npm ci

# Copy source code
COPY . .

# Ensure drizzle migrations are in container
COPY drizzle ./drizzle

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]


# FROM node:20-alpine

# WORKDIR /app

# # Use a fast npm registry
# RUN npm config set registry https://registry.npmmirror.com

# # Install system tools required for native modules
# RUN apk add --no-cache python3 make g++

# # Copy dependency files
# COPY package*.json ./

# # ✅ Install all dependencies (including dev) for building
# RUN npm ci --prefer-offline --no-audit --progress=false

# # Copy rest of the project
# COPY . .

# # Build frontend + backend
# RUN npm run build

# # ✅ Optional cleanup: remove devDependencies to reduce image size
# RUN npm prune --omit=dev && apk del python3 make g++

# # Expose app port
# EXPOSE 5000

# # Start production server
# CMD ["npm", "run", "start"]
