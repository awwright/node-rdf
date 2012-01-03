var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
require('rdf/SetBuiltins');

function generateRefTest(topic, n3out){
	var n3rep = this.title;
	var context =
		{ topic: topic.ref("_:topic")
		, "Has .n3()": function(t){ assert.isFunction(t.n3); }
		, "Has .toNT()": function(t){ assert.isFunction(t.toNT); }
		, ".n3()":
			{ topic: function(t){ return t.n3(); }
			}
		};
	context[".n3()"][n3out] = function(t){ assert.strictEqual(t, n3out); };
	return context;
}

vows.describe('Object builtins').addBatch(
{ '{a: "rdfs:Class"}': generateRefTest({a: "rdfs:Class"}, "_:topic rdf:type rdfs:Class .")
, '{a: 42}': generateRefTest({a: 42}, "_:topic rdf:type 42 .")
}).export(module);
