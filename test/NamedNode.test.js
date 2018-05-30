var assert = require('assert');
var rdf = require('..');

describe('NamedNode', function(){
	it("instance", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.ok(t instanceof rdf.NamedNode);
		assert.strictEqual(t.nodeType(), 'IRI');
		assert.strictEqual(t.interfaceName, 'NamedNode'); // 2012 Note variant
		assert.strictEqual(t.termType, 'NamedNode'); // 2017 Community Group variant
		assert.strictEqual(t.toNT(), '<http://example.com/>');
		assert.strictEqual(t.n3(), '<http://example.com/>');
	});
	it("toString", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.toString(), 'http://example.com/');
	});
	it("valueOf", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.toString(), 'http://example.com/');
	});
	it("toNT", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.ok(t instanceof rdf.NamedNode);
		assert.strictEqual(t.nodeType(), 'IRI');
		assert.strictEqual(t.termType, 'NamedNode');
		assert.strictEqual(t.toNT(), '<http://example.com/>');
		assert.strictEqual(t.n3(), '<http://example.com/>');
	});
	it("equals", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.ok(t.equals(new rdf.NamedNode('http://example.com/')));
		assert.ok(!t.equals(new rdf.NamedNode('http://example.com')));
		assert.ok(t.equals('http://example.com/'));
		assert.ok(!t.equals('http://example.com'));
	});
});
describe('NamedNode (with builtins)', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});

	it("instance", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.ok(t instanceof rdf.NamedNode);
		assert.strictEqual(t.nodeType(), 'IRI');
		assert.strictEqual(t.interfaceName, 'NamedNode'); // 2012 Note variant
		assert.strictEqual(t.termType, 'NamedNode'); // 2017 Community Group variant
		assert.strictEqual(t.toNT(), '<http://example.com/>');
		assert.strictEqual(t.n3(), '<http://example.com/>');
	});
	it("toString", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.toString(), 'http://example.com/');
	});
	it("valueOf", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.toString(), 'http://example.com/');
	});
	it("toNT", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.ok(t instanceof rdf.NamedNode);
		assert.strictEqual(t.nodeType(), 'IRI');
		assert.strictEqual(t.termType, 'NamedNode');
		assert.strictEqual(t.toNT(), '<http://example.com/>');
		assert.strictEqual(t.n3(), '<http://example.com/>');
	});
	it("equals", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.ok(t.equals(new rdf.NamedNode('http://example.com/')));
		assert.ok(!t.equals(new rdf.NamedNode('http://example.com')));
		assert.ok(t.equals('http://example.com/'));
		assert.ok(!t.equals('http://example.com'));
	});
});
