// This expects the RDF Semantics test suite to be extracted,
// with the manifest file at ./rdf-mt-tests/manifest.ttl
// Run `make test` to download this

var assert = require('assert');
var fs = require('fs');
var rdf = require('..');
var TurtleParser = rdf.TurtleParser;

var m$ = rdf.ns('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#');
var PositiveEntailmentTest = m$('PositiveEntailmentTest');
var NegativeEntailmentTest = m$('NegativeEntailmentTest');

var manifestBase = 'http://www.w3.org/2013/rdf-mt-tests/manifest.ttl';
//var manifestBase = 'file://'+__dirname+'/rdf-mt-tests/manifest.ttl';
var manifestData = require('fs').readFileSync('test/rdf-mt-tests/manifest.ttl');
var manifestParse = TurtleParser.parse(manifestData, manifestBase);
var manifestGraph = manifestParse.graph;

var manifest = manifestGraph.match(manifestBase, m$('entries'), null).toArray();
var manifestTests = manifestGraph.getCollection(manifest[0].object);

describe('RDF Semantics test suite', function(){
	it('Parse Turtle test suite manifest', function(){
		assert.ok(manifestTests.length);
	});
	describe('test', function(){
		manifestTests.forEach(function(test){
			// Each test is one of the above kinds of tests. All tests have 
			// - a name (mf:name),
			var testName = manifestGraph.reference(test).rel(m$('name')).one().toString();
			// - an input RDF graph URL (mf:action),
			var testInputURI = manifestGraph.reference(test).rel(m$('action')).one().toString();
			var testInputFile = testInputURI.replace('http://www.w3.org/2013/', 'test/');
			// - an output RDF graph URL or the special marker false (mf:result),
			var testOutputURI = manifestGraph.reference(test).rel(m$('result')).one().toString();
			var testOutputFile = testOutputURI.replace('http://www.w3.org/2013/', 'test/');
			// - an entailment regime, which is "simple", "RDF", or "RDFS" (mf:entailmentRegime),
			var entailmentRegime = manifestGraph.reference(test).rel(m$('entailmentRegime')).one().toString();
			// - a list of recognized datatypes (mf:recognizedDatatypes),
			// - a list of unrecognized datatypes (mf:unrecognizedDatatypes).
			if(entailmentRegime!=='simple') return;
			var types = manifestGraph.reference(test).rel(rdf.rdfns('type')).toArray();
			for(var j=0; j<types.length; j++){
				switch(types[j].toString()){
					case PositiveEntailmentTest:
						it('positive test ' + testName + ' ' + entailmentRegime, function(done){
							fs.readFile(testInputFile, 'utf8', function(err, testInputData){
								if(err) throw err;
								var inputParse = TurtleParser.parse(testInputData, testInputFile);
								fs.readFile(testOutputFile, 'utf8', function(err, testOutputData){
									if(err) throw err;
									var outputParse = TurtleParser.parse(testOutputData, testInputFile);
									assert(inputParse.graph.length);
									assert(outputParse.graph.length);
									assert(inputParse.graph.simplyEntails(outputParse.graph));
									done();
								});
							});
						});
						break;
					case NegativeEntailmentTest:
						it('negative test ' + testName + ' ' + entailmentRegime, function(done){
							fs.readFile(testInputFile, 'utf8', function(err, testInputData){
								if(err) throw err;
								var inputParse = TurtleParser.parse(testInputData, testInputFile);
								fs.readFile(testOutputFile, 'utf8', function(err, testOutputData){
									if(err) throw err;
									var outputParse = TurtleParser.parse(testOutputData, testInputFile);
									assert(inputParse.graph.length);
									assert(outputParse.graph.length);
									assert.equal(inputParse.graph.simplyEntails(outputParse.graph), null);
									done();
								});
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
