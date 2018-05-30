var assert = require('assert');
var rdf = require('..');

describe('NamedNode', function(){
	it("instance", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.ok(t instanceof rdf.NamedNode);
		assert.strictEqual(t.nodeType(), 'IRI');
		assert.strictEqual(t.termType, 'NamedNode');
		assert.strictEqual(t.toNT(), '<http://example.com/>');
		assert.strictEqual(t.n3(), '<http://example.com/>');
	});
});
