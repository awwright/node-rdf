var assert = require('assert');
var rdf = require('..');

describe('Literal', function(){
	it("js3", function(){
		var t = new rdf.Literal("A String");
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.type, null);
		assert.strictEqual(t.language, null);
		assert.strictEqual(t.toNT(), '"A String"');
		assert.strictEqual(t.toTurtle(), '"A String"');
		assert.strictEqual(t.n3(), '"A String"');
	});
	it("RDF Interfaces", function(){
		/*
		[NoInterfaceObject]
		interface Literal : RDFNode {
			 readonly attribute DOMString  nominalValue;
			 readonly attribute DOMString? language;
			 readonly attribute NamedNode? datatype;
			 any valueOf ();
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
		var t = new rdf.Literal("A String");
		assert(t instanceof rdf.RDFNode);
		assert.strictEqual(t.nominalValue, "A String");
		assert.strictEqual(t.datatype.nominalValue, "http://www.w3.org/2001/XMLSchema#string");
		assert.strictEqual(t.language, null);
		assert.strictEqual(t.toNT(), '"A String"');
		assert(t.equals(new rdf.Literal("A String")));
	});
	it("RDF Representation", function(){
		/*
		interface Literal : Term {
			 attribute string    termType;
			 attribute string    value;
			 attribute string    language;
			 attribute NamedNode datatype;
			 boolean equals(Term other);
		};
		interface Term {
			 attribute string termType;
			 attribute string value;
			 boolean equals(Term other);
		};
		*/
		var t = new rdf.Literal("A String");
		assert(t instanceof rdf.Term);
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.value, 'A String');
		assert.strictEqual(t.datatype.value, 'http://www.w3.org/2001/XMLSchema#string');
	});
	it("Language instance @en", function(){
		var t = new rdf.Literal('That Seventies Show', '@en');
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.datatype.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.strictEqual(t.toNT(), '"That Seventies Show"@en');
		assert.strictEqual(t.toTurtle(), '"That Seventies Show"@en');
		assert.strictEqual(t.n3(), '"That Seventies Show"@en');
		// Equality tests
		assert.ok(t.equals(new rdf.Literal('That Seventies Show', '@en')));
		//assert.ok(t.equals('That Seventies Show'));
		assert.ok(!t.equals(new rdf.Literal('String', '@en')));
		assert.ok(!t.equals(new rdf.Literal('That Seventies Show', '@fr-be')));
		//assert.ok(!t.equals('Cette Série des Années Septante'));
	});
	it("Language instance @fr-be", function(){
		var t = new rdf.Literal('Cette Série des Années Septante', 'fr-be');
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.strictEqual(t.toNT(), '"Cette S\\u00E9rie des Ann\\u00E9es Septante"@fr-be');
		//assert.strictEqual(t.n3(), '123');
		// Equality tests
		assert.ok(t.equals(new rdf.Literal('Cette Série des Années Septante', '@fr-be')));
		assert.ok(!t.equals(new rdf.Literal('Cette Serie des Annees Septante', '@fr-be')));
		assert.ok(!t.equals(new rdf.Literal('Cette Série des Années Septante', '@en')));
		assert.ok(!t.equals('Cette Série des Années Septante'));
		assert.ok(!t.equals('That Seventies Show'));
	});
	it("Typed instance (string)", function(){
		var t = new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer');
		assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/2001/XMLSchema#integer');
		assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
		//assert.strictEqual(t.n3(), '123');
		// Equality tests
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals('123'));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
		assert.ok(!t.equals('1'));
	});
	it("Typed instance (NamedNode)", function(){
		var t = new rdf.Literal('123', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#integer'));
		assert.ok(t instanceof rdf.Literal);
		assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/2001/XMLSchema#integer');
		assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals('123'));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
		assert.ok(!t.equals('1'));
	});
	it("Typed instance (string) (xsd:string)", function(){
		var t = new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#string');
		assert.ok(t instanceof rdf.Literal);
		// This datatype causes this exeption
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/2001/XMLSchema#string');
		assert.strictEqual(t.toNT(), '"123"');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#string')));
		assert.ok(t.equals(new rdf.Literal('123')));
		assert.ok(!t.equals('123'));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
		assert.ok(!t.equals('1'));
	});
	it("Typed instance (string) (rdf:langString)", function(){
		var t = new rdf.Literal('123', '@en', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.ok(t instanceof rdf.Literal);
		// Leave this behavior undefined for now, consider this deprecated anyways
		//assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.strictEqual(t.toNT(), '"123"@en');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('123', '@en')));
		assert.ok(!t.equals('123'));
		assert.ok(!t.equals(new rdf.Literal('123')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#string')));
		assert.ok(!t.equals('1'));
	});
	it("Typed instance (NamedNode) (xsd:string)", function(){
		var t = new rdf.Literal('123', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#string'));
		assert.ok(t instanceof rdf.Literal);
		//assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/2001/XMLSchema#string');
		assert.strictEqual(t.toNT(), '"123"');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#string')));
		assert.ok(t.equals(new rdf.Literal('123')));
		assert.ok(!t.equals('123'));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
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
		assert.equal(t.language, 'en');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
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
		var t = new rdf.Literal('Cette Série des Années Septante', 'fr-be');
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.language, 'fr-be');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.strictEqual(t.nodeType(), 'PlainLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"Cette S\\u00E9rie des Ann\\u00E9es Septante"@fr-be');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('Cette Série des Années Septante', '@fr-be')));
		assert.ok(!t.equals(new rdf.Literal('Cette Serie des Annees Septante', '@fr-be')));
		assert.ok(!t.equals(new rdf.Literal('Cette Série des Années Septante', '@en')));

	});
	it("Typed instance (string)", function(){
		var t = new rdf.Literal('123', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#integer'));
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.language, undefined);
		assert.equal(t.datatype.toString(), 'http://www.w3.org/2001/XMLSchema#integer');
		assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
	});
	it("Typed instance (NamedNode)", function(){
		var t = new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer');
		assert.ok(t instanceof rdf.Literal);
		assert.equal(t.language, undefined);
		assert.equal(t.datatype.toString(), 'http://www.w3.org/2001/XMLSchema#integer');
		assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
		//assert.strictEqual(t.n3(), '123');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
	});
	describe("valueOf", function(){
		testValueOf("A STRING", 'string', "A STRING");
		testValueOf("true", "boolean", true);
		testValueOf("1", "boolean", true);
		testValueOf("false", "boolean", false);
		testValueOf("0", "boolean", false);
		testValueOf("0.5", "float", 0.5);
		testValueOf("INF", "float", Number.POSITIVE_INFINITY);
		testValueOf("-INF", "float", Number.NEGATIVE_INFINITY);
		testValueOf("NaN", "float", 0/0);
		testValueOf("-14000", "integer", -14000);
		testValueOf("-9223372036854775808", "long", -9223372036854775808);
		testValueOf("9223372036854775807", "long", 9223372036854775807);
		testValueOf("1.578125", "float", 1.578125);
		testValueOf("-1.2344e56", "float", -1.2344e56);
		testValueOf("-42", "nonPositiveInteger", -42);
		testValueOf("0", "nonPositiveInteger", 0);
		testValueOf("42", "nonNegativeInteger", 42);
		testValueOf("0", "nonNegativeInteger", 0);
		testValueOf("-42", "negativeInteger", -42);
		testValueOf("-2147483648", "long", -2147483648);
		testValueOf("2147483647", "long", 2147483647);
		testValueOf("2000-01-01", "date", new Date('Sat, 01 Jan 2000 00:00:00 GMT'));
		//testValueOf("21:32:52", "time", new Date('Sat, 01 Jan 2000 00:00:00 GMT')); // There's no good way to represent just time-of-day... Ignore this guy?
		testValueOf("2001-10-26T21:32:52.12679", "dateTime", new Date('2001-10-26T21:32:52.12679'));
		// TODO probbly should verify the inputs are of the correct range?
	});
});

function testValueOf(literal, type, test){
	// Literal must be a string
	it('Literal('+JSON.stringify(literal)+', xsd:'+type+').valueOf()', function(){
		var value = new rdf.Literal(literal, rdf.xsdns(type)).valueOf();
		if(type=='date' || type=='dateTime'){
			assert.ok(value instanceof Date);
			assert.strictEqual(value.getTime(), test.getTime());
		}else if(Number.isNaN(test)){
			assert.ok(Number.isNaN(value));
		}else{
			assert.strictEqual(value, test);
		}
	});
}
