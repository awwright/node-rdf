var assert = require('assert');
var rdf = require('..');

describe('rdf.environment', function(){
	it("instance", function(){
		var t = rdf.environment;
		assert(t instanceof rdf.RDFEnvironment);
	});
	it("environment.prefixes.resolve rdf:type", function(){
		var t = rdf.environment.prefixes.resolve("rdf:type");
		assert.strictEqual(t, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
	});
	it("environment.prefixes.resolve rdfs:Class", function(){
		var t = rdf.environment.prefixes.resolve("rdfs:Class");
		assert.strictEqual(t, "http://www.w3.org/2000/01/rdf-schema#Class");
	});
	it("environment.prefixes.resolve unknown CURIE", function(){
		var t = rdf.environment.prefixes.resolve("unkfoo:bar");
		assert.equal(t, null);
	});
	it("environment.prefixes.resolve default prefix", function(){
		var t = rdf.environment.prefixes.resolve(":bar");
		assert.equal(t, null);
	});
});
