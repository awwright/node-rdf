var assert = require('assert');
var fs = require('fs');
var rdf = require('..');
var env = rdf.environment;
var TurtleParser = rdf.TurtleParser;

var manifestBase = 'http://www.w3.org/2013/TurtleTests/manifest.ttl';
var manifestData = require('fs').readFileSync('test/TurtleTests/manifest.ttl');
var manifestGraph = env.createGraph();
var manifestParse = new TurtleParser;
manifestParse.parse(manifestData, undefined, manifestBase, null, manifestGraph);

var manifest = manifestGraph.match(manifestBase, 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#entries');
var manifestTests = manifestGraph.getCollection(manifest[0].object);


describe('Turtle test suite', function(){
	it('Parse Turtle test suite manifest', function(){
		assert.ok(manifestTests.length);
	});
	describe('test', function(){

		manifestTests.forEach(function(test){
			var types = manifestGraph.match(test, rdf.rdfns('type')).map(function(v){return v.object});

			var file = manifestGraph.match(test, 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#action').map(function(v){return v.object})[0];
			var filename = file.toString().replace('http://www.w3.org/2013/','test/');

			for(var j=0; j<types.length; j++){
				switch(types[j].toString()){
					case 'http://www.w3.org/ns/rdftest#TestTurtleEval':
						break;
					case 'http://www.w3.org/ns/rdftest#TestTurtleNegativeEval':
						break;
					case 'http://www.w3.org/ns/rdftest#TestTurtlePositiveSyntax':
						it('positive test <'+filename+'>', function(done){
							fs.readFile(filename, 'utf8', function(err, data){
								if(err) throw err;
								var graph = env.createGraph();
								var parser = new TurtleParser;
								parser.parse(data, undefined, file, null, graph);
								done();
							});
						});
						break;
					case 'http://www.w3.org/ns/rdftest#TestTurtleNegativeSyntax':
						break; // Ignore negative tests for now
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
