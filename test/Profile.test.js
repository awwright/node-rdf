
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
		profile.setPrefix('ex', 'http://example.com/');
		assert.equal(typeof profile.resolve, 'function');
		assert.equal(typeof profile.resolve('ex:type'), 'string');
		assert.equal(profile.resolve('undefinedTerm'), null);
	});
	it("setDefaultVocabulary", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setDefaultVocabulary, 'function');
		assert.equal(typeof profile.setDefaultVocabulary('http://example.com/q/'), 'undefined');
		assert.equal(profile.resolve('Friend'), 'http://example.com/q/Friend');
		assert.equal(profile.terms.resolve('Friend'), 'http://example.com/q/Friend');
	});
	it("setDefaultPrefix", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setDefaultPrefix, 'function');
		assert.equal(typeof profile.setDefaultPrefix('http://example.org/vocab/'), 'undefined');
		assert.equal(profile.resolve(':Friend'), 'http://example.org/vocab/Friend');
		assert.equal(profile.prefixes.resolve(':Friend'), 'http://example.org/vocab/Friend');
	});
	it("setTerm", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setTerm, 'function');
		assert.equal(typeof profile.setTerm('a', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), 'undefined');
		assert.equal(profile.resolve('a'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
		assert.equal(profile.terms.resolve('a'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
	});
	it("setPrefix", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setPrefix, 'function');
		assert.equal(typeof profile.setPrefix('ex', 'http://example.com/'), 'undefined');
		assert.equal(profile.prefixes.resolve('ex:type'), 'http://example.com/type');
		assert.equal(profile.resolve('ex:type'), 'http://example.com/type');
	});
	it("setPrefix negative tests", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.setPrefix, 'function');
		assert.throws(function(){
			profile.setPrefix('0', 'http://example.com/');
		});
		assert.throws(function(){
			profile.setPrefix('::', 'http://example.com/');
		});
		assert.throws(function(){
			profile.setPrefix(' ', 'http://example.com/');
		});
		assert.throws(function(){
			profile.setPrefix('.', 'http://example.com/');
		});
	});
	it("importProfile", function(){
		var profile = new rdf.Profile;
		assert.equal(typeof profile.importProfile, 'function');
		profile.setPrefix('ex', 'http://example.com/');
		profile.setTerm('a', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

		var other = new rdf.Profile;
		other.setPrefix('ex', 'http://example.org/vocab/');
		other.setTerm('a', 'http://example.org/type');
		other.setPrefix('fx', 'http://example.org/vocab/');
		other.setTerm('b', 'http://example.org/type');

		profile.importProfile(other);
		assert.equal(profile.resolve('ex:a'), 'http://example.com/a');
		assert.equal(profile.resolve('a'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
		assert.equal(profile.resolve('fx:a'), 'http://example.org/vocab/a');
		assert.equal(profile.resolve('b'), 'http://example.org/type');
		assert.strictEqual(profile.resolve('term'), null);
		assert.strictEqual(profile.resolve('c:foo'), null);
	});
	it("importProfile (overwrite=false)", function(){
		var profile = new rdf.Profile;
		profile.setPrefix('ex', 'http://example.com/');
		profile.setTerm('a', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

		var other = new rdf.Profile;
		other.setPrefix('ex', 'http://example.org/vocab/');
		other.setTerm('a', 'http://example.org/type');
		other.setPrefix('fx', 'http://example.org/vocab/');
		other.setTerm('b', 'http://example.org/type');

		profile.importProfile(other, false);
		assert.equal(profile.resolve('ex:a'), 'http://example.com/a');
		assert.equal(profile.resolve('a'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
		assert.equal(profile.resolve('fx:a'), 'http://example.org/vocab/a');
		assert.equal(profile.resolve('b'), 'http://example.org/type');
		assert.strictEqual(profile.resolve('term'), null);
		assert.strictEqual(profile.resolve('c:foo'), null);
	});
	it("importProfile (overwrite=true)", function(){
		var profile = new rdf.Profile;
		profile.setPrefix('ex', 'http://example.com/');
		profile.setTerm('a', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

		var other = new rdf.Profile;
		other.setPrefix('ex', 'http://example.org/vocab/');
		other.setTerm('a', 'http://example.org/type');
		other.setPrefix('fx', 'http://example.org/vocab/');
		other.setTerm('b', 'http://example.org/type');

		profile.importProfile(other, true);
		assert.equal(profile.resolve('ex:a'), 'http://example.org/vocab/a');
		assert.equal(profile.resolve('a'), 'http://example.org/type');
		assert.equal(profile.resolve('fx:a'), 'http://example.org/vocab/a');
		assert.equal(profile.resolve('b'), 'http://example.org/type');
		assert.strictEqual(profile.resolve('term'), null);
		assert.strictEqual(profile.resolve('c:foo'), null);
	});
	it("shrink", function(){
		var profile = new rdf.Profile;
		profile.setTerm('a', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
		profile.setPrefix('ex2', 'http://example.com/vocab/foo/');
		profile.setPrefix('ex', 'http://example.com/');
		profile.setPrefix('exv', 'http://example.com/vocab/');
		profile.setPrefix('🐉', 'http://example.com/vocab/dragon/');

		assert.equal(profile.shrink('http://example.com/vocab/a'), 'exv:a');
		assert.equal(profile.shrink('http://example.com/vocab/foo/b'), 'ex2:b');
		assert.equal(profile.shrink('http://example.com/c'), 'ex:c');
		// File is UTF-8 (probably), but escape sequence UTF-16 surrogate pairs
		// idk I didn't invent it, man
		assert.equal(profile.shrink('http://example.com/vocab/dragon/🐲'), '\uD83D\uDC09:\uD83D\uDC32');
		assert.equal(profile.shrink('http://example.com/vocab/dragon/🐲🐧'), '\uD83D\uDC09:\uD83D\uDC32\uD83D\uDC27');
		assert.equal(profile.shrink('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), 'a');
	});
	it("remove", function(){
		var profile = new rdf.Profile;
		profile.setTerm('term', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
		profile.setPrefix('prefix', 'http://example.com/vocab/foo/');
		profile.terms.remove('term');
		profile.prefixes.remove('prefix');
		assert.strictEqual(profile.resolve('term'), null);
		assert.strictEqual(profile.resolve('prefix:foo'), null);
	});
});
