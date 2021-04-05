# pull official base image
FROM python:3.9.1-alpine3.13

# set work directory
WORKDIR /usr/src/backend

# Install system dependencies
RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev libffi-dev

# install python dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . .

CMD [ "python", "run.py"]