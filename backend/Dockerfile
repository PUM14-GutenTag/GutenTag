# Pull official base image.
FROM python:3.9.1-alpine3.13

# Set work directory.
WORKDIR /usr/src/backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies.
RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev libffi-dev netcat-openbsd

# install python dependencies.
RUN pip install --upgrade pip
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy files.
COPY . .

ENTRYPOINT ["./entrypoint.sh"]