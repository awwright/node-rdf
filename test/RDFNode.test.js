var assert = require('assert');
var rdf = require('..');

function LiteralTests(){
	it("compare (via sort)", function(){
		// Array to be sorted via RDFNode#compare
		var bros = [
			new rdf.BlankNode('_:a'),
			new rdf.Literal("A String", '@en-GB'),
			new rdf.Literal("A"),
			new rdf.Literal("A String"),
			new rdf.Literal("true", rdf.xsdns('boolean')),
			new rdf.Literal("A String", '@ja'),
			new rdf.Literal("false", rdf.xsdns('boolean')),
			new rdf.BlankNode('b'),
			new rdf.NamedNode("http://example.com/"),
			new rdf.Literal("A String", '@en'),
			new rdf.NamedNode("http://example.com/a"),
			new rdf.BlankNode('_:c'),
			new rdf.NamedNode("http://example.com/b"),
		];
		bros.sort(function(a, b){ return a.compare(b); });
		//bros.forEach(function(v){ console.log(v.toNT()); });
		// I don't know if this order means much to people, but it's an order
		[
			new rdf.NamedNode("http://example.com/"),
			new rdf.NamedNode("http://example.com/a"),
			new rdf.NamedNode("http://example.com/b"),
			new rdf.BlankNode('a'),
			new rdf.BlankNode('b'),
			new rdf.BlankNode('c'),
			new rdf.Literal("A"),
			new rdf.Literal("A String"),
			new rdf.Literal("A String", '@en'),
			new rdf.Literal("A String", '@en-GB'),
			new rdf.Literal("A String", '@ja'),
			new rdf.Literal("false", rdf.xsdns('boolean')),
			new rdf.Literal("true", rdf.xsdns('boolean')),
		].forEach(function(t, i){
			assert(t.equals(bros[i]), 'item '+i+' mismatch');
		});
	});
}

describe('RDFNode', LiteralTests);

describe('RDFNode (with builtins)', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});
	LiteralTests();
});
