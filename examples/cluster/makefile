PHONY: docker
SHELL := /bin/bash

install_deps:
	npm i pkg -g
	cd ./api && npm i
	cd ./web && npm i

build_api:
	rm -rf ./api/build
	pkg ./api --targets latest-linux-x64 --output ./api/build/api

build_web:
	rm -rf ./web/build
	pkg ./web --targets latest-linux-x64 --output ./web/build/web

# install dependencies, pkg node apps
docker: install_deps build_api build_web
	@echo -e "\ndone :-)\n"