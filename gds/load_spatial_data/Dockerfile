FROM osgeo/gdal:alpine-small-latest


RUN apk update && apk add --no-cache postgresql-client && apk add bash


RUN mkdir -p /app
WORKDIR /app
COPY . /app

