var assert = require('assert');
var rdf = require('..');

function LiteralTests(){
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
		assert.strictEqual(t.language, 'en');
		assert.strictEqual(t.toNT(), '"That Seventies Show"@en');
		assert.strictEqual(t.toTurtle(), '"That Seventies Show"@en');
		assert.strictEqual(t.toTurtle(), '"That Seventies Show"@en');
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
		assert.strictEqual(t.language, 'fr-be');
		assert.strictEqual(t.toNT(), '"Cette S\\u00E9rie des Ann\\u00E9es Septante"@fr-be');
		assert.strictEqual(t.toTurtle(), '"Cette S\\u00E9rie des Ann\\u00E9es Septante"@fr-be');
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
		assert.strictEqual(t.language, null);
		assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
		assert.strictEqual(t.toTurtle(), '123');
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
		assert.strictEqual(t.language, null);
		assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
		assert.strictEqual(t.toTurtle(), '123');
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
		assert.strictEqual(t.language, null);
		assert.strictEqual(t.toNT(), '"123"');
		//assert.strictEqual(t.toTurtle(), '123');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#string')));
		assert.ok(t.equals(new rdf.Literal('123')));
		assert.ok(!t.equals('123'));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
		assert.ok(!t.equals('1'));
	});
	it("Language string (rdf:langString)", function(){
		var t = new rdf.Literal('123', '@en', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.ok(t instanceof rdf.Literal);
		// Leave this behavior undefined for now, consider this deprecated anyways
		//assert.strictEqual(t.nodeType(), 'TypedLiteral');
		assert.strictEqual(t.termType, 'Literal');
		assert.equal(t.datatype.toString(), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
		assert.strictEqual(t.language, 'en');
		assert.strictEqual(t.toNT(), '"123"@en');
		assert.strictEqual(t.toTurtle(), '"123"@en');
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
		assert.strictEqual(t.language, null);
		assert.strictEqual(t.toNT(), '"123"');
		assert.strictEqual(t.toTurtle(), '"123"');
		assert.ok(t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#string')));
		assert.ok(t.equals(new rdf.Literal('123')));
		assert.ok(!t.equals('123'));
		assert.ok(!t.equals(new rdf.Literal('1', 'http://www.w3.org/2001/XMLSchema#integer')));
		assert.ok(!t.equals(new rdf.Literal('123', 'http://www.w3.org/2001/XMLSchema#decimal')));
	});
	describe("toTurtle", function(){
		it("TypedLiteral xsd:integer", function(){
			var t = new rdf.Literal('123', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#integer'));
			assert.strictEqual(t.toNT(), '"123"^^<http://www.w3.org/2001/XMLSchema#integer>');
			assert.strictEqual(t.toTurtle(), '123');
		});
		it("TypedLiteral invalid xsd:integer", function(){
			var t = new rdf.Literal('something', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#integer'));
			assert.strictEqual(t.toNT(), '"something"^^<http://www.w3.org/2001/XMLSchema#integer>');
			assert.strictEqual(t.toTurtle(), '"something"^^<http://www.w3.org/2001/XMLSchema#integer>');
		});
		it("TypedLiteral xsd:string", function(){
			var t = new rdf.Literal('a string', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#string'));
			assert.strictEqual(t.toNT(), '"a string"'); // NT strips xsd:string as a historical relic
			assert.strictEqual(t.toTurtle(), '"a string"');
		});
		it("TypedLiteral xsd:decimal", function(){
			var t = new rdf.Literal('123.0', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#decimal'));
			assert.strictEqual(t.toNT(), '"123.0"^^<http://www.w3.org/2001/XMLSchema#decimal>');
			assert.strictEqual(t.toTurtle(), '123.0');
		});
		it("TypedLiteral xsd:double", function(){
			var t = new rdf.Literal('4.2E9', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#double'));
			assert.strictEqual(t.toNT(), '"4.2E9"^^<http://www.w3.org/2001/XMLSchema#double>');
			assert.strictEqual(t.toTurtle(), '4.2E9');
		});
		it("TypedLiteral xsd:boolean", function(){
			var t = new rdf.Literal('true', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#boolean'));
			assert.strictEqual(t.toNT(), '"true"^^<http://www.w3.org/2001/XMLSchema#boolean>');
			assert.strictEqual(t.toTurtle(), 'true');
		});
		it("TypedLiteral xsd:boolean (number)", function(){
			var t = new rdf.Literal('1', new rdf.NamedNode('http://www.w3.org/2001/XMLSchema#boolean'));
			assert.strictEqual(t.toNT(), '"1"^^<http://www.w3.org/2001/XMLSchema#boolean>');
			assert.strictEqual(t.toTurtle(), '"1"^^<http://www.w3.org/2001/XMLSchema#boolean>');
		});
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
}

describe('Literal', LiteralTests);

describe('Literal (with builtins)', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});
	LiteralTests();
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
