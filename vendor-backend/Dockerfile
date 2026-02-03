# Use Node.js
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest backend code
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
