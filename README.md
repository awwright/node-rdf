
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
var rdf = require('rdf');
var createNamedNode = rdf.environment.createNamedNode.bind(rdf.environment);
var createBlankNode = rdf.environment.createBlankNode.bind(rdf.environment);
var createLiteral = rdf.environment.createLiteral.bind(rdf.environment);

var namednode = createNamedNode('http://example.com/');
namednode.toNT()
```

    '<http://example.com/>'

```javascript
var blanknode = rdf.environment.createBlankNode();
blanknode.toNT()
```

    '_:b1'

```javascript
var literal = rdf.environment.createLiteral('plain string')
literal.toNT()

```

    '"plain string"'

```javascript
namednode.equals(literal)
```

    false

### Represent RDF statements

A `Triple` instance represents an edge in an RDF graph (also known as a Statement).

```javascript
var statement1 = rdf.environment.createTriple(blanknode, namednode, literal);
statement1.toString()
```

    '_:b1 <http://example.com/> "plain string" .'

### Represent RDF graphs

A `Graph` instance stores and queries.

```javascript
var graph = rdf.environment.createGraph();
graph.add(statement1);
graph.add(rdf.environment.createTriple(
	blanknode,
	rdf.environment.createNamedNode(rdf.rdfsns('label')),
	rdf.environment.createLiteral('Price'))
	);
graph.add(rdf.environment.createTriple(
	blanknode,
	rdf.environment.createNamedNode(rdf.rdfns('value')),
	rdf.environment.createLiteral('10.0', rdf.xsdns('decimal')))
	);
graph.length
```

    3

```javascript
var results = graph.match(blanknode, null, null);
results.length
```

    3

```javascript
results.forEach(function(triple){ console.log(triple.toString()); });
```

    _:b1 <http://example.com/> "plain string" .
    _:b1 <http://www.w3.org/2000/01/rdf-schema#label> "Price" .
    _:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "10.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .

### Compare nodes, triples, and graphs for equality

Use the `NamedNode#equals`, `BlankNode#equals`, `Literal#equals`, `Triple#equals`, and `Graph#equals` methods to compare equality.

Literals verify codepoint, datatype, and language tag equality. Triples verify equality of each three nodes.

Graphs test for isomorphism, that there's a mapping that can map the blank nodes in one graph to the blank nodes in the other one-to-one. If so isomorphic, it returns the mapping.

```javascript
var graph2 = rdf.environment.createGraph();
var bn2 = rdf.environment.createBlankNode();

graph2.add(rdf.environment.createTriple(
	bn2,
	namednode,
	literal
	));
graph2.add(rdf.environment.createTriple(
	bn2,
	rdf.environment.createNamedNode(rdf.rdfsns('label')),
	rdf.environment.createLiteral('Price')
	));
graph2.add(rdf.environment.createTriple(
	bn2,
	rdf.environment.createNamedNode(rdf.rdfns('value')),
	rdf.environment.createLiteral('10.0', rdf.xsdns('decimal'))
	));

graph.equals(graph2)
```

    { '_:b1': BlankNode { nominalValue: 'b2' } }

### Simplify RDF namespaces

Use the `ns` function to create a URI factory.

Use the builtin `rdfns`, `rdfsns`, and `xsdns` functions too.

```javascript
var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
foaf('knows')
```

    'http://xmlns.com/foaf/0.1/knows'

```javascript
rdf.rdfsns('label')
```

    'http://www.w3.org/2000/01/rdf-schema#label'

### Compose RDF graphs as native Objects

Use the `rdf.parse` function to cast a native object into a graph:

```javascript
var env = rdf.environment;
function person_(n){ return rdf.environment.createNamedNode('http://example.com/'.concat(n)); }
function foaf_(n){ return rdf.environment.createNamedNode('http://xmlns.com/foaf/0.1/'.concat(n)); }
var partyDocument = rdf.parse({
	"@context": {
		"@vocab": "http://xmlns.com/foaf/0.1/",
		"person": "http://example.com/",
	},
	"@id": person_('a'),
	givenname: rdf.environment.createLiteral("Alice"),
	age: 26,
	knows: [
		{
			"@id": person_('b'),
			givenname: rdf.environment.createLiteral("Bob"),
			age: 36,
			knows: person_('a'),
		},
		{
			"@id": person_('c'),
			givenname: rdf.environment.createLiteral("Carol"),
			age: 46,
			knows: person_('a'),
		},
		{
			"@id": person_('d'),
			givenname: rdf.environment.createLiteral("Dan"),
			age: 56,
			knows: [person_('a'), person_('b')],
		}
	]
})
console.log(partyDocument.n3());
```

    [
    	<http://xmlns.com/foaf/0.1/givenname> "Alice";
    	<http://xmlns.com/foaf/0.1/age> 26;
    	<http://xmlns.com/foaf/0.1/knows> [
    		<http://xmlns.com/foaf/0.1/givenname> "Bob";
    		<http://xmlns.com/foaf/0.1/age> 36;
    		<http://xmlns.com/foaf/0.1/knows> person:a
    		], [
    		<http://xmlns.com/foaf/0.1/givenname> "Carol";
    		<http://xmlns.com/foaf/0.1/age> 46;
    		<http://xmlns.com/foaf/0.1/knows> person:a
    		], [
    		<http://xmlns.com/foaf/0.1/givenname> "Dan";
    		<http://xmlns.com/foaf/0.1/age> 56;
    		<http://xmlns.com/foaf/0.1/knows> person:a, person:b
    		]
    	]

Use the `graphify` method to produce an `rdf.Graph` from the data:

```javascript
var partyGraph = partyDocument.graphify();

partyGraph
    .toArray()
    .sort(function(a,b){ return a.compare(b); })
    .forEach(function(triple){ console.log(triple.toString()); });
```

    <http://example.com/a> <http://xmlns.com/foaf/0.1/age> "26"^^<http://www.w3.org/2001/XMLSchema#integer> .
    <http://example.com/a> <http://xmlns.com/foaf/0.1/givenname> "Alice" .
    <http://example.com/a> <http://xmlns.com/foaf/0.1/knows> <http://example.com/b> .
    <http://example.com/a> <http://xmlns.com/foaf/0.1/knows> <http://example.com/c> .
    <http://example.com/a> <http://xmlns.com/foaf/0.1/knows> <http://example.com/d> .
    <http://example.com/b> <http://xmlns.com/foaf/0.1/age> "36"^^<http://www.w3.org/2001/XMLSchema#integer> .
    <http://example.com/b> <http://xmlns.com/foaf/0.1/givenname> "Bob" .
    <http://example.com/b> <http://xmlns.com/foaf/0.1/knows> <http://example.com/a> .
    <http://example.com/c> <http://xmlns.com/foaf/0.1/age> "46"^^<http://www.w3.org/2001/XMLSchema#integer> .
    <http://example.com/c> <http://xmlns.com/foaf/0.1/givenname> "Carol" .
    <http://example.com/c> <http://xmlns.com/foaf/0.1/knows> <http://example.com/a> .
    <http://example.com/d> <http://xmlns.com/foaf/0.1/age> "56"^^<http://www.w3.org/2001/XMLSchema#integer> .
    <http://example.com/d> <http://xmlns.com/foaf/0.1/givenname> "Dan" .
    <http://example.com/d> <http://xmlns.com/foaf/0.1/knows> <http://example.com/a> .
    <http://example.com/d> <http://xmlns.com/foaf/0.1/knows> <http://example.com/b> .

### Query information from RDF sources

Use the ResultSet interface to quickly drill into the specific data you want:

```javascript
// Get the name of Alice
partyGraph.reference(person_('a'))
	.rel(foaf_('givenname'))
	.one()
	.toString()
```

    'Alice'

```javascript
// Get all the names of everyone who Alice knows
partyGraph.reference(person_('a'))
	.rel(rdf.environment.createNamedNode(foaf('knows')))
	.rel(rdf.environment.createNamedNode(foaf('givenname')))
	.toArray()
	.sort()
	.join(', ')
```

    'Bob, Carol, Dan'

### Read RDF data sources as native data types

Use `Literal#valueOf` to convert from lexical data space to native value space:

```javascript
rdf.environment.createLiteral('2018-06-04T23:11:25Z', rdf.xsdns('date')).valueOf()
```

    2018-06-04T23:11:25.000Z

```javascript
rdf.environment.createLiteral('24.440', rdf.xsdns('decimal')).valueOf()
```

    24.44

```javascript
rdf.environment.createLiteral('1', rdf.xsdns('boolean')).valueOf()
```

    true

```javascript
// sum the ages of everyone that Alice knows
partyGraph.reference(person_('a'))
	.rel(rdf.environment.createNamedNode(foaf('knows')))
	.rel(rdf.environment.createNamedNode(foaf('age')))
	.reduce(function(a, b){ return a.valueOf() + b; }, 0);
```

    138

### Manage documents with RDF data

Use the `RDFEnvironment`, `Profile`, `TermMap`, and `ProfileMap` interfaces to work with RDF documents that think in terms of CURIEs and Terms.

Here's an example to take an RDF graph, and output a Turtle document with the prefixes applied:

```javascript
var profile = env.createProfile();
profile.setDefaultPrefix('http://example.com/');
profile.setPrefix('ff', 'http://xmlns.com/foaf/0.1/');
var turtle = partyGraph
	.toArray()
	.sort(function(a,b){ return a.compare(b); })
	.map(function(stmt){
	return stmt.subject.n3(profile) + ' ' + stmt.predicate.n3(profile) + ' ' + stmt.object.n3(profile) + " .";
});
//console.log(profile.n3());
console.log(turtle.join('\n'));
```

    :a ff:age "26"^^<http://www.w3.org/2001/XMLSchema#integer> .
    :a ff:givenname "Alice" .
    :a ff:knows :b .
    :a ff:knows :c .
    :a ff:knows :d .
    :b ff:age "36"^^<http://www.w3.org/2001/XMLSchema#integer> .
    :b ff:givenname "Bob" .
    :b ff:knows :a .
    :c ff:age "46"^^<http://www.w3.org/2001/XMLSchema#integer> .
    :c ff:givenname "Carol" .
    :c ff:knows :a .
    :d ff:age "56"^^<http://www.w3.org/2001/XMLSchema#integer> .
    :d ff:givenname "Dan" .
    :d ff:knows :a .
    :d ff:knows :b .

### Treat native data types as RDF data

If you think `rdf.environment.createLiteral` is too verbose, enable builtins mode. This amends the prototype of primitives like `String`:

```javascript
rdf.setBuiltins();

[
    "http://example.com/".toNT(),
    (3 * 4).toNT(),
    true.toNT(),
    new Date('2112-06-06').toNT(),
    "The Hobbit".l('en-GB').toNT(),
    "4.0".tl(rdf.xsdns('decimal')).toNT(),
]

rdf.unsetBuiltins();
```

### Native support for RDF1.1 semantics

The domains of the functions ensure constistency with all the other applications found in the RDF universe.

`Literal` treats xsd:string as no datatype, and treats any language literal as rdf:langString. The RDF1.1 datatype is available through the `Literal#datatypeIRI` property.

```javascript
var literal = env.createLiteral('Foo');
console.dir(literal.datatype);
console.dir(literal.datatypeIRI);
console.dir(literal.language);
```

    undefined
    'http://www.w3.org/2001/XMLSchema#string'
    undefined

```javascript
var langLiteral = env.createLiteral('Foo', '@en');
console.dir(langLiteral.datatype);
console.dir(langLiteral.datatypeIRI);
console.dir(langLiteral.language);
```

    undefined
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'
    'en'

```javascript
var typedLiteral = env.createLiteral('Foo', rdf.xsdns('string'));
console.dir(typedLiteral.datatype);
console.dir(typedLiteral.datatypeIRI);
console.dir(typedLiteral.language);
```

    undefined
    'http://www.w3.org/2001/XMLSchema#string'
    undefined

The data model is enforced in the domain of each of the functions; `Triple` doesn't allow bnodes as predicates, for example:

```javascript
try {
    env.createTriple(env.createBlankNode(), env.createBlankNode(), env.createBlankNode());
}catch(e){
    console.log(e.toString());
}
```

    Error: predicate must be a NamedNode

### Public Domain unlicensed

Use this library in whatever application you want! Give credit when you do so, or don't (but preferably the former). Use it to take over the world, or don't (but preferably the latter).

## About

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

#### Graph#addAll(graph)

Adds the given graph or array of `Triple` instances to the Graph.

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

### RDFEnvironment

The RDFEnvironment is the context that bnodes are described relative to, and where namespaces/prefixes are defined. The API implements the [RDF Environment API of RDF Interfaces](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#rdf-environment-interfaces).

The rdf module creates one such global environment by default, accessible at `rdf.environment`. Others are created where necessary, e.g. when parsing a Turtle document, and may be created using `new rdf.RDFEnvironment`.

### Builtins

Instead of using NamedNode, URIs by default are represented as plain strings. The RDFNode interface may be overloaded onto the standard String object using `rdf.setBuiltins()` or onto a particular prototype by using:

	rdf.builtins.setObjectProperties(Object.prototype);
	rdf.builtins.setStringProperties(String.prototype);
	rdf.builtins.setArrayProperties(Array.prototype);
	rdf.builtins.setBooleanProperties(Boolean.prototype);
	rdf.builtins.setDateProperties(Date.prototype);
	rdf.builtins.setNumberProperties(Number.prototype);

as done in the setBuiltins function call in `lib/Builtins.js`.

This extends the prototype definitions to act as native RDF types as well, for example:

	true.toNT();         // "true"^^<http://www.w3.org/2001/XMLSchema#boolean>
	(12 * 1.4).toNT();   // "12.3"^^<http://www.w3.org/2001/XMLSchema#decimal>

#### Object Builtins

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

#### String Builtins

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
* README.ipynb - Sources for execution results in README.md
* test/*.test.js - Mocha test suite files
* test/graph-test-lib.js - A generic test for a Graph interface
* test/TurtleTests/ - Tests from the Turtle test suite are extracted here
* UNLICENSE - Public Domain dedication
