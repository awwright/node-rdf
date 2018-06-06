var assert = require('assert');
var rdf = require('..');

function rdfns(v){ return "http://www.w3.org/1999/02/22-rdf-syntax-ns#".concat(v); }
function rdfsns(v){ return "http://www.w3.org/2000/01/rdf-schema#".concat(v); }

function triple(s, p, o){
	return rdf.environment.createTriple(
		typeof s=='string' ? rdf.environment.createNamedNode(s) : s ,
		typeof p=='string' ? rdf.environment.createNamedNode(p) : p ,
		typeof o=='string' ? rdf.environment.createNamedNode(o) : o
	);
}

describe('ResultSet', function(){
	describe('interface', function(){
		var g = new rdf.Graph;
		var t = new rdf.ResultSet(g);
		it('toArray exists', function(){ assert.equal(typeof t.toArray, 'function'); });
		it('rel exists', function(){ assert.equal(typeof t.rel, 'function'); });
		it('rev exists', function(){ assert.equal(typeof t.rev, 'function'); });
		it('some exists', function(){ assert.equal(typeof t.some, 'function'); });
		it('every exists', function(){ assert.equal(typeof t.every, 'function'); });
		it('filter exists', function(){ assert.equal(typeof t.filter, 'function'); });
		it('forEach exists', function(){ assert.equal(typeof t.forEach, 'function'); });
		it('map exists', function(){ assert.equal(typeof t.map, 'function'); });
		it('reduce exists', function(){ assert.equal(typeof t.reduce, 'function'); });
		it('one exists', function(){ assert.equal(typeof t.one, 'function'); });
	});
	describe('Data', function(){
		it('Graph#reference', function(){
			var g = new rdf.Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Vowel', 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Vowel'));
			g.add(triple('http://example.com/A', 'http://example.com/nextLetter', 'http://example.com/B'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			var node = g.reference(new rdf.NamedNode('http://example.com/A'));
			assert(node instanceof rdf.ResultSet);
			assert.equal(node.toArray().length, 1);
		});
		it('rel', function(){
			var g = new rdf.Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Vowel', 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Vowel'));
			g.add(triple('http://example.com/A', 'http://example.com/nextLetter', 'http://example.com/B'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			var node = g.reference(new rdf.NamedNode('http://example.com/A'));
			assert.equal(node.one().toString(), 'http://example.com/A');
			var node2 = node.rel(new rdf.NamedNode('http://example.com/nextLetter'));
			assert.equal(node2.one(), 'http://example.com/B');
		});
		it('rev (1)', function(){
			var g = new rdf.Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Vowel', 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Vowel'));
			g.add(triple('http://example.com/A', 'http://example.com/nextLetter', 'http://example.com/B'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			var node = g.reference(new rdf.NamedNode('http://example.com/B'));
			assert.equal(node.one().toString(), 'http://example.com/B');
			var node2 = node.rev(new rdf.NamedNode('http://example.com/nextLetter'));
			assert.equal(node2.one(), 'http://example.com/A');
		});
		it('rev (2)', function(){
			var g = new rdf.Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Vowel', 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Vowel'));
			g.add(triple('http://example.com/A', 'http://example.com/nextLetter', 'http://example.com/B'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			var node = g.reference(new rdf.NamedNode('http://example.com/Letter'));
			var node2 = node.rev(new rdf.NamedNode(rdfns('type')));
			assert.equal(node2.length, 3);
		});
		it('no multiple nodes', function(){
			var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
			var g = new rdf.Graph();
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~b')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~c')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~d')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Alice')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Bob')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Carol')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Dan')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('age')), new rdf.Literal('26', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('age')), new rdf.Literal('36', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('age')), new rdf.Literal('46', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('age')), new rdf.Literal('56', rdf.xsdns('integer'))));
			var knows0 = g.reference(new rdf.NamedNode('http://example.com/~a'));
			var knows1 = knows0.rel(new rdf.NamedNode(foaf('knows')));
			var knows2 = knows1.rel(new rdf.NamedNode(foaf('knows')));
			assert.equal(knows2.length, 1);
			var knows0 = g.reference(new rdf.NamedNode('http://example.com/~a'));
			var knows1 = knows0.rev(new rdf.NamedNode(foaf('knows')));
			var knows2 = knows1.rev(new rdf.NamedNode(foaf('knows')));
			assert.equal(knows2.length, 1);
		});
	});
});
