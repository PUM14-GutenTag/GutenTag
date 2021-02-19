# Pull official base image
FROM node:15.9.0-alpine3.13

# set work directory
WORKDIR /usr/src/frontend

# add /usr/src/frontend/node_modules/.bin to $PATH
ENV PATH /usr/src/frontend/node_modules/.bin:$PATH

# install npm dependencies
COPY package.json ./
COPY package-lock.json ./
# dont install devDependencies.
RUN npm install --only=prod

# copy project
COPY . .

CMD ["npm", "start"]