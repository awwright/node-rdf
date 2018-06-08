var assert = require('assert');
var rdf = require('..');

function NamedNodeTests(){
	it("js3", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.nodeType(), 'IRI');
		assert.strictEqual(t.toNT(), '<http://example.com/>');
		assert.strictEqual(t.toTurtle(), '<http://example.com/>');
		assert.strictEqual(t.n3(), '<http://example.com/>');
	});
	it("RDF Interfaces", function(){
		/*
		[NoInterfaceObject]
		interface NamedNode : RDFNode {
			 readonly attribute any nominalValue;
		};
		[NoInterfaceObject]
		interface RDFNode {
			 readonly attribute any       nominalValue;
			 readonly attribute DOMString interfaceName;
			 DOMString toString ();
			 any       valueOf ();
			 DOMString toNT ();
			 boolean   equals (any tocompare);
		};
		*/
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.nominalValue, 'http://example.com/');
		assert(t instanceof rdf.RDFNode);
		assert.strictEqual(t.interfaceName, 'NamedNode');
		assert.strictEqual(t.toString(), 'http://example.com/');
		assert.strictEqual(t.valueOf(), 'http://example.com/');
		assert.strictEqual(t.toNT(), '<http://example.com/>');
		assert(t.equals('http://example.com/'));
		assert(t.equals(new rdf.NamedNode('http://example.com/')));
	});
	it("RDF Representation", function(){
		/*
		interface NamedNode : Term {
			 attribute string termType;
			 attribute string value;
			 boolean equals(Term other);
		};
		interface Term {
			 attribute string termType;
			 attribute string value;
			 boolean equals(Term other);
		};
		*/
		var t = new rdf.NamedNode('http://example.com/');
		assert(t instanceof rdf.Term);
		assert.strictEqual(t.termType, 'NamedNode'); // 2017 Community Group variant
		assert.strictEqual(t.value, 'http://example.com/'); // 2017 CG variant
		assert(t.equals(new rdf.NamedNode('http://example.com/')));
	});
	it("valueOf", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.toString(), 'http://example.com/');
	});
	it("toNT", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.toNT(), '<http://example.com/>');
	});
	it("toTurtle", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.toTurtle(), '<http://example.com/>');
	});
	it("n3", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.strictEqual(t.n3(), '<http://example.com/>');
	});
	it("equals", function(){
		var t = new rdf.NamedNode('http://example.com/');
		assert.ok(t.equals(new rdf.NamedNode('http://example.com/')));
		assert.ok(!t.equals(new rdf.NamedNode('http://example.com')));
		assert.ok(t.equals('http://example.com/'));
		assert.ok(!t.equals('http://example.com'));
	});
}

describe('NamedNode', NamedNodeTests);

describe('NamedNode (with builtins)', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});
	NamedNodeTests();
});
