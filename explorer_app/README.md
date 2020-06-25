# Stratnames explorer
Stratnames explorer

## Pre-requisites 

* yarn
* npm
or 
* docker, docker-compose

## Quick start

```
$ yarn install
$ yarn start
```
or 
```
docker-compose up -d 
```

## Deploy to s3

Before deploying ensure you have awscli and instantiated valid aws cli environmental variables to authenticate to AWS.

```
$ yarn build
$ yarn deploy
```