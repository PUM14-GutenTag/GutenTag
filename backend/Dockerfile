# pull official base image
FROM python:3.9.1-alpine

# set work directory
WORKDIR /usr/src/backend

# Expose port 5000. Still need to map port 5000
# when running the container.
EXPOSE 5000

# set environment variables
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1
# ENV FLASK_APP app.py
# ENV FLASK_ENV development

RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . .

RUN ls

CMD [ "python", "run.py"]