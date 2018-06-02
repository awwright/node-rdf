# RDF Interfaces implementation

This package is a set of simple utilities aimed at making it simple to represent RDF data.

RDF can be considered a superset of typical link relationships found on the Web: It allows a collection of directional relationships from some _subject_, with a relationship _predicate_, to some _object_.

On the Web, normally all three are documents. In RDF, the object may also be a literal string containing data; and the subject or object may be an anonymous resource called a _blank node_.

The `NamedNode`, `BlankNode`, and `Literal` objects represent the fundemental types of data that can be found in an RDF Statement. Statements are represented as `Triple`.

RDF doesn't define any representation of a blank nodes, except for the fact it is possible to compare two blank nodes to see if they are the same. In RDF Interfaces, a bnode is uniquely represented as an instance of `BlankNode`. This interface optionally allows a label, this is primarially for debugging, and two instances of BlankNodes with the same label may still represent different blank nodes.

The library also exposes a function to decorate the builtin ECMAScript protoypes with methods.

## Uses

### Use RDF data sources with native data types

Use `Literal#valueOf` to convert between lexical and literal value spaces.

### Use RDF data types as native data types

Use the Builtins functionality.

### Write RDF graphs as native Objects

* call rdf.parse(object, uri) to turn it into a js3Graph
* With builtins: (object).ref(uri)

js3Graph methods:
* js3Graph#graphify - same as #toGraph
* js3Graph#toGraph - returns a Graph instance with the data

### Store RDF statements in memory

Use the provided Graph instance to write logic around RDF data.

### Query information from RDF sources

Use the innovative ResultSet interface to quickly get the data you're looking for.

### Manage documents with RDF data

Use the RDFEnvironment, Profile, TermMap, and ProfileMap interfaces to work with RDF documents that think in terms of CURIEs and Terms.


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
