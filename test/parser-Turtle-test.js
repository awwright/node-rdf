var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
var env=rdf.environment;
var TurtleParser = require('rdf/TurtleParser').Turtle;

var batches = {};
var id=0;
function addDocument(base, turtle, triples){
	if(turtle instanceof Array) turtle=turtle.join("\n");
	var batch = batches['#'+(++id)+': '+turtle.replace(/\n/g,"\\n ").replace(/\t/g," ")] = { topic: function(){
		// The tests expect bnodes to be numbered starting with 1
		rdf.BlankNode.NextId = 0;
		var graph = new rdf.IndexedGraph;
		var turtleParser = new TurtleParser;
		turtleParser.parse(turtle, null, base, null, graph);
		//console.log("\nTurtle:\n\t"+turtle.replace(/\n/g,'\n\t')+"\nTriples:\n\t"+require('util').inspect(graph.index, false, 5, true).replace(/\n/g,'\n\t')+"\n");
		return graph;
	} };
	batch["length==="+triples.length] = function(graph){ assert.strictEqual(graph.length, triples.length); }
	for(var i=0; i<triples.length; i++){
		var triple = triples[i];
		batch["Exists: "+triple.toString()] = (function(triple){ return function(graph){
			assert.isTrue(graph.some(function(v){ return triple.equals(v); }));
		} })(triple);
	}
	return batch;
}

var manifestBase = 'http://www.w3.org/2013/TurtleTests/manifest.ttl';
var manifestData = require('fs').readFileSync('test/TurtleTests/manifest.ttl');
var manifestGraph = new rdf.TripletGraph;
var manifestParse = new TurtleParser;
manifestParse.parse(manifestData, undefined, manifestBase, null, manifestGraph);

var manifest = manifestGraph.match(manifestBase, 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#entries');
var manifestTests = manifestGraph.getCollection(manifest[0].object);
manifestTests.forEach(function(test){
	var batch = batches['TurtleTests <'+test+'>'] = {};
	var types = manifestGraph.match(test, rdf.rdfns('type')).map(function(v){return v.object});

	var file = manifestGraph.match(test, 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#action').map(function(v){return v.object})[0];
	var filename = file.replace('http://www.w3.org/2013/','test/');

	for(var j=0; j<types.length; j++){
		switch(types[j]){
			case 'http://www.w3.org/ns/rdftest#TestTurtleEval':
				break;
			case 'http://www.w3.org/ns/rdftest#TestTurtleNegativeEval':
				break;
			case 'http://www.w3.org/ns/rdftest#TestTurtlePositiveSyntax':
				batch['load <'+filename+'>'] =
					{ topic: function(){ require('fs').readFile(filename, 'utf8', this.callback); }
					, 'parses':
						function(a, data){
							var graph = new rdf.TripletGraph;
							var parser = new TurtleParser;
							parser.parse(data, undefined, file, null, graph);
						}
					};
				break;
			case 'http://www.w3.org/ns/rdftest#TestTurtleNegativeSyntax':
				batch['load <'+filename+'>'] =
					{ topic: function(){ require('fs').readFile(filename, 'utf8', this.callback); }
					, 'parses negative':
						function(a, data){
							var graph = new rdf.TripletGraph;
							var parser = new TurtleParser;
							var err = null;
							assert['throws'](function(){
								parser.parse(data, undefined, file, null, graph);
							});
						}
					};
				break;
			default: break;
		}
	}
});

vows.describe('Turtle parsing').addBatch(batches).export(module);
