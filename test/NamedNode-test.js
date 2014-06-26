var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');

vows.describe('rdf.IRI').addBatch( // The builtin RDFEnvironment
{ "(new rdf.IRI(<http://example.com/>))":
	{ topic: new rdf.NamedNode('http://example.com/')
	, " instanceof RDFNode": function(t){ assert.instanceOf(t, rdf.NamedNode); }
	, ".nodeType() === 'IRI'": function(t){ assert.strictEqual(t.nodeType(), 'IRI'); }
	, ".toNT()": function(t){ assert.strictEqual(t.toNT(), '<http://example.com/>'); }
	, ".n3()": function(t){ assert.strictEqual(t.n3(), '<http://example.com/>'); }
	}
}).export(module);
