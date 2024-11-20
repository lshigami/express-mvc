FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Set production environment
ENV NODE_ENV=production

# Validate and expose port
ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

# Start the application
CMD ["node", "app.js"]