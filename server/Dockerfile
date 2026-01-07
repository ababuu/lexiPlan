# Use Node 20.18-alpine for a lightweight, stable production environment
FROM node:20.18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (use --omit=dev in production for smaller images)
RUN npm install

# Copy source code
COPY . .

# Expose the port your Express app uses
EXPOSE 5000

# Railway will automatically set NODE_ENV to production, 
# but we can also use 'npm start' which should point to 'node index.js'
CMD ["npm", "start"]