# Setup
install:
	git submodule init
	git submodule update
	npm install

# Building JS
.PHONY:
	gulp

debug:
	npm run debug
