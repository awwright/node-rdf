var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

vows.describe('rdf.IRI').addBatch( // The builtin RDFEnvironment
{ "(new rdf.IRI(<http://example.com/>))":
	{ topic: new rdf.IRI('http://example.com/')
	, ".nodeType() === 'IRI'": function(t){ assert.strictEqual(t.scheme(), 'http'); }
	, ".toNT()": function(t){ assert.strictEqual(t.toNT(), '<http://example.com/>'); }
	, ".n3()": function(t){ assert.strictEqual(t.n3(), '<http://example.com/>'); }
	, ".defrag() is self": function(t){ assert.strictEqual(t.defrag().value, 'http://example.com/'); }
	, ".isAbsolute() is true": function(t){ assert.strictEqual(t.isAbsolute(), true); }
	, ".toAbsolute() is self": function(t){ assert.strictEqual(t.toAbsolute().value, 'http://example.com/'); }
	, ".authority() === 'example.com'": function(t){ assert.strictEqual(t.authority(), 'example.com'); }
	, ".fragment() is null": function(t){ assert.isNull(t.fragment()); }
	, ".heirpart() === '//example.com/'": function(t){ assert.strictEqual(t.heirpart(), '//example.com/'); }
	, ".host() === 'example.com'": function(t){ assert.strictEqual(t.host(), 'example.com'); }
	, ".path() === '/'": function(t){ assert.strictEqual(t.path(), '/'); }
	, ".port() is null": function(t){ assert.isNull(t.port()); }
	, ".query() is null": function(t){ assert.isNull(t.query()); }
	, ".resolveReference(absoluteURI)": function(t){ assert.strictEqual(t.resolveReference('http://xyz.example.org/123').value, 'http://xyz.example.org/123'); }
	, ".resolveReference(relativeURI0)": function(t){ assert.strictEqual(t.resolveReference('/a/b/c').value, 'http://example.com/a/b/c'); }
	, ".resolveReference(relativeURI1)": function(t){ assert.strictEqual(t.resolveReference('//example.org/1?x').value, 'http://example.org/1?x'); }
	, ".scheme() === 'http'": function(t){ assert.strictEqual(t.scheme(), 'http'); }
	, ".userinfo() is null": function(t){ assert.isNull(t.userinfo()); }
	}
, "(new rdf.IRI(<https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2#455>))":
	{ topic: new rdf.IRI('https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2#455')
	, ".nodeType() === 'IRI'": function(t){ assert.strictEqual(t.nodeType(), 'IRI'); }
	, ".toNT()": function(t){ assert.strictEqual(t.toNT(), '<https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2#455>'); }
	, ".n3()": function(t){ assert.strictEqual(t.n3(), '<https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2#455>'); }
	, ".defrag() strips fragment": function(t){ assert.strictEqual(t.defrag().value, 'https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2'); }
	, ".isAbsolute() is false": function(t){ assert.strictEqual(t.isAbsolute(), false); }
	, ".toAbsolute() strips fragment": function(t){ assert.strictEqual(t.toAbsolute().value, 'https://user:pass@a.example.com:8080/b/c/d/?123&aa=1&aa=2'); }
	, ".authority() === 'user:pass@a.example.com:8080'": function(t){ assert.strictEqual(t.authority(), 'user:pass@a.example.com:8080'); }
	, ".fragment()": function(t){ assert.strictEqual(t.fragment(), '#455'); }
	, ".heirpart()": function(t){ assert.strictEqual(t.heirpart(), '//user:pass@a.example.com:8080/b/c/d/'); }
	, ".host() === 'a.example.com'": function(t){ assert.strictEqual(t.host(), 'a.example.com'); }
	, ".path() === '/b/c/d/?123&aa=1&aa=2'": function(t){ assert.strictEqual(t.path(), '/b/c/d/'); }
	, ".port() is '8080'": function(t){ assert.strictEqual(t.port(), '8080'); }
	, ".query()": function(t){ assert.strictEqual(t.query(), '?123&aa=1&aa=2'); }
	, ".resolveReference(absoluteURI)": function(t){ assert.strictEqual(t.resolveReference('http://xyz.example.org/123').value, 'http://xyz.example.org/123'); }
	, ".resolveReference(relativeURI0)": function(t){ assert.strictEqual(t.resolveReference('/a/b/c').value, 'https://user:pass@a.example.com:8080/a/b/c'); }
	, ".resolveReference(relativeURI1)": function(t){ assert.strictEqual(t.resolveReference('//example.org/1?x').value, 'https://example.org/1?x'); }
	, ".resolveReference(relativeURI2)": function(t){ assert.strictEqual(t.resolveReference('b/c.js').value, 'https://user:pass@a.example.com:8080/b/c/d/b/c.js'); }
	, ".scheme() === 'https'": function(t){ assert.strictEqual(t.scheme(), 'https'); }
	, ".userinfo()": function(t){ assert.strictEqual(t.userinfo(), 'user:pass'); }
	}
}).export(module);
