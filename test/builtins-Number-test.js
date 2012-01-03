var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

function generateNumberTest(topic, nodeType, type, n3rep){
	var context =
		{ topic: topic
		, "Has .n3()": function(t){ assert.isFunction(t.n3); }
		, "Has .toNT()": function(t){ assert.isFunction(t.n3); }
		, ".n3()":
			{ topic: function(t){ return t.n3(); }
			}
		};
	context[".n3()"][n3rep] = function(t){ assert.strictEqual(t, n3rep); };
	context[".nodeType()=="+nodeType] = function(t){assert.strictEqual(t.nodeType(), nodeType);}
	context[".type==<"+type+">"] = function(t){assert.strictEqual(t.type, type);}
	return context;
}

vows.describe('Number builtins').addBatch(
{ "Number.POSITIVE_INFINITY": generateNumberTest(Number.POSITIVE_INFINITY, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"INF"^^<http://www.w3.org/2001/XMLSchema#double>')
, "Number.NEGATIVE_INFINITY": generateNumberTest(Number.NEGATIVE_INFINITY, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"-INF"^^<http://www.w3.org/2001/XMLSchema#double>')
, "Number.NaN": generateNumberTest(Number.NaN, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"NaN"^^<http://www.w3.org/2001/XMLSchema#double>')
, "(8.5432)": generateNumberTest(8.5432, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#decimal", '8.5432')
, "(42)": generateNumberTest(42, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '42')
, "(-42)": generateNumberTest(-42, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '-42')
, "(0)": generateNumberTest(0, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '0')
}).export(module);
