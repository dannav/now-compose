PHONY: docker
SHELL := /bin/bash

install_deps:
	npm i pkg -g

build_api:
	pkg ./api --targets latest-linux-x64 --output ./api/build/api

build_web:
	pkg ./web --targets latest-linux-x64 --output ./web/build/web

# install dependencies, pkg node apps, and build docker containers
docker: install_deps build_api build_web
	docker build -t now-compose-web ./web
	docker build -t now-compose-api ./api
	@echo -e "\ndone :-)\n"