This project is an example of how you can setup a microservice architecture
locally using now-compose.

This architecture is broken up into 3 microservices:

- db - a mysql database with example data
- api - a microservice that queries `db` and returns all data as json
- web - a microservice that makes an http request to `api` to display all data in `db`

## Preparing the project

For this example [zeit/pkg](https://github.com/zeit/pkg) is used to compile all
Node.js services into a binary for linux. Which we will ultimately copy into our
Docker containers during the container building process.

The following steps will need to be run from a terminal in this directory:

1.  run `make` to generate all binaries in their project's `build` folder.
2.  run `now-compose up` to spin up the microservices and get a stream of logs from them

## Configuration of each service

The following are the container configurations of each service:

### db

- bound to: `localhost:3306`
- mysql db: `example`
- mysql username: `example`
- password: `example`

### api

- bound to: `localhost:3001`

### web

- bound to: `localhost:3000`

---

## Modifications

Builds on containers will be cached by default. If you make modifications and changes
aren't seen with `now-compose up` you can force a rebuild of all containers by passing
the `--no-cache` flag to the up command: `now-compose up --no-cache`.
