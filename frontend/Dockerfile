# Pull official base image.
FROM node:15.9.0-alpine3.13

# Set work directory.
WORKDIR /usr/src/frontend

ARG REACT_APP_SERVER_NAME
ENV REACT_APP_SERVER_NAME $REACT_APP_SERVER_NAME

ARG REACT_APP_MODE
ENV REACT_APP_MODE $REACT_APP_MODE

# Add /usr/src/frontend/node_modules/.bin to $PATH.
ENV PATH /usr/src/frontend/node_modules/.bin:$PATH

# Install npm dependencies without devDependencies.
COPY package.json ./
COPY package-lock.json ./
RUN npm install --only=prod

# Copy files.
COPY . .