FROM node:20-alpine

# Install security updates
RUN apk --no-cache add dumb-init

# Create app directory with proper permissions
WORKDIR /app
RUN chown node:node /app

# Switch to node user early
USER node

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy entrypoint script and make executable
COPY --chown=node:node entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Copy source code
COPY --chown=node:node src/ ./src/

EXPOSE 3001

CMD ["./entrypoint.sh"]