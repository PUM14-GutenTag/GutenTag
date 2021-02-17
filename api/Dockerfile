# pull official base image
FROM python:3.9.1

# set work directory
WORKDIR /usr/src/api

# Expose port 5000
EXPOSE 5000

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV FLASK_APP app.py
ENV FLASK_ENV development

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . .


CMD [ "flask", "run", "-h", "0.0.0.0", "-p", "5000" ]