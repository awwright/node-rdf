var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
rdf.setBuiltins();

vows.describe('String builtins').addBatch(
{ "String.resolve rdf:type":
	{ topic: "rdf:type".resolve()
	, "Equals input": function(t){ assert.strictEqual(t, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"); }
	}
, "String.resolve rdfs:Class":
	{ topic: "rdfs:Class".resolve()
	, "Equals input": function(t){ assert.strictEqual(t, "http://www.w3.org/2000/01/rdf-schema#Class"); }
	, "is String": function(t){ assert.isString(t); }
	}
, "String.resolve unknown CURIE":
	{ topic: "unknownprefixfoo2:bar".resolve()
	, "strictEquals input": function(t){ assert.strictEqual(t, "unknownprefixfoo2:bar"); }
	, "Equals input": function(t){ assert.equal(t, "unknownprefixfoo2:bar"); }
	, "Typeof string": function(t){ assert.typeOf(t, "string"); }
	, ".equals()": function(t){ assert.isTrue("unknownprefixfoo2:bar".equals(t)); }
	, "Add CURIE mapping":
		{ topic: function(){ rdf.environment.setPrefix("unknownprefixfoo2", "http://example.com/2/ex/42/"); return true; }
		, "Check CURIE":
			{ topic: function(){ return "unknownprefixfoo2:answer".resolve(); }
			, "Equals <http://example.com/2/ex/42/answer>": function(t){ assert.strictEqual(t.valueOf(), "http://example.com/2/ex/42/answer"); }
			, "<http://example.com/2/ex/42/answer>.equals": function(t){ assert.isTrue("http://example.com/2/ex/42/answer".equals(t)); }
			}
		}
	}
, "string.resolve() resolved URI":
	{ topic: "http://slashdot.org/".resolve()
	, "strictEqual": function(t){ assert.strictEqual(t, 'http://slashdot.org/'); }
	, "equals": function(t){ assert.equal(t, 'http://slashdot.org/'); }
	}
, "string.resolve() bnode syntax":
	{ topic: "_:someBlankNode".resolve()
	, "strictEqual": function(t){ assert.strictEqual(t, '_:someBlankNode'); }
	, "equals": function(t){ assert.equal(t, '_:someBlankNode'); }
	}
, "string.n3() <http://slashdot.org/>":
	{ topic: "http://slashdot.org/".n3()
	, "equals": function(t){ assert.strictEqual(t, '<http://slashdot.org/>'); }
	}
, 'string.l().n3() "PLAINLITERAL"':
	{ topic: "PLAINLITERAL".l().n3()
	, "equals": function(t){ assert.strictEqual(t, '"PLAINLITERAL"'); }
	}
, 'string.l().n3() "PLAIN LITERAL"':
	{ topic: "PLAIN LITERAL WITH A SPACE".l().n3()
	, "equals": function(t){ assert.strictEqual(t, '"PLAIN LITERAL WITH A SPACE"'); }
	}
, 'string.l(en).n3() "English language literal"@en':
	{ topic: "English language literal".l("en").n3()
	, "equals": function(t){ assert.strictEqual(t, '"English language literal"@en'); }
	}
, 'string.tl(xsd:string).n3() "XSD String"^^<http://www.w3.org/2001/XMLSchema#string>':
	{ topic: "XSD String".tl("xsd:string".resolve()).n3()
	, "equals": function(t){ assert.strictEqual(t, '"XSD String"^^<http://www.w3.org/2001/XMLSchema#string>'); }
	}
}).export(module);
