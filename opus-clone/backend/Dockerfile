# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json if used)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# App listens on a port defined by process.env.PORT, which will be set by App Platform
# EXPOSE directive is more for documentation / inter-container communication.
# App Platform will handle routing to the correct internal port.

# Define the command to run your app
CMD ["node", "server.js"]
