var assert = require('assert');
var fs = require('fs');
var rdf = require('..');
var env = rdf.environment;
var TurtleParser = rdf.TurtleParser;

var m$ = rdf.ns('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#');

var manifestBase = 'http://www.w3.org/2013/TurtleTests/manifest.ttl';
//var manifestBase = 'file://'+__dirname+'/TurtleTests/manifest.ttl';
var manifestData = require('fs').readFileSync('test/TurtleTests/manifest.ttl');
var manifestGraph = env.createGraph();
var manifestParse = new TurtleParser;
manifestParse.parse(manifestData, undefined, manifestBase, null, manifestGraph);

var manifest = manifestGraph.match(manifestBase, m$('entries'));
var manifestTests = manifestGraph.getCollection(manifest[0].object);


describe('Turtle test suite', function(){
	it('Parse Turtle test suite manifest', function(){
		assert.ok(manifestTests.length);
	});
	describe('test', function(){

		manifestTests.forEach(function(test){
			var types = manifestGraph.match(test, rdf.rdfns('type')).map(function(v){return v.object});
			var fileURI = manifestGraph.match(test, m$('action')).map(function(v){return v.object.toString();})[0];
			var filename = fileURI.replace('http://www.w3.org/2013/', 'test/');

			for(var j=0; j<types.length; j++){
				switch(types[j].toString()){
					case 'http://www.w3.org/ns/rdftest#TestTurtleEval':
						it('evaluation <'+filename+'>', function(done){
							// First parse the expected data (in N-Triples format)
							var resultURI = manifestGraph.match(test, m$('result')).map(function(v){return v.object.toString()})[0];
							var resultFile = resultURI.replace('http://www.w3.org/2013/', 'test/');
							fs.readFile(resultFile, 'utf8', function(err, data){
								if(err) throw err;
								var expectedGraph = env.createGraph();
								var expectedParser = new TurtleParser;
								expectedParser.parse(data, undefined, resultURI, null, expectedGraph);
								// Now parse the Turtle file
								fs.readFile(filename, 'utf8', function(err, data){
									if(err) throw err;
									var graph = env.createGraph();
									var parser = new TurtleParser;
									parser.parse(data, undefined, fileURI, null, graph);
									// Have the data, compare
									var expectedTriples = expectedGraph.toArray().sort();
									var outputTriples = graph.toArray().sort();

									if(!expectedGraph.equals(graph)){
										assert.equal(outputTriples.join('\n'), expectedTriples.join('\n'));
										assert.ok(expectedGraph.equals(graph));
									}
									done();
								});
							});
						});
						break;
					case 'http://www.w3.org/ns/rdftest#TestTurtleNegativeEval':
						break;
					case 'http://www.w3.org/ns/rdftest#TestTurtlePositiveSyntax':
						it('positive test <'+filename+'>', function(done){
							fs.readFile(filename, 'utf8', function(err, data){
								if(err) throw err;
								var graph = env.createGraph();
								var parser = new TurtleParser;
								parser.parse(data, undefined, fileURI, null, graph);
								done();
							});
						});
						break;
					case 'http://www.w3.org/ns/rdftest#TestTurtleNegativeSyntax':
						it('negative test <'+filename+'>', function(done){
							fs.readFile(filename, 'utf8', function(err, data){
								if(err) throw err;
								var graph = env.createGraph();
								var parser = new TurtleParser;
								assert.throws(function(){
									parser.parse(data, undefined, file, null, graph);
								});
								done();
							});
						});
						break;
					default:
						break;
				}
			}
		});
	});
});
