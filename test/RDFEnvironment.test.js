var assert = require('assert');
var rdf = require('..');

describe('rdf.environment.resolve', function(){
	it('builtin prefixes', function(){
		var env = new rdf.RDFEnvironment;
		assert.strictEqual(env.resolve("rdf:type"), "http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
		assert.strictEqual(env.resolve("rdfs:Class"), "http://www.w3.org/2000/01/rdf-schema#Class");
		assert.strictEqual(env.resolve("unknownprefix2:foo"), null);
	});
	it('define prefix', function(){
		var env = new rdf.RDFEnvironment;
		assert.strictEqual(env.resolve("unkfoo:foo"), null);
		env.setPrefix("unkfoo", "http://example.com/1/ex/42/");
		assert.strictEqual(env.resolve("unkfoo:foo"), "http://example.com/1/ex/42/foo");
	});
	it('define default prefix', function(){
		var env = new rdf.RDFEnvironment;
		assert.strictEqual(env.resolve(":bar"), null);
		env.setDefaultPrefix("http://example.com/2/ex/42/");
		assert.strictEqual(env.resolve(":answer"), "http://example.com/2/ex/42/answer");
	});
	it('createBlankNode', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createBlankNode();
		assert.ok(t instanceof rdf.BlankNode);
	});
	it('createNamedNode', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createNamedNode('http://example.com/');
		assert.ok(t instanceof rdf.NamedNode);
	});
	it('createNamedNode expects string', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			var t = env.createNamedNode();
		});
		assert.throws(function(){
			var t = env.createNamedNode(null);
		});
		assert.throws(function(){
			var t = env.createNamedNode(true);
		});
	});
	it('createLiteral(value)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createLiteral('Some Literal');
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.toString(), 'Some Literal');
		assert.strictEqual(t.datatype.toString(), 'http://www.w3.org/2001/XMLSchema#string');
		assert.strictEqual(t.language, null);
	});
	it('createLiteral(value, datatype)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createLiteral('<p>Some Literal</p>', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), '<p>Some Literal</p>');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.equal(t.language, null);
	});
	it('createLiteral(value, NamedNode)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createLiteral('<p>Some Literal</p>', new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'));
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), '<p>Some Literal</p>');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.equal(t.language, null);
	});
	it('createLiteral(value, language)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createLiteral('Some Literal', 'en');
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), 'Some Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.equal(t.language, 'en');
	});
	it('createLiteral(value, LangTag)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createLiteral('Some Literal', '@en');
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), 'Some Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.equal(t.language, 'en');
	});
	it('createLiteral(value, null, datatype)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createLiteral('<p>Some Literal</p>', null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), '<p>Some Literal</p>');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.equal(t.language, null);
	});
	it('createLiteral(value, null, NamedNode)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createLiteral('<p>Some Literal</p>', null, new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'));
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), '<p>Some Literal</p>');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.equal(t.language, null);
	});
	it('createLanguageLiteral(value) throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			var t = env.createLanguageLiteral('<p>Some Literal</p>');
		});
	});
	it('createLanguageLiteral(value, datatype) throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			var t = env.createLanguageLiteral('<p>Some Literal</p>', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		});
	});
	it('createLanguageLiteral(value, language)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createLiteral('Some Literal', 'en');
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), 'Some Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.equal(t.language, 'en');
	});
	it('createTypedLiteral(value) throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			env.createTypedLiteral('<p>Some Literal</p>');
		});
	});
	it('createTypedLiteral(value, datatype)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createTypedLiteral('<p>Some Literal</p>', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), '<p>Some Literal</p>');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.equal(t.language, null);
	});
	it('createTypedLiteral(value, NamedNode)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createTypedLiteral('<p>Some Literal</p>', new rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'));
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.toString(), '<p>Some Literal</p>');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral');
		assert.equal(t.language, null);
	});
	it('createTypedLiteral(value, language) throws', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			var t = env.createTypedLiteral('Some Literal', 'en');
		});
	});
	it('createTriple(iri, iri, iri)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createTriple(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
		);
		assert.ok(t);
	});
	it('createTriple(bnode, iri, bnode)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createTriple(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
		);
		assert.ok(t);
	});
	it('createTriple(iri, iri, literal)', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createTriple(
			env.createNamedNode('http://example.com/foo'),
			env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			env.createLiteral('string!'),
		);
		assert.ok(t);
	});
	it('createTriple: no literal subject', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			env.createTriple(
				env.createLiteral('string!'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('createTriple: no bnode predicate', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			env.createTriple(
				env.createNamedNode('http://example.com/foo'),
				env.createBlankNode(),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('createTriple: no literal predicate', function(){
		var env = new rdf.RDFEnvironment;
		assert.throws(function(){
			env.createTriple(
				env.createNamedNode('http://example.com/foo'),
				env.createLiteral('string!'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
		});
	});
	it('createProfile', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createProfile();
		assert.ok(t instanceof rdf.Profile);
	});
	it('createTermMap', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createTermMap();
		assert.ok(t instanceof rdf.TermMap);
	});
	it('createPrefixMap', function(){
		var env = new rdf.RDFEnvironment;
		var t = env.createPrefixMap();
		assert.ok(t instanceof rdf.PrefixMap);
	});
});
