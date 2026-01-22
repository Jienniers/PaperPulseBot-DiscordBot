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

# Start the bot
CMD ["node", "index.js"]
