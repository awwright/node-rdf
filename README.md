
# RDF for ECMAScript

This package is a set of utilities aimed at making it simple to represent RDF data. It is targeted at Node.js, but should work cross-environment.

RDF can be considered a superset of typical links found on the Web: It allows a collection of directional relationships from some _subject_, with a relationship _predicate_, to some _object_.

On the Web, normally all three are documents. In RDF, the object may also be a literal string containing data; and the subject or object may be an existential quantifier called a _blank node_.

The `NamedNode`, `BlankNode`, and `Literal` objects represent the fundamental types of data that can be found in an RDF Statement. Statements are represented as `Triple`.

RDF doesn't define any representation of a blank nodes, except for the fact it is possible to compare two blank nodes to see if they are the same. In RDF Interfaces, a bnode is uniquely represented as an instance of `BlankNode`. This interface optionally allows a label, this is primarily for debugging, and two instances of BlankNodes with the same label may still represent different blank nodes.

The library also exposes a function to decorate the builtin ECMAScript protoypes with methods.

## Features

### Represent RDF nodes

`NamedNode`, `BlankNode`, and `Literal` instances represent nodes in an RDF graph.

```javascript
const rdf = require('rdf');
const { NamedNode, BlankNode, Literal } = rdf;

const namednode = new NamedNode('http://example.com/');
namednode.toNT()
```

    '<http://example.com/>'

```javascript
const blanknode = new BlankNode();
blanknode.toNT()
```

    '_:b1'

```javascript
const literal = new Literal('plain string');
literal.toNT()
```

    '"plain string"'

A factory-style interface is also available:

```javascript
const rdfjs = rdf.factory;
rdfjs.blankNode()
```

    BlankNode { nominalValue: 'b2' }

As well as the RDF Interfaces environment:

```javascript
const rdfenv = rdf.environment;
rdfenv.createLiteral("true", null, rdf.xsdns("boolean")).toTurtle()
```

    'true'

### Represent RDF statements

A `Triple` instance represents an edge in an RDF graph (also known as a Statement).

```javascript
const statement1 = rdfjs.triple(blanknode, namednode, literal);
statement1.toString()
```

    '_:b1 <http://example.com/> "plain string" .'

### Represent RDF graphs

A `Graph` instance stores and queries for Triples:

```javascript
const graph = new rdf.Graph();
graph.add(new rdf.Triple(
	new BlankNode(),
	rdf.rdfsns('label'),
	new Literal('Book', '@en'))
	);
graph.add(new rdf.Triple(
	new BlankNode(),
	rdf.rdfns('value'),
	new Literal('10.0', rdf.xsdns('decimal')))
	);
graph.add(new rdf.Triple(
	new BlankNode(),
	rdf.rdfns('value'),
	new Literal('10.1', rdf.xsdns('decimal')))
	);
graph.length
```

    3

```javascript
graph
	.match(null, rdf.rdfns('value'), null)
	.forEach(function(triple){ console.log(triple.toString()); });
```

    _:b4 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "10.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .
    _:b5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "10.1"^^<http://www.w3.org/2001/XMLSchema#decimal> .

### Simplify RDF namespaces

Use the `ns` function to create a URI factory.

```javascript
const foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
foaf('knows')
```

    'http://xmlns.com/foaf/0.1/knows'

Use the builtin `rdfns`, `rdfsns`, and `xsdns` functions too:

```javascript
rdf.rdfsns('label')
```

    'http://www.w3.org/2000/01/rdf-schema#label'

### Compare nodes, triples, and graphs for equality

Use the `NamedNode#equals`, `BlankNode#equals`, `Literal#equals`, `Triple#equals`, and `Graph#isomorphic` methods to compare equality.

Literals verify codepoint, datatype, and language tag equality. Triples verify equality of each three nodes.

Graphs test for isomorphism, that there's a mapping that can map the blank nodes in one graph to the blank nodes in the other one-to-one. If so isomorphic, it returns the mapping.

```javascript
const graph2 = new rdf.Graph();
const bn2 = rdf.factory.blankNode();

graph2.add(rdf.factory.triple(
	bn2,
	namednode,
	literal
	));
graph2.add(rdf.factory.triple(
	bn2,
	rdf.rdfsns('label'),
	rdfjs.literal('Price')
	));
graph2.add(rdf.factory.triple(
	bn2,
	rdf.rdfns('value'),
	rdfjs.literal('10.0', rdf.xsdns('decimal'))
	));

graph.isomorphic(graph2)
```

### Compose RDF graphs as native Objects

Use the `rdf.parse` function to cast a native object into a graph:

```javascript
const person = rdf.ns('http://example.com/');
const partyDocument = rdf.parse({
	"@context": {
		"@vocab": "http://xmlns.com/foaf/0.1/",
		"foaf": "http://xmlns.com/foaf/0.1/",
		"person": "http://example.com/",
	},
	"@id": person('a'),
	givenname: rdfjs.literal("Alice"),
	age: 26,
	knows: [
		{
			"@id": person('b'),
			givenname: rdfjs.literal("Bob"),
			age: 36,
			knows: person('a'),
		},
		{
			"@id": person('c'),
			givenname: rdfjs.literal("Carol"),
			age: 46,
			knows: person('a'),
		},
		{
			"@id": person('d'),
			givenname: rdfjs.literal("Dan"),
			age: 56,
			knows: [person('a'), person('b')],
		}
	]
})
console.log(partyDocument.n3());
```

    [
    	foaf:givenname "Alice";
    	foaf:age 26;
    	foaf:knows [
    		foaf:givenname "Bob";
    		foaf:age 36;
    		foaf:knows person:a
    		], [
    		foaf:givenname "Carol";
    		foaf:age 46;
    		foaf:knows person:a
    		], [
    		foaf:givenname "Dan";
    		foaf:age 56;
    		foaf:knows person:a, person:b
    		]
    	]

Use the `graphify` method to produce an `rdf.Graph` from the data:

```javascript
const partyGraph = partyDocument.graphify();

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
partyGraph.reference(person('a'))
	.rel(foaf('givenname'))
	.one()
	.toString()
```

    'Alice'

```javascript
// Get all the names of everyone who Alice knows
partyGraph.reference(person('a'))
	.rel(foaf('knows'))
	.rel(foaf('givenname'))
	.toArray()
	.sort()
	.join(', ')
```

    'Bob, Carol, Dan'

### Read RDF data sources as native data types

Use `Literal#valueOf` to convert from lexical data space to native value space:

```javascript
rdfjs.literal('2018-06-04T23:11:25Z', rdf.xsdns('date')).valueOf()
```

    2018-06-04T23:11:25.000Z

```javascript
rdfjs.literal('24.4400', rdf.xsdns('decimal')).valueOf()
```

    24.44

```javascript
rdfjs.literal('0', rdf.xsdns('boolean')).valueOf()
```

    false

Read the ages of everyone that Alice knows as a native number, and sum them:

```javascript
// sum the ages of everyone that Alice knows
partyGraph.reference(person('a'))
	.rel(foaf('knows'))
	.rel(foaf('age'))
	.reduce(function(a, b){ return a.valueOf() + b; }, 0);
```

    138

### Manage documents with RDF data

Use the `RDFEnvironment`, `Profile`, `TermMap`, and `ProfileMap` interfaces to work with RDF documents that think in terms of CURIEs and Terms.

Here's an example to take an RDF graph, and output a Turtle document with the prefixes applied:

```javascript
const profile = rdf.environment.createProfile();
profile.setDefaultPrefix('http://example.com/');
profile.setPrefix('ff', 'http://xmlns.com/foaf/0.1/');
const turtle = partyGraph
	.toArray()
	.sort(function(a,b){ return a.compare(b); })
	.map(function(stmt){
		return stmt.toTurtle(profile);
	});
//console.log(profile.n3());
console.log(turtle.join('\n'));
```

    :a ff:age 26 .
    :a ff:givenname "Alice" .
    :a ff:knows :b .
    :a ff:knows :c .
    :a ff:knows :d .
    :b ff:age 36 .
    :b ff:givenname "Bob" .
    :b ff:knows :a .
    :c ff:age 46 .
    :c ff:givenname "Carol" .
    :c ff:knows :a .
    :d ff:age 56 .
    :d ff:givenname "Dan" .
    :d ff:knows :a .
    :d ff:knows :b .

### Treat native data types as RDF data

If you think creating RDF Term is too verbose, enable builtins mode with `setBuiltins()`. This amends the prototype of primitives:
* Strings are treated as a `NamedNode`
* String#l(langtag) produces a language `Literal`
* String#tl(datatype) produces a typed `Literal`
* Date, Boolean, Number are treated as a `Literal`

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
```

    [ '<http://example.com/>',
      '"12"^^<http://www.w3.org/2001/XMLSchema#integer>',
      '"true"^^<http://www.w3.org/2001/XMLSchema#boolean>',
      '"2112-06-06T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>',
      '"The Hobbit"@en-GB',
      '"4.0"^^<http://www.w3.org/2001/XMLSchema#decimal>' ]

Change your mind? Use `unsetBuiltins` to remove them:

```javascript
rdf.unsetBuiltins();
```

### Native support for RDF 1.1 semantics

The domains of the functions ensure consistency with all the other applications found in the RDF universe.

`Literal` treats xsd:string as no datatype, and treats any language literal as rdf:langString. The RDF1.1 datatype is available through the `Literal#datatype` property. The RDF1.0 datatype, which null for plain literals and language strings, is available through `Literal#type`.

```javascript
const literal = new Literal('Foo');
console.dir(literal.datatype.toNT());
console.dir(literal.type);
console.dir(literal.language);
```

    '<http://www.w3.org/2001/XMLSchema#string>'
    null
    null

```javascript
const langLiteral = new Literal('Foo', '@en');
console.dir(langLiteral.datatype.toNT());
console.dir(langLiteral.type);
console.dir(langLiteral.language);
```

    '<http://www.w3.org/1999/02/22-rdf-syntax-ns#langString>'
    null
    'en'

```javascript
const typedLiteral = new Literal('Foo', rdf.xsdns('string'));
console.dir(typedLiteral.datatype.toNT());
console.dir(typedLiteral.type);
console.dir(typedLiteral.language);
```

    '<http://www.w3.org/2001/XMLSchema#string>'
    null
    null

The data model is enforced in the domain of each of the functions; `Triple` doesn't allow bnodes as predicates, for example:

```javascript
try {
    rdfjs.triple(rdfjs.blankNode(), rdfjs.blankNode(), rdfjs.blankNode());
}catch(e){
    console.log(e.toString());
}
```

    Error: predicate must be a NamedNode

### Parse Turtle data

Use the `TurtleParser.parse(document, base)` function to parse Turtle data into a Graph object:

```javascript
const parse = rdf.TurtleParser.parse('<> a <Page> .', 'http://example.com/');
parse.graph.toArray().join("\n")
```

    '<http://example.com/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.com/Page> .'

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

### RDFNode

`rdf.Triple`, `rdf.RDFNode`, `rdf.NamedNode`, `rdf.BlankNode`, `rdf.Literal` are implemented as defined under [RDF Interfaces: Basic Node Types](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#basic-node-types).

For parsing the IRI and converting to a URI that can be used in an HTTP request, see the [IRI package](https://github.com/Acubed/node-iri).

### Triple

Represents an edge in an RDF Graph, also known as a Statement or a Triple.

Create an instance of a triple with `rdf.environment.createTriple(subject, predicate, object)`.

Use the `Triple#subject`, `Triple#predicate`, and `Triple#object` properties to access the respective RDF nodes in the Triple.

#### Triple#toString()

Returns the triple encoded as N-Triples. Same as `Triple#toNT()`.

#### Triple#toNT()

Returns the triple encoded as N-Triples.

#### Triple#toTurtle(profile)

Returns the triple encoded as a statement in Turtle, optionally with the given prefix map applied.

### RDFNode

Also exposed as `Term`, this is the abstract superclass of things that can be found in an RDF Triple.

#### RDFNode#equals(other)

Returns true if the given node `other` would be considered the same node as itself in an RDF graph.

`Literal`s and `NamedNode`s always compare by their contents. `BlankNode`s sometimes compare by their label, but sometimes may only be equal if they're the same instance.

If you're managing a single RDF graph, you should keep a mapping of labels to BlankNode instances, and use the instances from this mapping, instead of creating a new BlankNode and setting the label.

### NamedNode

Represents an IRI node in an RDF graph. Instances are uniquely identified by their contents, so two different contents will still be considered equal if the inner IRIs are the same.

Create an instance of a triple with `rdf.environment.createTriple(subject, predicate, object)`.

#### NamedNode#equals(other)

Returns true if the given NamedNode `other` is the same IRI, otherwise false. See `RDFNode#equals` for details

#### NamedNode#toString()

Returns the inner IRI as a string.

#### NamedNode#toNT()

Serializes the node as an IRI for N-Triples, inside angle brackets.

#### NamedNode#toTurtle(profile)

Serializes the node as an IRI for N-Triples inside angle brackets, or the shrunken CURIE form if provided in the optional `profile`.

### BlankNode

Represents a blank node in an RDF graph. BlankNode instances are typically identified by their instance, so two instances may be considered different even if they have the same label.

Create an instance of a triple with `rdf.environment.createBlankNode()`.

#### BlankNode#equals(other)

Returns true if the given NamedNode `other` is the same IRI, otherwise false. See `RDFNode#equals` for details

#### BlankNode#toString()

Serializes the node as a Turtle-style BlankNode. See toTurtle for information.

#### BlankNode#toNT()

Serializes the node as a Turtle-style BlankNode. See toTurtle for information.

#### BlankNode#toTurtle()

Serializes the BlankNode as a Turtle-style blank node, e.g.:

* `_:bn0`
* `_:label`

### Literal

Represents a content literal in an RDF graph. Literals may have edges pointing only towards them (i.e. they're only found in the object position of a triple). Literals are Unicode strings with a datatype IRI, and optional associated language tag.

* `Literal#value` - the string contents of the literal (note that ECMAScript/JavaScript uses UTF-16 to encode Unicode strings)
* `Literal#datatype` - NamedNode that identifies the datatype of the literal.
* `Literal#type` - getter that returns `null` if the datatype is an xsd:string, or a language literal, as seen in RDF1.0 semantics.
* `Literal#language` - stores the language tag, if any, or `null` otherwise.

#### Literal#valueOf()

Returns a native representation of the literal, based on its datatype.

* The numeric datatypes will produce a number: `xsd:float`, `xsd:integer`, `xsd:long`, `xsd:double`, `xsd:decimal`, `xsd:nonPositiveInteger`, `xsd:nonNegativeInteger`, `xsd:negativeInteger`, `xsd:int`, `xsd:unsignedLong`, `xsd:positiveInteger`, `xsd:short`, `xsd:unsignedInt`, `xsd:byte`, `xsd:unsignedShort`, `xsd:unsignedByte`
* The datetime datatypes will produce a Date object: `xsd:date`, `xsd:time`, `xsd:dateTime`
* The boolean datatype will produce a boolean: `xsd:boolean`
* The string datatypes will produce a string: `xsd:string` `rdf:langString`

#### Literal#equals(other)

Returns true if the given Literal `other` has the same contents, datatype, and language tag. See `RDFNode#equals` for details.

#### Literal#toString()

Returns the literal contents as a string, discarding the other type/tags.

#### Literal#toNT()

Serializes the node as a string with datatype for N-Triples, inside double-quotes followed by language tag or datatype IRI (if not xsd:string).

#### Literal#toTurtle(profile)

Serializes the node as a string. For datatypes of xsd:integer, xsd:decimal, xsd:double, xsd:boolean, and xsd:string, the literal is printed without the datatype IRI.

If the datatype IRI can be shrunk with the given profile, it is printed as a CURIE, otherwise it prints the full brackted IRI.

### Graph

Represents a set of RDF `Triple` instances. Since a graph in RDF is a set of edges, nodes are only known to exist in the graph if there is an edge (a Triple) containing them.

This implements [RDF Interfaces: Graph](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#idl-def-Graph) with three indexes for fast querying.

Instances of Graph are uniquely identified by their instance (however, Graph#equals tests isomorphism). Graphs are mutable. Methods with a return value are pure, non-pure (mutating) methods always return undefined.

#### new Graph

Creates an empty in-memory RDF graph.

#### Graph#add(Triple triple)

Adds a triple to the Graph, if it doesn't already exist.

#### Graph#addAll(graph)

Adds the given graph or array of `Triple` instances to the Graph.

#### Graph#remove(Triple triple)

Removes the given triple from the Graph, if it exists.

#### Graph#removeMatches(subject, predicate, object)

Removes the given triple from the Graph, if it exists.

#### Graph#toArray()

Returns an array of Triples currently in the Graph.

#### Graph#some(function callback)

Same behavior as `Array#some`: Evaluates `callback` over each Triple in the Graph, and returns true if the callback returns truthy for any of them.

#### Graph#every(function callback)

Same behavior as `Array#every`: Evaluates `callback` over each Triple in the Graph, and returns true if the callback returns truthy for all of them.

#### Graph#filter(function callback)

Same behavior as `Array#filter`: Evaluates `callback` over each Triple in the Graph, and returns a Graph with the triples that evaluated truthy.

#### Graph#forEach(function callback)

Same behavior as `Array#forEach`: Evaluates `callback` over each Triple in the Graph.

#### Graph#isomorphic(graph)

Determines if the provided graph is isomorphic with the current one: Determines if all the Literal and NamedNode instances equal, and is there a one-to-one mapping of bnodes between the two graphs. If so, it returns the mapping, the toString blanknode as the key, the graph argument's BlankNode instance as value. If there's no match, it returns null.

#### Graph#union(graph)

Returns a new Graph that's the concatenation of this graph with the argument.

#### Graph#reference(resource)

Returns a `ResultSet`, a pointer to a node in a graph that can be walked to query for data.

The provided `resource` does not necessarily have to exist in the graph, however, any operations on it will produce an empty set.

### Dataset

Represents a set of RDF `Quad` instances.

This implements most of the [RDF/JS: Dataset specification](https://rdf.js.org/dataset-spec/), using six indexes for fast querying.

Instances of Dataset are uniquely identified by their instance. Datasets are mutable. Methods with a return value are pure, non-pure (mutating) methods always return undefined.

### Variable

Represents a variable for subgraph matching, in e.g. SPARQL queries. This is also an instance of `RDFNode`.

A `Variable` instance may be used in a `TriplePattern` instance. Instances are not allowed in `Triple` statements, since they're for subgraph matching, and not actual graph data.

### ResultSet

Represents a node in an instance of a graph, whose relationships inside the graph can be walked and then queried. This is called ResultSet instead of NodeSet because it also contains a pointer to the graph of data and other nodes that can be walked.

Properties:

* `ResultSet#length` - provides the size of the set

#### ResultSet#rel(predicate)

Walks the `predicate` relationship over each node in the set, returning a new ResultSet with the destination nodes, and a reference to the same graph.

If the current set is an empty set, the return value will also be an empty set.

If any nodes in the current set are literals, they will be ignored and will not produce any destination nodes.

#### ResultSet#rev(predicate)

Walks the `predicate` relationship _backwards_ from each node in the set, returning a new ResultSet with the destination nodes, and a reference to the same graph.

If the current set is an empty set, the return value will also be an empty set.

This method will walk backwards from `Literal`, destination nodes will be `BlankNode` or `NamedNode`.

#### ResultSet#toArray()

Return the nodes in the set as an Array.

#### ResultSet#some(function callback)

Same behavior as `Array#some`: Evaluates `callback` over each RDFNode in the ResultSet, and returns true if the callback returns truthy for any of them.

#### ResultSet#every(function callback)

Same behavior as `Array#every`: Evaluates `callback` over each RDFNode in the ResultSet, and returns true if the callback returns truthy for all of them.

#### ResultSet#filter(function callback)

Same behavior as `Array#filter`: Evaluates `callback` over each RDFNode in the ResultSet, and returns a new ResultSet with the triples that evaluated truthy.

#### ResultSet#forEach(function callback)

Same behavior as `Array#forEach`: Evaluates `callback` over each RDFNode in the ResultSet.

#### ResultSet#map(function callback)

Same behavior as `Array#map`: Evaluates `callback` over each RDFNode in the ResultSet, and returns a new ResultSet of each of the returned triples.

#### ResultSet#reduce(function callback, any initial)

Same behavior as `Array#reduce`: Evaluates `callback` over each RDFNode in the ResultSet with the current node and the previous return value, or `initial` if the first item.

#### ResultSet#one()

Returns the only item in the set if there is one, or `null` otherwise. Or else if there is more than one item in the set, throws an Error.

### TriplePattern

A variant of `Triple` that allows `Variable` instances in the subject, predicate, or object.

### TurtleParser

An implementation of [the Data parser API of RDF Interfaces](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#parsing-and-serializing-data).

To synchronously parse a Turtle document, use `TurtleParser.parse()`

### TurtleParser.parse(document, base)

Returns a TurtleParser that has processed `document` with given `base`.

The parsed Graph instance is available at `TurtleParser#graph`:

```javascript
const parse = rdf.TurtleParser.parse('<http://example.com/> a <http://example.com/Page> .');
console.log(parse.graph.toArray().join("\n"));
```

### parse(object, id)

Returns an object generated by parsing the properties of `object` to create Triples about `id`. These can later be serialized to a Turtle document or a Graph.

The format is similar to JSON-LD, except strings are assumed to be IRIs or CURIEs by default. The `@context`, `@vocab`, `@set`, `@list`, and `@id` properties work as in JSON-LD.

The `id` argument, if provided, must be a fully qualified IRI, and should be a `NamedNode` or `BlankNode`.

#### parse(object, id).n3()

Returns a string that's a Turtle document parsed out of `object`.

#### parse(object, id).graphify()

Returns a Graph of the triples parsed out of `object`.

### RDFEnvironment

RDFEnvironment is the data factory that generates RDF nodes, graphs, and stores process-level prefix mappings.

It implements the [RDF Environment API of RDF Interfaces](http://www.w3.org/TR/2011/WD-rdf-interfaces-20110510/#rdf-environment-interfaces).

The rdf module creates one such global environment by default, accessible at `rdf.environment`. Others are created where necessary, e.g. when parsing a Turtle document, and may be created using `new rdf.RDFEnvironment`.

### environment

The `environment` export is the default instance of RDFEnvironment.

Generally, you'll want to alias this to something:

```javascript
const rdfenv = require('rdf').environment;
```

### Prefixes

#### ns(prefix)

Returns an IRI factory, a function that produces an IRI of `prefix` plus the provided argument. It's a simple wrapper around string concatenation:

```javascript
const foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
foaf('knows')
```

#### rdfns(name)

Returns an IRI produced by appending `name` to the rdf: namespace, `http://www.w3.org/1999/02/22-rdf-syntax-ns#`.

#### rdfsns(name)

Returns an IRI produced by appending `name` to the rdfs: namespace, `http://www.w3.org/2000/01/rdf-schema#`.

#### xsdns(name)

Returns an IRI produced by appending `name` to the xsd: namespace, `http://www.w3.org/2001/XMLSchema#`.

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
* `resolve()` resolves a CURIE/term to an IRI. Unlike the environment/profile method, this returns the original string if unsuccessful (for instance, if the string is already a URI).

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
