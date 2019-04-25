var assert = require('assert');
var rdf = require('..');

function DefaultGraphTests(){
	it("RDF Representation", function(){
		/*
		interface DefaultGraph : Term {
			attribute string termType;
			attribute string value;
			boolean equals(Term other);
		};
		*/
		var t = rdf.factory.defaultGraph();
		assert(t instanceof rdf.Term);
		assert.strictEqual(t.termType, 'DefaultGraph');
		assert.strictEqual(t.value, '');
	});
	it("DefaultGraph#toNT", function(){
		var t = rdf.factory.defaultGraph();
		assert.throws(function(){ t.toNT(); });
	});
	it("DefaultGraph#toTurtle", function(){
		var t = rdf.factory.defaultGraph();
		assert.throws(function(){ t.toTurtle(); });
	});
	it("DefaultGraph#toString", function(){
		var t = rdf.factory.defaultGraph();
		assert.strictEqual(t.toString(), '');
	});
	it("DefaultGraph#equals", function(){
		var t1 = rdf.factory.defaultGraph();
		var t2 = rdf.factory.defaultGraph();
		assert(t1.equals(t2));
	});
}

describe('DefaultGraph', DefaultGraphTests);

describe('DefaultGraph (with builtins)', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});
	DefaultGraphTests();
});
