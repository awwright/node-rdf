var assert = require('assert');
var rdf = require('..');

describe('Variable', function(){
	it("instance", function(){
		var t = new rdf.Variable('name');
		assert.ok(t instanceof rdf.Variable);
		assert.strictEqual(t.nodeType(), 'Variable');
		assert.strictEqual(t.interfaceName, 'Variable'); // 2012 Note variant
		assert.strictEqual(t.termType, 'Variable'); // 2017 Community Group variant
	});
	it("Variable(undefined) requires string argument", function(){
		assert.throws(function(){
			var t = new rdf.Variable();
		});
	});
	it("Variable(null) requires string argument", function(){
		assert.throws(function(){
			var t = new rdf.Variable(null);
		});
	});
	it("toNT throws", function(){
		var t = new rdf.Variable('name');
		assert.throws(function(){
			t.toNT();
		});
	});
	it("n3", function(){
		var t = new rdf.Variable('name');
		assert.strictEqual(t.n3(), '?name');
	});
});
