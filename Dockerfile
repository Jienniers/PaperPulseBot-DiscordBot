# Use official Node.js LTS image
FROM node:alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the project
COPY . .

# Make the startup script executable
RUN chmod +x start.sh

# Start the bot using the startup script
CMD ["sh", "start.sh"]
