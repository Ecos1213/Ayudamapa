FROM node:22-alpine

RUN apk add --no-cache bash

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy migrations configuration
COPY .pgmigrationsrc .

# Copy source code
COPY src ./src

# Copy database migrations
COPY db ./db

# Copy init script
COPY init.sh .
RUN chmod +x init.sh

# Expose port
EXPOSE 3000

# Start the application
CMD ["bash", "init.sh"]
