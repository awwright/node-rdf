var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

vows.describe('rdf.environment.resolve').addBatch(
{ "environment.prefixes.resolve rdf:type":
	{ topic: rdf.environment.prefixes.resolve("rdf:type")
	, "Equals <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>": function(t){ assert.strictEqual(t, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"); }
	}
, "environment.prefixes.resolve rdfs:Class":
	{ topic: rdf.environment.prefixes.resolve("rdfs:Class")
	, "Equals <http://www.w3.org/2000/01/rdf-schema#Class>": function(t){ assert.strictEqual(t, "http://www.w3.org/2000/01/rdf-schema#Class"); }
	}
, "environment.prefixes.resolve unknown CURIE":
	{ topic: rdf.environment.prefixes.resolve("unkfoo:bar")
	, "Equals Null": function(t){ assert.isNull(t); }
	, "Add CURIE mapping":
		{ topic: function(){ rdf.environment.setPrefix("unkfoo", "http://example.com/1/ex/42/"); return rdf.environment; }
		, "Lookup prefix": function(t){ assert.strictEqual(t.prefixes.unkfoo, "http://example.com/1/ex/42/"); }
		, "Check CURIE":
			{ topic: function(environment){ return environment.prefixes.resolve("unkfoo:answer"); }
			, "Equals <http://example.com/1/ex/42/answer>": function(t){ assert.strictEqual(t, "http://example.com/1/ex/42/answer"); }
			}
		}
	}
, "environment.prefixes.resolve default prefix":
	{ topic: rdf.environment.prefixes.resolve(":bar")
	, "Equals null": function(t){ assert.isNull(t); }
	, "addDefaultPrefix":
		{ topic: function(){ rdf.environment.setDefaultPrefix("http://example.com/2/ex/42/"); return rdf.environment; }
		, "Lookup prefix": function(t){ assert.strictEqual(t.prefixes[''], "http://example.com/2/ex/42/"); }
		, "Check CURIE":
			{ topic: function(environment){ return environment.prefixes.resolve(":answer"); }
			, "Equals <http://example.com/2/ex/42/answer>": function(t){ assert.strictEqual(t, "http://example.com/2/ex/42/answer"); }
			}
		}
	}
}).export(module);
