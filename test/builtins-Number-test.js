var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
var util=require('util');
rdf.setBuiltins();

var batches = {};

function addNumberTest(topic, nodeType, datatype, n3rep){
	var context = batches['('+util.inspect(topic)+')'] = { topic: topic };
	context["Has .n3()"] = function(t){ assert.isFunction(t.n3); }
	context["Has .toNT()"] = function(t){ assert.isFunction(t.toNT); }
	context["Has .nodeType()"] = function(t){ assert.isFunction(t.nodeType); }
	context[".nodeType()=="+nodeType] = function(t){assert.strictEqual(t.nodeType(), nodeType);}
	context[".n3()=="+n3rep] = function(t){assert.strictEqual(t.n3(), n3rep);}
	//context[".n3()"] = { topic: function(t){ return t.n3(); } }
	//context[".n3()"][n3rep] = function(t){ assert.strictEqual(t, n3rep); };
	context[".nodeType()=="+nodeType] = function(t){assert.strictEqual(t.nodeType(), nodeType);}
	context[".datatype==<"+datatype+">"] = function(t){assert.strictEqual(t.datatype, datatype);}
	return context;
}

vows.describe('Number builtins').addBatch(batches).export(module);

addNumberTest(Number.POSITIVE_INFINITY, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"INF"^^<http://www.w3.org/2001/XMLSchema#double>');
addNumberTest(Number.NEGATIVE_INFINITY, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"-INF"^^<http://www.w3.org/2001/XMLSchema#double>');
addNumberTest(Number.NaN, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"NaN"^^<http://www.w3.org/2001/XMLSchema#double>');
addNumberTest(8.5432, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#decimal", '8.5432');
addNumberTest(42, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '42');
addNumberTest(-42, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '-42');
addNumberTest(0, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '0');
