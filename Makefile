# You could also set to "wget -o -"
GET="curl"
MOCHA=./node_modules/.bin/mocha

all: README.md

test: test/TurtleTests/manifest.ttl
	$(MOCHA)

test/TurtleTests/manifest.ttl: | test/TurtleTests

test/TurtleTests:
	$(GET) 'http://www.w3.org/2013/TurtleTests/TESTS.tar.gz' | tar -zx -C test -f -

# Edit with:
# $ ijsnotebook README.ipynb
# `cat -s` collapses multiple newlines into a single newline
README.md: README.ipynb
	jupyter-nbconvert $< --to markdown --stdout | sed 's/^var /const /' | cat -s > $@

.PHONY: test
