var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
var env=rdf.environment;
var util=require('util');
rdf.setBuiltins();

var batches = {};
var id=0;
function generateRefTest(subject, topic, n3out, ntout, triplesout){
	var n3rep = this.title;
	var context = batches['object'+(++id)+'.ref('+util.inspect(subject)+')'] =
		{ topic: topic.ref(subject)
		, "Has .n3()": function(t){ assert.isFunction(t.n3); }
		, "Has .toNT()": function(t){ assert.isFunction(t.toNT); }
		, "Has .graphify()": function(t){ assert.isFunction(t.graphify); }
		, "Has .using()": function(t){ assert.isFunction(t.toNT); }
		, ".n3()":
			{ topic: function(t){ return t.n3(); }
			}
		, ".toNT()":
			{ topic: function(t){ return t.toNT(); }
			}
		};
	context[".n3()"]["Output"] = function(t){ assert.strictEqual(t, n3out); };
	context[".toNT()"]["Output"] = function(t){ assert.strictEqual(t, ntout); };
	var graphTest = context[".graphify()"] = { topic: function(t){ return t.graphify(); } };
	graphTest["length==="+triplesout.length] = function(graph){ assert.strictEqual(graph.length, triplesout.length); }
	for(var i=0; i<triplesout.length; i++){
		var triple = triplesout[i];
		graphTest["Exists: "+triple.toString()] = (function(triple){ return function(graph){
			assert.isTrue(graph.some(function(v){ return triple.equals(v); }));
		} })(triple);
	}
	return context;
}

generateRefTest('_:topic1', {a: 'rdfs:Class'},
	'_:topic1\n\trdf:type rdfs:Class .',
	'_:topic1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
	[ env.createTriple('_:topic1', "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", 'http://www.w3.org/2000/01/rdf-schema#Class')
	]);

generateRefTest('_:topic2', {rdf$value: 42},
	'_:topic2\n\trdf:value 42 .',
	'_:topic2 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> 42 .',
	[ env.createTriple('_:topic2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral('42',null,'http://www.w3.org/2001/XMLSchema#integer'))
	]);

generateRefTest('_:topic3', {rdf$value: "A string.".l()},
	'_:topic3\n\trdf:value "A string." .',
	'_:topic3 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "A string." .',
	[ env.createTriple('_:topic3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("A string.",null,null))
	]);

generateRefTest('_:topic4', {rdf$value: env.createLiteral("A string 2000",null,null)},
	'_:topic4\n\trdf:value "A string 2000" .',
	'_:topic4 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "A string 2000" .',
	[ env.createTriple('_:topic4', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("A string 2000"))
	]);

generateRefTest('_:topic5', {rdf$value: "2".l()},
	'_:topic5\n\trdf:value "2" .',
	'_:topic5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "2" .',
	[ env.createTriple('_:topic5', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("2"))
	]);

generateRefTest('_:topic6', {rdf$value: env.createBlankNode()},
	'_:topic6\n\trdf:value _:b1 .',
	'_:topic6 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> _:b1 .',
	[ env.createTriple('_:topic6', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', '_:b1')
	]);

/*

	dbp:dateOfBirth "1879-03-14"^^xsd:date ;
	foaf:depiction <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .
*/
generateRefTest( 'dbr:Albert_Einstein',
	{ dbp$dateOfBirth: new Date("1879-03-14")
	, 'foaf:depiction': 'http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg'
	},
	'dbr:Albert_Einstein dbp:dateOfBirth "1879-03-14"^^xsd:date;\n\tfoaf:depiction <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .',
	'dbr:Albert_Einstein dbp:dateOfBirth "1879-03-14"^^xsd:date;\n\tfoaf:depiction <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .',
	[ env.createTriple("http://dbpedia.org/resource/Albert_Einstein", "http://xmlns.com/foaf/0.1/depiction", 'http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg')
	, env.createTriple("http://dbpedia.org/resource/Albert_Einstein", "http://dbpedia.org/property/dateOfBirth", env.createLiteral("1879-03-14",null,'http://www.w3.org/2001/XMLSchema#date'))
	]);

vows.describe('Object builtins').addBatch(batches).export(module);
