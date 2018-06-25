This project is an example of how you can setup a microservice architecture
locally using now-compose.

You can view this example project host on zeit now at [https://web-fmecyzwicu.now.sh/](https://web-fmecyzwicu.now.sh/)

---

This architecture is broken up into 3 microservices:

- people-api
  - a microservice that returns a list of people as json
- locations-api
  - a microservice that returns a list of locations as json
- web
  - a microservice that makes http requests to the people and locations api and responds with the merged json.

## Preparing and running the project

For this example [zeit/pkg](https://github.com/zeit/pkg) is used to compile all
Node.js services into a binary for linux. Which we will ultimately copy it into our
Docker containers during the container building process.

For details on how this is done. Checkout the [makefile](./makefile).

The following steps will need to be run from a terminal in this directory:

1.  run `make` to generate all binaries in their project's `build` folder.
2.  run `now-compose up` to spin up the microservices and get a stream of logs to stdout.

## Configuration of each service

The following are the container configurations of each service:

### people-api

- bound to: `localhost:3001`

### locations-api

- bound to: `localhost:3002`

### web

- bound to: `localhost:3000`

## Deploying to zeit/now

Make sure that you generate a new API token for now-compose to use.

Generate an api token for `now-compose` to use [in the zeit dashboard](https://zeit.co/account/tokens)

After running `make` you can deploy to zeit now with `now-compose deploy --apiKey=<your api token here>`.

When the services are finished deploying you should get two urls back for each service.

---

## Modifications

Builds on containers will be cached by default. If you make modifications and changes
aren't seen with `now-compose up` you can force a rebuild of all containers by passing
the `--no-cache` flag to the up command: `now-compose up --no-cache`.
