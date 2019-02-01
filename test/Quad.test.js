var assert = require('assert');
var rdf = require('..');

describe('Quad', function(){
	it('Quad(iri, iri, iri)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.Quad(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			env.createNamedNode('http://example.com/graph'),
		);
		assert.ok(t);
	});
	it('Quad(bnode, iri, bnode)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.Quad(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			env.createNamedNode('http://example.com/graph'),
		);
		assert.ok(t);
	});
	it('Quad(iri, iri, literal)', function(){
		var env = new rdf.RDFEnvironment;
		var t = new rdf.Quad(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createLiteral('string!'),
			env.createNamedNode('http://example.com/graph'),
		);
		assert.ok(t);
	});
	it('Quad: literal subject throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				env.createLiteral('string!'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Quad: bnode predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				env.createNamedNode('http://example.com/foo'),
				env.createBlankNode(),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Quad: literal predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				env.createNamedNode('http://example.com/foo'),
				env.createLiteral('string!'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Quad: variable subject throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				new rdf.Variable('s'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Quad: variable predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				env.createNamedNode('http://example.com/foo'),
				new rdf.Variable('p'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Quad: variable object throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				env.createNamedNode('http://example.com/foo'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				new rdf.Variable('o'),
			);
		});
	});
	it('Quad: null subject throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				null,
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Quad: null predicate throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				env.createNamedNode('http://example.com/foo'),
				null,
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('Quad: null object throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			new rdf.Quad(
				env.createNamedNode('http://example.com/foo'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				null,
			);
		});
	});
	it('Quad: string subject', function(){
		var env = new rdf.RDFEnvironment;
		new rdf.Quad(
			'http://example.com/foo',
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			env.createNamedNode('http://example.com/graph'),
		);
	});
	it('Quad: string predicate', function(){
		var env = new rdf.RDFEnvironment;
		new rdf.Quad(
			env.createNamedNode('http://example.com/foo'),
			'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			env.createNamedNode('http://example.com/graph'),
		);
	});
	it('Quad: string object', function(){
		var env = new rdf.RDFEnvironment;
		new rdf.Quad(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			'http://www.w3.org/2000/01/rdf-schema#Class',
			env.createNamedNode('http://example.com/graph'),
		);
	});
	it('Quad: string graph', function(){
		var env = new rdf.RDFEnvironment;
		new rdf.Quad(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			'http://example.com/graph',
		);
	});
	it("toString", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Quad(nn, nn, nn, nn);
		assert.strictEqual(t.toString(), '<http://example.com/> <http://example.com/> <http://example.com/> <http://example.com/> .');
	});
	it("equals", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Quad(nn, nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		assert.ok(t.equals(new rdf.Quad(nn2, nn2, nn2, nn2)));
	});
	it("equals (negative subject)", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Quad(nn, nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		var nn3 = new rdf.NamedNode('http://example.org/foo');
		assert(!t.equals(new rdf.Quad(nn3, nn2, nn2, nn2)));
	});
	it("equals (negative predicate)", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Quad(nn, nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		var nn3 = new rdf.NamedNode('http://example.org/foo');
		assert(!t.equals(new rdf.Quad(nn2, nn3, nn2, nn2)));
	});
	it("equals (negative object)", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Quad(nn, nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		var nn3 = new rdf.NamedNode('http://example.org/foo');
		assert(!t.equals(new rdf.Quad(nn2, nn2, nn3, nn2)));
	});
	it("equals (negative graph)", function(){
		var nn = new rdf.NamedNode('http://example.com/');
		var t = new rdf.Quad(nn, nn, nn, nn);
		var nn2 = new rdf.NamedNode('http://example.com/');
		var nn3 = new rdf.NamedNode('http://example.org/foo');
		assert(!t.equals(new rdf.Quad(nn2, nn2, nn2, nn3)));
	});
});
