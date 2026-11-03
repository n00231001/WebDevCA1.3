FROM node:24-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source and database migrations
COPY src/ ./src/
COPY db/ ./db/

# Create directory for local uploads
RUN mkdir -p uploads && chown -R node:node /app

# Run as a non-root user
USER node

EXPOSE 3000

CMD ["npm", "start"]