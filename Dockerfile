# Base image
FROM node:18-alpine

# Install bash and nodemon for development
RUN apk add --no-cache bash && \
    npm install -g nodemon

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Add wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Default command
CMD ["npm", "run", "start"]