// This expects the RDF Semantics test suite to be extracted,
// with the manifest file at ./TurtleTests/manifest.ttl
// Run `make test` to download this

var assert = require('assert');
var fs = require('fs');
var rdf = require('..');
var TurtleParser = rdf.TurtleParser;

var m$ = rdf.ns('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#');

var manifestBase = 'http://www.w3.org/2013/TurtleTests/manifest.ttl';
//var manifestBase = 'file://'+__dirname+'/TurtleTests/manifest.ttl';
var manifestData = require('fs').readFileSync('test/TurtleTests/manifest.ttl');
var manifestParse = TurtleParser.parse(manifestData, manifestBase);
var manifestGraph = manifestParse.graph;

var manifest = manifestGraph.match(manifestBase, m$('entries'), null).toArray();
var manifestTests = manifestGraph.getCollection(manifest[0].object);

describe('TurtleParser', function(){
	it('TurtleParser.parse', function(){
		var parse = rdf.TurtleParser.parse('<> a <Page> .', 'http://example.com/');
		assert.equal(parse.graph.toArray().join("\n"), '<http://example.com/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.com/Page> .');
	});
});

describe('Turtle test suite', function(){
	it('Parse Turtle test suite manifest', function(){
		assert.ok(manifestTests.length);
	});
	describe('test', function(){

		manifestTests.forEach(function(test){
			var types = manifestGraph.reference(test).rel(rdf.rdfns('type')).toArray();
			var fileURI = manifestGraph.reference(test).rel(m$('action')).one().toString();
			var filename = fileURI.replace('http://www.w3.org/2013/', 'test/');

			for(var j=0; j<types.length; j++){
				switch(types[j].toString()){
					case 'http://www.w3.org/ns/rdftest#TestTurtleEval':
						it('evaluation <'+filename+'>', function(done){
							// First parse the expected data (in N-Triples format)
							var resultURI = manifestGraph.reference(test).rel(m$('result')).one().toString();
							var resultFile = resultURI.replace('http://www.w3.org/2013/', 'test/');
							fs.readFile(resultFile, 'utf8', function(err, data){
								if(err) throw err;
								var expectedParser = TurtleParser.parse(data, resultURI);
								var expectedGraph = expectedParser.graph;
								// Now parse the Turtle file
								fs.readFile(filename, 'utf8', function(err, data){
									if(err) throw err;
									var parser = TurtleParser.parse(data, fileURI);
									var graph = parser.graph;
									// Have the data, compare
									var expectedTriples = expectedGraph.toArray().sort();
									var outputTriples = graph.toArray().sort();

									if(!expectedGraph.isomorphic(graph)){
										assert.equal(outputTriples.join('\n'), expectedTriples.join('\n'));
										assert.ok(expectedGraph.isomorphic(graph));
									}
									done();
								});
							});
						});
						break;
					case 'http://www.w3.org/ns/rdftest#TestTurtlePositiveSyntax':
						it('positive test <'+filename+'>', function(done){
							fs.readFile(filename, 'utf8', function(err, data){
								if(err) throw err;
								var parser = TurtleParser.parse(data, fileURI);
								assert(parser.graph);
								done();
							});
						});
						break;
					case 'http://www.w3.org/ns/rdftest#TestTurtleNegativeSyntax':
					case 'http://www.w3.org/ns/rdftest#TestTurtleNegativeEval':
						it('negative test <'+filename+'>', function(done){
							fs.readFile(filename, 'utf8', function(err, data){
								if(err) throw err;
								assert.throws(function(){
									TurtleParser.parse(data, file);
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
