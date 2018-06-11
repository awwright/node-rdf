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
		it('literals are figurative blackholes (rel)', function(){
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
			// Find everyone who knows a string literal (i.e. the query makes no sense, will produce zero results)
			var knows0 = g.reference(new rdf.NamedNode('http://example.com/~a'));
			var knows1 = knows0.rel(new rdf.NamedNode(foaf('givenname')));
			var knows2 = knows1.rel(new rdf.NamedNode(foaf('knows')));
			assert.equal(knows2.length, 0);
		});
		it('backtracking from a literal', function(){
			var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
			var g = new rdf.Graph();
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~b')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~c')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~d')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Alice')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Alice'))); // Yes this is duplicated
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Carol')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Dan')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('age')), new rdf.Literal('26', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('age')), new rdf.Literal('36', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('age')), new rdf.Literal('46', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('age')), new rdf.Literal('56', rdf.xsdns('integer'))));
			// Find everyone with the same name as ~a
			var knows0 = g.reference(new rdf.NamedNode('http://example.com/~a'));
			var knows1 = knows0.rel(new rdf.NamedNode(foaf('givenname')));
			var knows2 = knows1.rev(new rdf.NamedNode(foaf('givenname')));
			assert.equal(knows2.length, 2);
		});
		it('some (does alice know someone at least n years old)', function(){
			var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
			var g = new rdf.Graph();
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~b')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~c')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~d')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('knows')), new rdf.NamedNode('http://example.com/~a')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Alice')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Alice')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Carol')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Dan')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('age')), new rdf.Literal('26', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('age')), new rdf.Literal('36', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('age')), new rdf.Literal('46', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('age')), new rdf.Literal('56', rdf.xsdns('integer'))));
			var result1 = g.reference(new rdf.NamedNode('http://example.com/~a'))
				.rel(new rdf.NamedNode(foaf('knows')))
				.rel(new rdf.NamedNode(foaf('age')))
				.some(function(item){ return item.valueOf() >= 30; });
			assert.equal(result1, true);
			var result2 = g.reference(new rdf.NamedNode('http://example.com/~a'))
				.rel(new rdf.NamedNode(foaf('knows')))
				.rel(new rdf.NamedNode(foaf('age')))
				.some(function(item){ return item.valueOf() >= 80; });
			assert.equal(result2, false);
		});
		it('every (is everyone alice knows at least n years old)', function(){
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
			var result1 = g.reference(new rdf.NamedNode('http://example.com/~a'))
				.rel(new rdf.NamedNode(foaf('knows')))
				.rel(new rdf.NamedNode(foaf('age')))
				.every(function(item){ return item.valueOf() >= 40; });
			assert.equal(result1, false);
			var result2 = g.reference(new rdf.NamedNode('http://example.com/~a'))
				.rel(new rdf.NamedNode(foaf('knows')))
				.rel(new rdf.NamedNode(foaf('age')))
				.every(function(item){ return item.valueOf() >= 20; });
			assert.equal(result2, true);
		});
		it('filter (get names of everyone over 40)', function(){
			var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
			var g = new rdf.Graph();
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Alice')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Bob')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Carol')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Dan')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('age')), new rdf.Literal('26', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('age')), new rdf.Literal('36', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('age')), new rdf.Literal('46', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('age')), new rdf.Literal('56', rdf.xsdns('integer'))));
			var result1 = g.reference(foaf('Person'))
				.rev(new rdf.NamedNode(rdf.rdfns('type')))
				.rel(new rdf.NamedNode(foaf('age')))
				.filter(function(item){ return item.valueOf() >= 40; })
				.rev(new rdf.NamedNode(foaf('age')))
				.rel(new rdf.NamedNode(foaf('givenname')))
				.toArray().join(', ');
			assert.equal(result1, 'Carol, Dan');
		});
		it('forEach (iterate over each person)', function(){
			var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
			var i = 0;
			var g = new rdf.Graph();
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Alice')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Bob')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Carol')));
			var result1 = g.reference(foaf('Person'))
				.rev(new rdf.NamedNode(rdf.rdfns('type')))
				.rel(new rdf.NamedNode(foaf('givenname')))
				.forEach(function(v){ i += 1; });
			// Three of the four here have given names
			assert.equal(i, 3);
		});
		it('map (weird age voodoo)', function(){
			var foaf = rdf.ns('http://xmlns.com/foaf/0.1/');
			var g = new rdf.Graph();
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(rdf.rdfns('type')), new rdf.NamedNode(foaf('Person'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Alice')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Bob')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Carol')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('givenname')), new rdf.Literal('Dan')));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~a'), new rdf.NamedNode(foaf('age')), new rdf.Literal('26', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~b'), new rdf.NamedNode(foaf('age')), new rdf.Literal('36', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~c'), new rdf.NamedNode(foaf('age')), new rdf.Literal('46', rdf.xsdns('integer'))));
			g.add(new rdf.Triple(new rdf.NamedNode('http://example.com/~d'), new rdf.NamedNode(foaf('age')), new rdf.Literal('56', rdf.xsdns('integer'))));
			// Find all the people whose age is equal to someone's given name length, times 10, plus 6
			// If you can think of something that makes more sense by all means suggest it
			var result1 = g.reference(foaf('Person'))
				.rev(new rdf.NamedNode(rdf.rdfns('type')))
				.rel(new rdf.NamedNode(foaf('givenname')))
				.map(function(node){ return new rdf.Literal((node.valueOf().length * 10 + 6).toString(), rdf.xsdns('integer')); })
				.rev(new rdf.NamedNode(foaf('age')))
				.rel(new rdf.NamedNode(foaf('givenname')));
			assert.equal(result1.length, 2);
		});
		it('reduce (sum ages of people who alice knows)', function(){
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
			// Find everyone with the same name as ~a
			var sum = g.reference(new rdf.NamedNode('http://example.com/~a'))
				.rel(new rdf.NamedNode(foaf('knows')))
				.rel(new rdf.NamedNode(foaf('age')))
				.reduce(function(item, partial){ return item.valueOf() + partial; }, 0);
			assert.equal(sum, 138);
		});
	});
});
