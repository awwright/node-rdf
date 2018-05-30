# You could also set to "wget -o -"
GET="curl"
MOCHA=./node_modules/.bin/mocha

all:

test: test/TurtleTests/manifest.ttl
	$(MOCHA)

test/TurtleTests/manifest.ttl: | test/TurtleTests

test/TurtleTests:
	$(GET) 'http://www.w3.org/2013/TurtleTests/TESTS.tar.gz' | tar -zx -C test -f -

.PHONY: test
