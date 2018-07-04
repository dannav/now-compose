SHELL := /bin/bash
.PHONY: releases

all: releases

install_pkg:
	npm i pkg -g

releases: install_pkg
	rm -rf ./releases
	mkdir -p ./releases
	pkg . -t latest-linux,latest-win,latest-macos --out-path ./releases/
	mkdir -p ./releases/linux
	mkdir -p ./releases/mac
	mkdir -p ./releases/win
	mv ./releases/now-compose-linux ./releases/linux/now-compose
	zip ./releases/linux/now-compose-linux.zip ./releases/linux/now-compose
	mv ./releases/now-compose-macos ./releases/mac/now-compose
	zip ./releases/mac/now-compose-mac.zip ./releases/mac/now-compose
	mv ./releases/now-compose-win.exe ./releases/win/now-compose.exe
	zip ./releases/win/now-compose-win.zip ./releases/win/now-compose.exe
