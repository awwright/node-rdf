var assert = require('assert');
var rdf = require('..');

describe('BlankNode', function(){
	it("instance", function(){
		var t = new rdf.BlankNode();
		assert.ok(t instanceof rdf.BlankNode);
		assert.strictEqual(t.nodeType(), 'BlankNode');
		assert.strictEqual(t.termType, 'BlankNode');
		assert.strictEqual(t.toNT(), t.n3());
	});
});
