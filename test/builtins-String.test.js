var assert = require('assert');
var rdf = require('..');

describe('String builtins', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});

	it("String.resolve rdf:type", function(){
		var t = "rdf:type".resolve();
		assert.strictEqual(t, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
	});
	it("String.resolve rdfs:Class", function(){
		var t = "rdfs:Class".resolve();
		assert.strictEqual(t, "http://www.w3.org/2000/01/rdf-schema#Class");
		assert.equal(typeof t, 'string');
	});
	it("String.resolve unknown CURIE", function(){
		var t = "unknownprefixfoo2:bar".resolve();
		assert.strictEqual(t, "unknownprefixfoo2:bar");
		assert.equal(t, "unknownprefixfoo2:bar");
		assert.equal(typeof t, "string");
		assert.ok("unknownprefixfoo2:bar".equals(t));
	});
	it("String.resolve defined CURIE", function(){
		rdf.environment.setPrefix("unknownprefixfoo2", "http://example.com/2/ex/42/");
		var t = "unknownprefixfoo2:answer".resolve();
		assert.strictEqual(t, "http://example.com/2/ex/42/answer");
		assert.strictEqual(t.valueOf(), "http://example.com/2/ex/42/answer");
		assert.ok("http://example.com/2/ex/42/answer".equals(t));
		rdf.environment.setPrefix("unknownprefixfoo2", null);
		delete rdf.environment.prefixes['unknownprefixfoo2'];
	});
	it("string.resolve() resolved URI", function(){
		var t = "http://slashdot.org/".resolve();
		assert.strictEqual(t, 'http://slashdot.org/');
	});
	it("string.resolve() bnode syntax", function(){
		var t = "_:someBlankNode".resolve();
		assert.strictEqual(t, '_:someBlankNode');
	});
	it("string.n3() <http://slashdot.org/>", function(){
		var t = "http://slashdot.org/".n3();
		assert.strictEqual(t, '<http://slashdot.org/>');
	});
	it('string.l().n3() "PLAINLITERAL"', function(){
		var t = "PLAINLITERAL".l().n3();
		assert.strictEqual(t, '"PLAINLITERAL"');
	});
	it('string.l().n3() "PLAIN LITERAL"', function(){
		var t = "PLAIN LITERAL WITH A SPACE".l().n3();
		assert.strictEqual(t, '"PLAIN LITERAL WITH A SPACE"');
	});
	it('string.l(en).n3() "English language literal"@en', function(){
		var t = "English language literal".l("en").n3();
		assert.strictEqual(t, '"English language literal"@en');
	});
	it('string.tl(xsd:string).n3() "XSD String"^^<http://www.w3.org/2001/XMLSchema#string>', function(){
		var t = "XSD String".tl("xsd:string".resolve()).n3();
		assert.strictEqual(t, '"XSD String"^^<http://www.w3.org/2001/XMLSchema#string>');
	});
});
