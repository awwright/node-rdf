var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

vows.describe('rdf.context').addBatch(
{ "context.resolveCurie rdf:type":
	{ topic: rdf.context.resolveCurie("rdf:type")
	, "Equals <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>": function(t){ assert.strictEqual(t.value, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"); }
	, "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>.equals": function(t){ assert.isTrue("http://www.w3.org/1999/02/22-rdf-syntax-ns#type".equals(t)); }
	}
, "context.resolveCurie rdfs:Class":
	{ topic: rdf.context.resolveCurie("rdfs:Class")
	, "Equals <http://www.w3.org/2000/01/rdf-schema#Class>": function(t){ assert.strictEqual(t.value, "http://www.w3.org/2000/01/rdf-schema#Class"); }
	, "<http://www.w3.org/2000/01/rdf-schema#Class>.equals": function(t){ assert.isTrue("http://www.w3.org/2000/01/rdf-schema#Class".equals(t)); }
	}
, "context.resolveCurie unknown CURIE":
	{ topic: rdf.context.resolveCurie("unknownprefixfoo1:bar")
	, "Equals Null": function(t){ assert.isNull(t); }
	, "Add CURIE mapping":
		{ topic: function(){ rdf.context.setMapping("unknownprefixfoo1", "http://example.com/1/ex/42/"); return rdf.context; }
		, "Check CURIE":
			{ topic: function(context){ return context.resolveCurie("unknownprefixfoo1:answer"); }
			, "Equals <http://example.com/1/ex/42/answer>": function(t){ assert.strictEqual(t.value, "http://example.com/1/ex/42/answer"); }
			, "<http://example.com/1/ex/42/answer>.equals": function(t){ assert.isTrue("http://example.com/1/ex/42/answer".equals(t)); }
			}
		}
	}
}).export(module);
