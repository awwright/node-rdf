# RDF Interfaces implementation

This package is a set of simple utilities aimed at making it simple to represent RDF data.

RDF can be considered a superset of typical link relationships found on the Web: It allows a collection of directional relationships from some _subject_, with a relationship _predicate_, to some _object_.

On the Web, normally all three are documents. In RDF, the object may also be a literal string containing data; and the subject or object may be an anonymous resource called a _blank node_.

The `NamedNode`, `BlankNode`, and `Literal` objects represent the fundemental types of data that can be found in an RDF Statement. Statements are represented as `Triple`.

RDF doesn't define any representation of a blank nodes, except for the fact it is possible to compare two blank nodes to see if they are the same. In RDF Interfaces, a bnode is uniquely represented as an instance of `BlankNode`. This interface optionally allows a label, this is primarially for debugging, and two instances of BlankNodes with the same label may still represent different blank nodes.

The library also exposes a function to decorate the builtin ECMAScript protoypes with methods.

## Features

### Represent RDF nodes

The `NamedNode`, `BlankNode`, and `Literal` represent nodes in an RDF graph.

```javascript
var namednode, blanknode, literal;
namednode = rdf.environment.createNamedNode('http://example.com/').toNT()
/**/ '<http://example.com/>'
blanknode = rdf.environment.createBlankNode().toNT()
/**/ '_:b1'
literal = rdf.environment.createLiteral('plain string')
/**/ '"plain string"'
namednode.equals(literal)
/**/ false
```

### Represent RDF statements

A `Triple` instance represents an edge in an RDF graph (also known as a Statement).

```javascript
var statement1 = rdf.environment.createTriple(blanknode, namednode, literal);
statement1.toNT()
/**/ '_:b1 <http://example.com/> "plain string" .'
```

### Represent RDF graphs

A `Graph` instance stores and queries.

```javascript
var graph = rdf.environment.createGraph();
graph.add(statement1);
graph.add(rdf.environment.createTriple(blanknode, rdf.rdfsns('label'), rdf.environment.createLiteral('Price')));
graph.add(rdf.environment.createTriple(blanknode, rdf.rdfns('value'), rdf.environment.createLiteral('10.0', rdf.xsdns('decimal'))));
graph.length
/**/ 3
var results = graph.match(namednode, null, null);
results.length
/**/ 1
results.forEach(function(triple){ console.log(triple); });
```

### Compare nodes, triples, and graphs for equality

Use the `NamedNode#equals`, `BlankNode#equals`, `Literal#equals`, `Triple#equals`, and `Graph#equals` methods to compare equality.

Literals verify codepoint, datatype, and language tag equality. Triples verify equality of each three nodes.

Graphs test for isomorphism, that there's a mapping that can map the blank nodes in one graph to the blank nodes in the other one-to-one. If so isomorphic, it returns the mapping.

```javascript
var graph2 = rdf.environment.createGraph();
graph2.add(statement1);
graph2.add(rdf.environment.createTriple(blanknode, rdf.rdfsns('label'), rdf.environment.createLiteral('Price')));
graph2.add(rdf.environment.createTriple(blanknode, rdf.rdfns('value'), rdf.environment.createLiteral('10.0', rdf.xsdns('decimal'))));
graph.equals(graph2)
/**/ { "_:b1": BlankNode("_:b2") }

```

### Simplify RDF namespaces

Use the `ns` function to create a URI factory.

Use the builtin `rdfns`, `rdfsns`, and `xsdns` functions too.

```javascript
var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
foaf('knows')
/**/ 'http://xmlns.com/foaf/0.1/knows'
rdf.rdfsns('label')
/**/ 'http://www.w3.org/2000/01/rdf-schema#label'
```

### Query information from RDF sources

Use the ResultSet interface to quickly drill into the specific data you want:

```javascript
var g = e.createGraph();
g.add(e.createTriple(e.createNamedNode('http://example.com/~a'), e.createNamedNode(foaf('knows')), e.createNamedNode('http://example.com/~b')));
g.add(e.createTriple(e.createNamedNode('http://example.com/~a'), e.createNamedNode(foaf('knows')), e.createNamedNode('http://example.com/~c')));
g.add(e.createTriple(e.createNamedNode('http://example.com/~a'), e.createNamedNode(foaf('knows')), e.createNamedNode('http://example.com/~d')));
g.add(e.createTriple(e.createNamedNode('http://example.com/~a'), e.createNamedNode(foaf('givenname')), e.createLiteral('Alice')));
g.add(e.createTriple(e.createNamedNode('http://example.com/~b'), e.createNamedNode(foaf('givenname')), e.createLiteral('Bob')));
g.add(e.createTriple(e.createNamedNode('http://example.com/~c'), e.createNamedNode(foaf('givenname')), e.createLiteral('Carol')));
g.add(e.createTriple(e.createNamedNode('http://example.com/~d'), e.createNamedNode(foaf('givenname')), e.createLiteral('Dan')));

// Get the name of Alice
var aliceName = g.reference(e.createNamedNode('http://example.com/~a'))
	.rel(e.createNamedNode(foaf('givenname')))
	.one()
	.toString();
aliceName
/**/ 'Alice'

// Get me all the names of everyone who Alice knows
var friendNames = g.reference(e.createNamedNode('http://example.com/~a'))
	.rel(e.createNamedNode(foaf('knows')))
	.rel(e.createNamedNode(foaf('givenname')))
	.toArray()
	.sort()
	.join(', ');

friendNames
/**/ 'Bob, Carol, Dan'
```

### Read RDF data sources as native data types

Use `Literal#valueOf` to convert from lexical data space to native value space:

```javascript
rdf.environment.createLiteral('2018-06-04T23:11:25Z', rdf.xsdns('date')).valueOf()
/**/ Date("2018-06-04T23:11:25.000Z")

rdf.environment.createLiteral('24.440', rdf.xsdns('decimal')).valueOf()
/**/ 24.44

rdf.environment.createLiteral('1', rdf.xsdns('boolean')).valueOf()
/**/ true

g.add(e.createTriple(e.createNamedNode('http://example.com/~a'), e.createNamedNode(foaf('age')), e.createLiteral('26', rdf.xsdns('integer'))));
g.add(e.createTriple(e.createNamedNode('http://example.com/~b'), e.createNamedNode(foaf('age')), e.createLiteral('36', rdf.xsdns('integer'))));
g.add(e.createTriple(e.createNamedNode('http://example.com/~c'), e.createNamedNode(foaf('age')), e.createLiteral('46', rdf.xsdns('integer'))));
g.add(e.createTriple(e.createNamedNode('http://example.com/~d'), e.createNamedNode(foaf('age')), e.createLiteral('56', rdf.xsdns('integer'))));
// sum the ages of everyone that Alice knows
var friendAge = g.reference(e.createNamedNode('http://example.com/~a'))
	.rel(e.createNamedNode(foaf('knows')))
	.rel(e.createNamedNode(foaf('age')))
	.reduce(function(a, b){ return a.valueOf() + b; }, 0);

friendAge
/**/ 138
```

### Compose RDF graphs as native Objects

Use the `rdf.parse` function to cast a native object into a graph:

```javascript
var rdf = require('rdf');
var env = rdf.environment;
// the @id, @context, and @vocab keywords work like in JSON-LD
// string values are assumed to be URIs, unless decorated
var document = rdf.parse({
	'@id': 'http://webr3.org/#me',
	'@context': {
		'@vocab': 'http://xmlns.com/foaf/0.1/',
		'dbr': 'http://dbpedia.org/resource/',
		'dbp': 'http://dbpedia.org/property/',
		'foaf': 'http://xmlns.com/foaf/0.1/',
	},
	a: 'foaf:Person', // a CURIE
	foaf$name: env.createLiteral('Nathan'),                        // a String, and an RDF Plain Literal
	foaf$age: new Date().getFullYear() - 1981,                     // a Number, and a Typed Literal with the type xsd:integer
	foaf$holdsAccount: {                                           // an Object, with a BlankNode reference for the .id
		label: rdf.environment.createLiteral("Nathan's twitter account", 'en'), // a Literal
		accountName: env.createLiteral('webr3'),                    // noticed that you don't need the prefixes yet?
		homepage: 'http://twitter.com/webr3'
	},
	foaf$nick: [env.createLiteral('webr3'), env.createLiteral('nath')], // an Array, also a list of values, like in turtle and n3
	foaf$homepage: 'http://webr3.org/',                             // A full IRI
}, 'http://webr3.org/#me');
console.log(document.n3());
```

This produces:

```
<http://webr3.org/#me>
	rdf:type foaf:Person;
	foaf:name "Nathan";
	foaf:age 37;
	foaf:holdsAccount [
		foaf:label "Nathan's twitter account"@en;
		foaf:accountName "webr3";
		foaf:homepage <http://twitter.com/webr3>
		];
	foaf:nick "webr3", "nath";
	foaf:homepage <http://webr3.org/> .
```

Use the `graphify` method to produce an `rdf.Graph` from the data:

```
var docGraph = document.graphify();
docGraph.forEach(function(triple){ console.log(triple.toString()); });
```

This produces:

```
<http://webr3.org/#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
<http://webr3.org/#me> <http://xmlns.com/foaf/0.1/name> "Nathan" .
<http://webr3.org/#me> <http://xmlns.com/foaf/0.1/age> "37"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://webr3.org/#me> <http://xmlns.com/foaf/0.1/holdsAccount> _:b2 .
_:b2 <http://xmlns.com/foaf/0.1/label> "Nathan's twitter account"@en .
_:b2 <http://xmlns.com/foaf/0.1/accountName> "webr3" .
_:b2 <http://xmlns.com/foaf/0.1/homepage> <http://twitter.com/webr3> .
<http://webr3.org/#me> <http://xmlns.com/foaf/0.1/homepage> <http://webr3.org/> .
<http://webr3.org/#me> <http://xmlns.com/foaf/0.1/nick> "webr3" .
<http://webr3.org/#me> <http://xmlns.com/foaf/0.1/nick> "nath" .
```


### Manage documents with RDF data

Use the `RDFEnvironment`, `Profile`, `TermMap`, and `ProfileMap` interfaces to work with RDF documents that think in terms of CURIEs and Terms.

Here's an example to take an RDF graph, and output a Turtle document with the prefixes applied:

```javascript
var profile = env.createProfile();
profile.setPrefix('rdf', rdf.rdfns(''));
profile.setPrefix('w', 'http://webr3.org/#');
profile.setPrefix('f', 'http://xmlns.com/foaf/0.1/');
var turtle = docGraph.toArray().map(function(stmt){
	return stmt.subject.n3(profile) + ' ' + stmt.predicate.n3(profile) + ' ' + stmt.object.n3(profile) + " .\n";
}).join('')
console.log(profile.n3());
console.log(docGraph.n3(profile));
```

This produces:

```
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix w: <http://webr3.org/#> .
@prefix f: <http://xmlns.com/foaf/0.1/> .
w:me rdf:type f:Person .
w:me f:name "Nathan" .
w:me f:age xsd:integer .
w:me f:holdsAccount _:b2 .
_:b2 f:label "Nathan's twitter account"@en .
_:b2 f:accountName "webr3" .
_:b2 f:homepage <http://twitter.com/webr3> .
w:me f:homepage <http://webr3.org/> .
w:me f:nick "webr3" .
w:me f:nick "nath" .
```


### Use RDF data types as native data types

If you think `rdf.environment.createLiteral` is too verbose, enable builtins mode. This amends the prototype of primitives like `String`:

```javascript
rdf.setBuiltins();

"http://example.com/".toNT()
/**/ '<http://example.com/>'
"The Hobbit".l('en-GB').toNT()
/**/ '"The Hobbit"@en-GB'
"0.4".tl(rdf.xsdns('decimal')).toNT()
/**/ '"0.4"^^<http://www.w3.org/2001/XMLSchema#decimal>'

rdf.unsetBuiltins();
```


### Native support for RDF1.1 semantics

The domains of the functions ensure constistency with all the other applications found in the RDF universe.

`Literal` treats xsd:string as no datatype, and treats any language literal as rdf:langString. The RDF1.1 datatype is available through the `Literal#datatypeIRI` property.

```
var literal = env.createLiteral('Foo');
literal.datatype
/**/ undefined
literal.datatypeIRI
/**/ 'http://www.w3.org/2001/XMLSchema#string'

var literal = env.createLiteral('Foo', '@en');
literal.datatype
/**/ undefined
literal.datatypeIRI
/**/ 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'

var literal = env.createLiteral('Foo', rdf.xsdns('string'));
literal.datatype
/**/ undefined
literal.datatypeIRI
/**/ 'http://www.w3.org/2001/XMLSchema#string'
```

The data model is enforced in the domain of each of the functions; `Triple` doesn't allow bnodes as predicates, for example:

```javascript
env.createTriple(env.createBlankNode(), env.createBlankNode(), env.createBlankNode());
# Error: predicate must be a NamedNode
#     at new Triple (rdf/lib/RDFNode.js)
#     at RDFEnvironment.exports.RDFEnvironment.createTriple (rdf/lib/RDFEnvironment.js)
#     at handleRequest (index.js)
```

### Public Domain unlicensed

Use this library in whatever application you want! Give credit when you do so, or don't (but preferably the former). Use it to take over the world, or don't (but preferably the latter).


## About

An RDF Interfaces implementation in ECMAScript, primarially designed for Node.js, to implement RDF datatypes with Javascript types and provide related APIs and in-memory utilities.

This implements:

* http://www.w3.org/TR/2012/NOTE-rdf-interfaces-20120705/ (Working Group Note)
* http://www.w3.org/TR/2014/REC-turtle-20140225/ (Recommendation)
* http://www.w3.org/TR/2014/REC-n-triples-20140225/ (Recommendation)

See also:

* http://www.w3.org/TR/2012/NOTE-rdfa-api-20120705/ (Working Group Note)
* http://www.w3.org/TR/2012/NOTE-rdf-api-20120705/ (Working Group Note)
* http://www.w3.org/TR/2014/NOTE-rdf11-primer-20140225/ (Working Group Note)

Implementation largely adapted from webr3's js3, rdfa-api, and rdf-api implementations:

* https://github.com/webr3/rdfa-api
* https://github.com/webr3/js3

This is free and unencumbered software released into the public domain. For information, see <http://unlicense.org/>.

## Usage

The ultimate documentation is the source code. The lib/rdf.js file should be especially useful.

### RDFNode

`rdf.Triple`, `rdf.RDFNode`, `rdf.NamedNode`, `rdf.BlankNode`, `rdf.Literal` are implemented as defined under [RDF Interfaces: Basic Node Types](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#basic-node-types).

For parsing the IRI and converting to a URI that can be used in an HTTP request, see the [IRI package](https://github.com/Acubed/node-iri).

### Graph

An implementation of [RDF Interfaces: Graph](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Graph) that stores triples in three indexes for fast querying.

Graphs in this package are uniquely identified by their instance, and are mutable during execution. Methods with a return value are pure, methods that are mutating have no return value.

#### new Graph

Creates an empty in-memory RDF graph.

#### Graph#add(Triple triple)

Adds a triple to the Graph, if it doesn't already exist.

#### Graph#remove(Triple triple)

Removes the given triple from the Graph if it exists.

#### Graph#removeMatches(subject, predicate, object)

Removes the given triple from the Graph if it exists.

#### Graph#toArray()

Returns an array of Triples currently in the Graph.

#### Graph#some(function callback)

Same behavior as `Array#some`: Evaluates `callback` over each Triple in the Graph, and returns true if the callback returns truthy for any of them.

#### Graph#every(function callback)

Same behavior as `Array#every`: Evaluates `callback` over each Triple in the Graph, and returns true if the callback returns truthy for all of them.

#### Graph#filter(function callback)

Same behavior as `Array#filter`: Evaluates `callback` over each Triple in the Graph, and returns a Graph with the triples that evaluated truthy.



### TurtleParser

An implementation of [the Data parser API of RDF Interfaces](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#parsing-and-serializing-data).

	var turtleParser = new rdf.TurtleParser(environment);
	turtleParser.parse(turtle, callback, base, filter, graph);

Where:

* `environment` is the optional RDF Environment that will resolve prefixes and create bnodes. If left out, a new, empty environment will be created. The enviornment is accessible from the `environment` property.
* `turtle` is the document body to be processed.
* `callback` is an optional function(Graph) to be called when processing is completed. This should normally be undefined, the parser is fully synchronous and processing is completed after the parse() function returns.
* `base` is the base URI that relative URIs will be resolved against.
* `filter` is an optional function(Triple) that will restrict which triples are added to the output graph. The function takes an input Triple and returns true to include the triple in the output graph.
* `graph` is an optional Graph that triples will be add()ed to. If left out, a new IndexedGraph will be used.

Since @base and @prefix directives modify the environment passed to TurtleParser, it's recommended a new TurtleParser be used for each document.

### RDF Environment

The RDF Environment is the context that bnodes are described relative to, and where namespaces/prefixes are defined. The API implements the [RDF Environment API of RDF Interfaces](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#rdf-environment-interfaces).

The rdf module creates one such global environment by default, accessible at `rdf.environment`. Others are created where necessary, e.g. when parsing a Turtle document, and may be created using `new rdf.RDFEnvironment`.

### Builtins

Instead of using NamedNode, URIs by default are represented as plain strings. The RDFNode interface may be overloaded onto the standard String object using `rdf.setBuiltins()` or onto a particular prototype by using:

	rdf.setObjectProperties(Object.prototype);
	rdf.setStringProperties(String.prototype);
	rdf.setArrayProperties(Array.prototype);
	rdf.setBooleanProperties(Boolean.prototype);
	rdf.setDateProperties(Date.prototype);
	rdf.setNumberProperties(Number.prototype);

as done in the setBuiltins function call in `lib/Builtins.js`.

This extends the prototype definitions to act as native RDF types as well, for example:

	true.toNT();         // "true"^^<http://www.w3.org/2001/XMLSchema#boolean>
	(12 * 1.4).toNT();   // "12.3"^^<http://www.w3.org/2001/XMLSchema#decimal>

### Object Builtins

Any two values may be compared with each other using the `equals` method:

	(true).equals(rdf.environment.createLiteral('true', null, 'xsd:boolean'.resolve()) // true

The node type may be queried with the `nodeType` method:

	"_:bnode".nodeType()
	"http://example.com/".nodeType()

An object may be assigned a URI and parsed for triples with the `ref` method:

	var structure =
		{ 'dbp:dateOfBirth': '1879-03-14'.tl('xsd:date')
		, 'foaf:depictation': 'http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg'
		}.ref('dbr:Albert_Einstein');

`ref` may be called without any argument to create a BlankNode.

The resulting object has a number of methods:

* `structure.n3()` returns a Turtle/N3 document close to the original structure.
* `structure.toNT()` returns an N-Triples formatted list of triples.
* `structure.graphify()` returns an IndexedGraph of triples.

If multiple properties with the same predicate need to be added, put the multiple values in an Array:

	{a: ['foaf:Person']}.ref()

An Array may also be used to make an RDF Collection (linked list), with the `toList` method:

	['rdfs:Class', 'rdfs:Resource'].toList()

### String Builtins

Strings may be used in place of a NamedNode and BlankNode, and have the same properties. There are the following methods:

* `tl(type)` creates a typed literal out of the given value.
* `l(lang)` creates a standard literal, with an optional language value.
* `resolve()` resolves a CURIE/term to an IRI. Unlike the enviornment/profile method, this returns the original string if unsuccessful (for instance, if the string is already a URI).

URIs passed to these functions may be CURIEs and are resolved with the global `rdf.environment`.

## Tests

A Mocha test suite is found in the tests directory. Run `make test` to evaluate the tests.

## Index of Files

* bin/turtle-equal.js - executable that determines of two Turtle files encode the same graph
* bin/turtle-nt.js - executable that prints an N-Triples document of the triples found in the listed Turtle files
* index.js - exposed module entry point
* lib/ - additional library files imported by index.js
* Makefile - Downloads and runs test suite
* package.json - some metadata about this package
* README.md - You're looking at it
* test/*.test.js - Mocha test suite files
* test/graph-test-lib.js - A generic test for a Graph interface
* test/TurtleTests/ - Tests from the Turtle test suite are extracted here
* UNLICENSE - Public Domain dedication
