# Pull official base image.
FROM node:15.9.0-alpine3.13

# Set work directory.
WORKDIR /usr/src/frontend

# Add /usr/src/frontend/node_modules/.bin to $PATH.
ENV PATH /usr/src/frontend/node_modules/.bin:$PATH

# Install npm dependencies without devDependencies.
COPY package.json ./
COPY package-lock.json ./
RUN npm install --only=prod

# Copy files.
COPY . .

CMD ["npm", "start"]