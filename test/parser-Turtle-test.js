var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
var env=rdf.environment;




var batches = {};
var id=0;
function addDocument(turtle, triples){
	if(turtle instanceof Array) turtle=turtle.join("\n");
	var batch = batches['#'+(++id)+': '+turtle.replace(/\n/g,"\\n ")] = { topic: function(){
		var graph = new rdf.IndexedGraph;
		var turtleParser = new (require('rdf/TurtleParser').Turtle)(env, undefined, undefined, graph);
		turtleParser.parse(turtle, undefined, undefined, graph);
		console.log("\n"+turtle+"\n"+require('util').inspect(graph.index, false, 5, true)+"\n\n\n");
		return graph;
	} };
	batch["length==="+triples.length] = function(graph){ assert.strictEqual(graph.length, triples.length); }
	for(var i=0; i<triples.length; i++){
		var triple = triples[i];
		batch["Exists: "+triple.toString()] = function(graph){
			assert.isTrue(graph.some(function(v){ return triple.equals(v); }));
		}
	}
}

addDocument('<http://example.com/report> a <http://example.com/Document>.',
	[ env.createTriple("http://example.com/report", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://example.com/Document")
	]);
addDocument('<http://example.com/report> rdf:type <http://example.com/Document>.',
	[ env.createTriple("http://example.com/report", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://example.com/Document")
	]);
addDocument('<http://example.com/report> rdf:value "22".',
	[ env.createTriple("http://example.com/report", "http://www.w3.org/1999/02/22-rdf-syntax-ns#value", env.createLiteral("22"))
	]);
addDocument(
	[ '# this is a complete turtle document'
	, '@prefix foo: <http://example.org/ns#> .'
	, '@prefix : <http://other.example.org/ns#> .'
	, 'foo:bar foo: : .'
	, ':bar : foo:bar .'
	],
	[ env.createTriple("http://example.org/ns#bar", "http://example.org/ns#", 'http://other.example.org/ns#')
	, env.createTriple("http://other.example.org/ns#bar", "http://other.example.org/ns#", 'http://example.org/ns#bar')
	, env.createTriple("http://other.example.org/ns#bar", "http://other.example.org/ns3#", 'http://example.org/ns#bar')
	]);

vows.describe('Turtle parsing').addBatch(batches).export(module);
