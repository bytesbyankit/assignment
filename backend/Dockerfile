# --- Build Stage ---
FROM node:20-alpine AS builder

# Install necessary build tools and dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

# Install runtime dependencies for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy Prisma schema and generated binaries
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy the built application from the builder
COPY --from=builder /app/dist ./dist

# Use a non-root user for security
USER node

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
