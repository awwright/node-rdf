var assert = require('assert');
var rdf = require('..');

describe('TriplePattern', function(){
	it('TriplePattern(iri, iri, iri)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.TriplePattern(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
		);
		assert.ok(t);
	});
	it('TriplePattern(variable, variable, variable)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.TriplePattern(
			new rdf.Variable('s'),
			new rdf.Variable('p'),
			new rdf.Variable('o'),
		);
		assert.ok(t);
	});
	it('TriplePattern(bnode, iri, bnode)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.TriplePattern(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
		);
		assert.ok(t);
	});
	it('TriplePattern(iri, iri, literal)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.TriplePattern(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createLiteral('string!'),
		);
		assert.ok(t);
	});
	it('TriplePattern: literal subject throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.TriplePattern(
				env.createLiteral('string!'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('TriplePattern: bnode predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.TriplePattern(
				env.createNamedNode('http://example.com/foo'),
				env.createBlankNode(),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('TriplePattern: literal predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.TriplePattern(
				env.createNamedNode('http://example.com/foo'),
				env.createLiteral('string!'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it("toString", function(){
		var t = new rdf.TriplePattern(
			new rdf.Variable('s'),
			new rdf.Variable('p'),
			new rdf.Variable('o'),
		);
		assert.strictEqual(t.toString(), '?s ?p ?o .');
	});
	it("equals", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.TriplePattern(nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		assert.ok(t.equals(new rdf.TriplePattern(nn2, nn2, nn2)));
	});
});
