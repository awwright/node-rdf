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
		assert.strictEqual(t.interfaceName, 'Literal'); // 2012 Note variant
		assert.strictEqual(t.termType, 'Literal'); // 2017 Community Group variant
	});
	it("Language instance @en", function(){
		var t = new rdf.Literal('That Seventies Show', '@en');
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"That Seventies Show"@en');
		//assert.strictEqual(t.n3(), '123');
		// "If tocompare is an instance of RDFNode then this method returns true if an only if all attributes on the two interfaces are equivalent."
		assert.ok(t.equals(new rdf.Literal('That Seventies Show', '@en')));
		// "If tocompare is NOT an instance of RDFNode then the it must be compared against the result of calling toValue on this node."
		assert.ok(t.equals('That Seventies Show'));
		assert.ok(!t.equals(new rdf.Literal('String', '@en')));
		assert.ok(!t.equals(new rdf.Literal('That Seventies Show', '@fr-be')));
		assert.ok(!t.equals('Cette Série des Années Septante'));
	});
	it("Language instance @fr-be", function(){
		var t = new rdf.Literal('Cette Série des Années Septante', '@fr-be');
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"Cette S\\u00E9rie des Ann\\u00E9es Septante"@fr-be');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('Cette Série des Années Septante', '@fr-be')));
		assert.ok(t.equals('Cette Série des Années Septante'));
		assert.ok(!t.equals(new rdf.Literal('Cette Serie des Annees Septante', '@fr-be')));
		assert.ok(!t.equals(new rdf.Literal('Cette Série des Années Septante', '@en')));
		assert.ok(!t.equals('That Seventies Show'));
	});
	it("Typed instance", function(){
		var t = new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer');
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(t.equals('123'));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
		assert.ok(!t.equals('1'));
	});
});

describe('Literal (with builtins)', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});

	it("Plain instance", function(){
		var t = new rdf.Literal("A String");
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"A String"');
		assert.strictEqual(t.n3(), '"A String"');
		assert.strictEqual(t.interfaceName, 'Literal'); // 2012 Note variant
		assert.strictEqual(t.termType, 'Literal'); // 2017 Community Group variant
	});
	it("Language instance @en", function(){
		var t = new rdf.Literal('That Seventies Show', '@en');
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"That Seventies Show"@en');
		//assert.strictEqual(t.n3(), '123');
		// "If tocompare is an instance of RDFNode then this method returns true if an only if all attributes on the two interfaces are equivalent."
		assert.ok(t.equals('That Seventies Show'.l('en')));
		// "If tocompare is NOT an instance of RDFNode then the it must be compared against the result of calling toValue on this node."
		assert.ok(!t.equals('String'.l('en')));
		assert.ok(!t.equals('That Seventies Show'.l('fr-be')));
		// In Builtins mode a string will be treated as a NamedNode so this won't work as expected
		//assert.ok(t.equals('That Seventies Show'));
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
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
	});
});
