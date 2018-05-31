
var assert = require('assert');
var rdf = require('..');

/*
[NoInterfaceObject]
interface Profile {
    readonly attribute PrefixMap prefixes;
    readonly attribute TermMap   terms;
    DOMString resolve (DOMString toresolve);
    void      setDefaultVocabulary (DOMString iri);
    void      setDefaultPrefix (DOMString iri);
    void      setTerm (DOMString term, DOMString iri);
    void      setPrefix (DOMString prefix, DOMString iri);
    Profile   importProfile (Profile profile, optional boolean override);
};
*/

describe('Profile', function(){
	it("prefixes", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.prefixes, 'object');
	});
	it("terms", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.terms, 'object');
	});
	it('builtin prefixes', function(){
		var env = new rdf.RDFEnvironment;
		assert.strictEqual(env.resolve("rdf:type"), "http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
		assert.strictEqual(env.resolve("rdfs:Class"), "http://www.w3.org/2000/01/rdf-schema#Class");
		assert.strictEqual(env.resolve("unknownprefix2:foo"), null);
	});
	it('define prefix', function(){
		var env = new rdf.RDFEnvironment;
		assert.strictEqual(env.resolve("unkfoo:foo"), null);
		env.setPrefix("unkfoo", "http://example.com/1/ex/42/");
		assert.strictEqual(env.resolve("unkfoo:foo"), "http://example.com/1/ex/42/foo");
	});
	it('define default prefix', function(){
		var env = new rdf.RDFEnvironment;
		assert.strictEqual(env.resolve(":bar"), null);
		env.setDefaultPrefix("http://example.com/2/ex/42/");
		assert.strictEqual(env.resolve(":answer"), "http://example.com/2/ex/42/answer");
	});
	it("resolve", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.resolve, 'function');
	});
	it("setDefaultVocabulary", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setDefaultVocabulary, 'function');
	});
	it("setDefaultPrefix", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setDefaultPrefix, 'function');
	});
	it("setTerm", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setTerm, 'function');
	});
	it("setPrefix", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setPrefix, 'function');
	});
	it("importProfile", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.importProfile, 'function');
	});
});
