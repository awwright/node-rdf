var assert = require('assert');
var rdf = require('..');
var util = require('util');

function addNumberTest(t, nodeType, datatype, n3rep){
	it('('+util.inspect(t)+')', function(){
		assert.strictEqual(typeof t.n3, 'function');
		assert.strictEqual(typeof t.toNT, 'function');
		assert.strictEqual(typeof t.nodeType, 'function');
		assert.strictEqual(t.nodeType(), nodeType);
		assert.strictEqual(t.n3(), n3rep);
		assert.strictEqual(t.datatype, datatype);
	});
}

describe('Number builtins', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});

	addNumberTest(Number.POSITIVE_INFINITY, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"INF"^^<http://www.w3.org/2001/XMLSchema#double>');
	addNumberTest(Number.NEGATIVE_INFINITY, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"-INF"^^<http://www.w3.org/2001/XMLSchema#double>');
	addNumberTest(Number.NaN, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#double", '"NaN"^^<http://www.w3.org/2001/XMLSchema#double>');
	addNumberTest(8.5432, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#decimal", '8.5432');
	addNumberTest(42, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '42');
	addNumberTest(-42, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '-42');
	addNumberTest(0, "TypedLiteral", "http://www.w3.org/2001/XMLSchema#integer", '0');
});
