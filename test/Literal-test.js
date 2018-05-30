var assert = require('assert');
var rdf = require('..');

describe('Literal', function(){
	it("Plain instance", function(){
		var t = new rdf.Literal("A String");
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"A String"');
		assert.strictEqual(t.n3(), '"A String"');
	});
	it("Language instance @en", function(){
		var t = new rdf.Literal('That Seventies Show', '@en');
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"That Seventies Show"@en');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('That Seventies Show', '@en')));
		assert.ok(!t.equals(new rdf.Literal('String', '@en')));
		assert.ok(!t.equals(new rdf.Literal('That Seventies Show', '@fr-be')));
	});
	it("Language instance @fr-be", function(){
		var t = new rdf.Literal('Cette Série des Années Septante', '@fr-be');
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"Cette S\\u00E9rie des Ann\\u00E9es Septante"@fr-be');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('Cette Série des Années Septante', '@fr-be')));
		assert.ok(!t.equals(new rdf.Literal('Cette Serie des Annees Septante', '@fr-be')));
		assert.ok(!t.equals(new rdf.Literal('Cette Série des Années Septante', '@en')));
	});
	it("Typed instance", function(){
		var t = new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer');
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('0', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
	});
});
