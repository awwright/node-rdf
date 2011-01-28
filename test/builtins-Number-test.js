var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

vows.describe('Number builtins').addBatch(
{ "Number.POSITIVE_INFINITY":
	{ topic: Number.POSITIVE_INFINITY
	, "Has .n3()": function(t){ assert.isFunction(t.n3); }
	, "Has .toNT()": function(t){ assert.isFunction(t.n3); }
	, ".n3()":
		{ topic: function(t){ return t.n3(); }
		, '"INF"^^<http://www.w3.org/2001/XMLSchema#double>': function(t){ assert.strictEqual(this.title); }
		}
	, ".nodeType()==TypedLiteral": function(t){assert.strictEqual(t.nodeType(), "TypedLiteral");}
	, ".type==<http://www.w3.org/2001/XMLSchema#double>": function(t){assert.strictEqual(t.type, "http://www.w3.org/2001/XMLSchema#double");}
	}
, "Number.NEGATIVE_INFINITY":
	{ topic: Number.NEGATIVE_INFINITY
	, "Has .n3()": function(t){ assert.isFunction(t.n3); }
	, "Has .toNT()": function(t){ assert.isFunction(t.n3); }
	, ".n3()":
		{ topic: function(t){ return t.n3(); }
		, '"-INF"^^<http://www.w3.org/2001/XMLSchema#double>': function(t){ assert.strictEqual(this.title); }
		}
	, ".nodeType()==TypedLiteral": function(t){assert.strictEqual(t.nodeType(), "TypedLiteral");}
	, ".type==<http://www.w3.org/2001/XMLSchema#double>": function(t){assert.strictEqual(t.type, "http://www.w3.org/2001/XMLSchema#double");}
	}
, "Number.NaN":
	{ topic: Number.NaN
	, "Has .n3()": function(t){ assert.isFunction(t.n3); }
	, "Has .toNT()": function(t){ assert.isFunction(t.n3); }
	, ".n3()":
		{ topic: function(t){ return t.n3(); }
		, '"NaN"^^<http://www.w3.org/2001/XMLSchema#double>': function(t){ assert.strictEqual(this.title); }
		}
	, ".nodeType()==TypedLiteral": function(t){assert.strictEqual(t.nodeType(), "TypedLiteral");}
	, ".type==<http://www.w3.org/2001/XMLSchema#double>": function(t){assert.strictEqual(t.type, "http://www.w3.org/2001/XMLSchema#double");}
	}
}).export(module);
