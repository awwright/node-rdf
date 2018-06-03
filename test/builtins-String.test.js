var assert = require('assert');
var rdf = require('..');

describe('String builtins', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});

	it("String.prototype.profile", function(){
		var t = "".profile;
		assert(t instanceof rdf.Profile);
		assert.strictEqual(t, rdf.environment);
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
		assert.strictEqual("unknownprefixfoo2:answer".resolve(), 'unknownprefixfoo2:answer');
		rdf.environment.setPrefix("unknownprefixfoo2", "http://example.com/2/ex/42/");
		var t = "unknownprefixfoo2:answer".resolve();
		assert.strictEqual(t, "http://example.com/2/ex/42/answer");
		assert.strictEqual(t.valueOf(), "http://example.com/2/ex/42/answer");
		assert.ok("http://example.com/2/ex/42/answer".equals(t));
		rdf.environment.setPrefix("unknownprefixfoo2", null);
		assert.strictEqual("unknownprefixfoo2:answer".resolve(), 'unknownprefixfoo2:answer');
	});
	it("String.resolve defined term", function(){
		assert.strictEqual("term2".resolve(), 'term2');
		rdf.environment.setTerm("term2", "http://example.com/2/ex/42");
		var t = "term2".resolve();
		assert.strictEqual(t, "http://example.com/2/ex/42");
		//assert.strictEqual(t.valueOf(), "http://example.com/2/ex/42");
		//assert.ok("http://example.com/2/ex/42".equals(t));
		rdf.environment.setTerm("term2", null);
		assert.strictEqual("term2".resolve(), 'term2');
	});
	it("String.resolve http: URI", function(){
		assert.strictEqual("http://example.com/foo".resolve(), 'http://example.com/foo');
	});
	it("String.resolve https: URI", function(){
		assert.strictEqual("https://example.com/foo".resolve(), 'https://example.com/foo');
	});
	it("String.resolve urn:uuid: URI", function(){
		assert.strictEqual("urn:uuid:76E923E9-67CD-47AC-AB72-1C339A31CE57".resolve(), 'urn:uuid:76E923E9-67CD-47AC-AB72-1C339A31CE57');
	});
	it("string.resolve() resolved URI", function(){
		var t = "http://slashdot.org/".resolve();
		assert.strictEqual(t, 'http://slashdot.org/');
	});
	it("string.resolve() bnode syntax", function(){
		var t = "_:someBlankNode".resolve();
		assert.strictEqual(t, '_:someBlankNode');
	});
	it("string.n3()", function(){
		var t = "http://slashdot.org/".n3();
		assert.strictEqual(t, '<http://slashdot.org/>');
	});
	it("string.toNT()", function(){
		var t = "http://slashdot.org/".toNT();
		assert.strictEqual(t, '<http://slashdot.org/>');
	});
	it('string.l().n3()', function(){
		var t = "PLAINLITERAL".l().n3();
		assert.strictEqual(t, '"PLAINLITERAL"');
	});
	it('string.l().toNT()', function(){
		var t = "PLAINLITERAL".l().toNT();
		assert.strictEqual(t, '"PLAINLITERAL"');
	});
	it('string.l().n3()', function(){
		var t = "PLAIN LITERAL WITH A SPACE".l().n3();
		assert.strictEqual(t, '"PLAIN LITERAL WITH A SPACE"');
	});
	it('string.l().toNT()', function(){
		var t = "PLAIN LITERAL WITH A SPACE".l().toNT();
		assert.strictEqual(t, '"PLAIN LITERAL WITH A SPACE"');
	});
	it('string.l(en).n3()', function(){
		var t = "English language literal".l("en").n3();
		assert.strictEqual(t, '"English language literal"@en');
	});
	it('string.l(en).toNT()', function(){
		var t = "English language literal".l("en").toNT();
		assert.strictEqual(t, '"English language literal"@en');
	});
	it('string.tl(xsd:string).n3()', function(){
		var t = "XSD String".tl("xsd:string".resolve()).n3();
		assert.strictEqual(t, '"XSD String"');
	});
	it('string.tl(xsd:string).toNT()', function(){
		var t = "XSD String".tl("xsd:string".resolve()).toNT();
		assert.strictEqual(t, '"XSD String"');
	});
});
