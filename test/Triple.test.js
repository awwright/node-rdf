var assert = require('assert');
var rdf = require('..');

describe('Triple', function(){
	it('Triple(iri, iri, iri)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.Triple(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
		);
		assert.ok(t);
	});
	it('Triple(bnode, iri, bnode)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.Triple(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
		);
		assert.ok(t);
	});
	it('Triple(iri, iri, literal)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.Triple(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createLiteral('string!'),
		);
		assert.ok(t);
	});
	it('Triple: literal subject throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				env.createLiteral('string!'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Triple: bnode predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				env.createNamedNode('http://example.com/foo'),
				env.createBlankNode(),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Triple: literal predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				env.createNamedNode('http://example.com/foo'),
				env.createLiteral('string!'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Triple: variable subject throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				new rdf.Variable('s'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Triple: variable predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				env.createNamedNode('http://example.com/foo'),
				new rdf.Variable('p'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Triple: variable object throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				env.createNamedNode('http://example.com/foo'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				new rdf.Variable('o'),
			);
		});
	});
	it('Triple: null subject throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				null,
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Triple: null predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				env.createNamedNode('http://example.com/foo'),
				null,
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Triple: null object throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Triple(
				env.createNamedNode('http://example.com/foo'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				null,
			);
		});
	});
	it('Triple: string subject', function(){
		var env = new rdf.RDFEnvironment;
		new rdf.Triple(
			'http://example.com/foo',
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
		);
	});
	it('Triple: string predicate', function(){
		var env = new rdf.RDFEnvironment;
		new rdf.Triple(
			env.createNamedNode('http://example.com/foo'),
			'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
		);
	});
	it('Triple: string object', function(){
		var env = new rdf.RDFEnvironment;
		new rdf.Triple(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			'http://www.w3.org/2000/01/rdf-schema#Class',
		);
	});
	it("toString", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Triple(nn, nn, nn);
		assert.strictEqual(t.toString(), '<http://example.com/> <http://example.com/> <http://example.com/> .');
	});
	it("equals", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Triple(nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		assert.ok(t.equals(new rdf.Triple(nn2, nn2, nn2)));
	});
	it("equals (negative subject)", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Triple(nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		var nn3 = new rdf.NamedNode('http://example.org/foo');
		assert(!t.equals(new rdf.Triple(nn3, nn2, nn2)));
	});
	it("equals (negative predicate)", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Triple(nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		var nn3 = new rdf.NamedNode('http://example.org/foo');
		assert(!t.equals(new rdf.Triple(nn2, nn3, nn2)));
	});
	it("equals (negative object)", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Triple(nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		var nn3 = new rdf.NamedNode('http://example.org/foo');
		assert(!t.equals(new rdf.Triple(nn2, nn2, nn3)));
	});
	// TODO: behavior for testing equal of things that are not Triple
});
