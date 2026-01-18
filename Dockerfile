# Use a slim version of Node for security
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

# Expose the port your Express app uses (usually 3001 or 3000)
EXPOSE 3001

# Run the app
CMD [ "node", "server.js" ]
