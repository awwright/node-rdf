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
});
