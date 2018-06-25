PHONY: docker
SHELL := /bin/bash

install_deps:
	npm i pkg -g
	cd ./locations_api && npm i
	cd ./people_api && npm i
	cd ./web && npm i

build_locations:
	rm -rf ./locations_api/build
	pkg ./locations_api --targets latest-linux-x64 --output ./locations_api/build/api

build_people:
	rm -rf ./people_api/build
	pkg ./people_api --targets latest-linux-x64 --output ./people_api/build/api

build_web:
	rm -rf ./web/build
	pkg ./web --targets latest-linux-x64 --output ./web/build/web

# install dependencies, pkg node apps
docker: install_deps build_locations build_people build_web
	@echo -e "\ndone :-)\n"