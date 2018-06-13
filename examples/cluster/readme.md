# Cluster Example Project

This project is an example of how you could setup a cluster of microservices to
develop locally with now-compose. This example shows you how you could link together
many microservices for use with now-compose.

This microservice cluster is broken up into 3 services.

## db

A mysql database with example data

## api

An api that returns all rows of the `people` table in `db`.

## web

A service that requests data from the api and returns it for all responses

# Getting Started

1.  run `make` to build generate binaries for services and build docker containers
2.  run `now-compose up` to setup environment locally
3.  test deployment with `now-compose deploy`

# Making Modifications

Builds on containers will be cached by default. If you make modifications and changes
aren't seen with `now-compose up` you can force a rebuild of containers with
`now-compose up --no-cache`.
