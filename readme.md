[![CircleCI](https://circleci.com/gh/dannav/now-compose.svg?style=svg&circle-token=a204b7c6925f4014b03ffed857005beb2b98b97e)](https://circleci.com/gh/dannav/now-compose)

`now-compose` is a command line interface for developing and deploying applications with docker-compose for [zeit/now](https://zeit.co/now).

## Usage

`now-compose` behaves as a wrapper around docker-compose. To get started, you will need docker and docker-compose setup on your machine. To install these dependencies visit [the docker-compose install guide](https://docs.docker.com/compose/install/).

Install `now-compose`:

```
npm i -g now-compose
```

If you're already working on a project using docker-compose you can tell `now-compose` to use it with the `-f` flag. `now-compose` only supports the docker-compose version 3 config syntax. You can learn more about the syntax at the [config reference here](https://docs.docker.com/compose/compose-file/).

_By default, `now-compose` will look for a `now-compose.yml` file in the current working directory._

You can then use `now-compose` as you would use docker-compose. For instance, in a directory with a `now-compose.yml` file:

```
now-compose up -d
```

or if you want to use a `docker-compose.yml` file

```
now-compose -f docker-compose.yml up -d
```

You can view other commands that `now-compose` supports by running:

```
now-compose --help
```

## Example project

To view an example project built with `now-compose` take a look at the [cluster example](./examples/cluster).

## Developing locally with now-compose

Using `now-compose` is identical to using docker-compose except for a small set of differences.

The first is networking between containers defined in docker-compose. Usually for services defined in a `docker-compose.yml` file you would make requests to another service by making a request to a url that has the service's hostname in the url.

```yaml
version: "3"
services:
  web:
    build: ./web
    links:
      - api
  api:
    build: ./api
    ports:
      - 3001:3001
```

i.e. in the above example `web` can make a request to `api` by requesting `http://api`. `now-compose` will handle this for you, but you will want to reference the urls defined in environment variables that `now-compose` will provide to your application.

| Environment Var   | Description                                                     | Example        |
| ----------------- | --------------------------------------------------------------- | -------------- |
| `NOW_HOST_<NAME>` | The url of the service                                          | `NOW_HOST_API` |
| `NOW_PORT_<NAME>` | The first port defined in your services `ports` config property | `NOW_PORT_API` |

---

The second difference from docker-compose, is that all services defined in `now-compose.yml` must have a `build` property defined that points to the location of that service's `Dockerfile`. Since a `Dockerfile` must be defined for deployments to [zeit/now](https://zeit.co/now). Any services that do not contain a `build` (i.e. use an image) property will run locally, but during deployment they will be skipped.

_This allows you to still setup a database locally for development purposes. But skips its deployment._

---

The third difference is that services defined in `now-compose.yml` must not contain special characters. Only letters, digits and '_' are allowed.

## Deploying to zeit now

Before you can deploy a project using `now-compose` to [zeit/now](https://zeit.co/now), you need to provide
and API token to use for your account.

Visit the [token creation screen](https://zeit.co/account/tokens) and generate a new one for use by `now-compose`.

You can then deploy your application with:

```
now-compose deploy --apiKey=<your api token>
```

_You can also provide `now-compose` an api token by setting the environment variable `NOW_API_KEY`._


A deployment will be created for each service defined in `now-compose.yml` in order of the `depends_on` property set for each service in `now-compose.yml`.

Any services that are `linked` (using the "links" property in your application's config) will have the environment variables `NOW_HOST_<SERVICENAME>` set to the deployment url of linked services. `NOW_PORT_<SERVICENAME>` will be `443` since zeit only serves requests over https.

Happy Developing 🎉

## Contributing

All contributions are welcome.

* Fork this repository to your own GitHub account and then clone it to your local device.
* Uninstall `now-compose` if it's already installed: `npm uninstall -g now-compose`
* Link it to the global module directory: `npm link`

## Roadmap

`now-compose` is still a work in progress and is considered in an "experimental" phase. However, don't let that deter you from actually using it. Once the codebase matures expect support for `static` and `Node.js` projects for local development and deployment.

## Author

Danny Navarro ([@danny_nav](https://twitter.com/danny_nav))