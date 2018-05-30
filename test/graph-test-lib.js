var assert = require('assert');
var rdf = require('..');

function rdfns(v){ return "http://www.w3.org/1999/02/22-rdf-syntax-ns#".concat(v); }

function triple(s, p, o){
	return rdf.environment.createTriple(
		typeof s=='string' ? rdf.environment.createNamedNode(s) : s ,
		typeof p=='string' ? rdf.environment.createNamedNode(p) : p ,
		typeof o=='string' ? rdf.environment.createNamedNode(o) : o
	);
}

module.exports = function GenerateGraphTest(Graph){
	var batches = {};
	describe(Graph.name+' methods exist', function(){
		var t = new Graph;
		it('add exists', function(){ assert.equal(typeof t.add, 'function'); });
		it('remove exists', function(){ assert.equal(typeof t.remove, 'function'); });
		it('removeMatches exists', function(){ assert.equal(typeof t.removeMatches, 'function'); });
		it('toArray exists', function(){ assert.equal(typeof t.toArray, 'function'); });
		it('some exists', function(){ assert.equal(typeof t.some, 'function'); });
		it('every exists', function(){ assert.equal(typeof t.every, 'function'); });
		it('filter exists', function(){ assert.equal(typeof t.filter, 'function'); });
		it('forEach exists', function(){ assert.equal(typeof t.forEach, 'function'); });
		it('match exists', function(){ assert.equal(typeof t.match, 'function'); });
		it('merge exists', function(){ assert.equal(typeof t.merge, 'function'); });
		it('addAll exists', function(){ assert.equal(typeof t.addAll, 'function'); });
		//it('actions exists', function(){ assert.ok(Array.isArray(t.actions)); });
		//it('addAction exists', function(){ assert.equal(typeof t.addAction, 'function'); });
	});
	describe(Graph.name+' data', function(){
		it('insert', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Vowel', 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Vowel'));
			g.add(triple('http://example.com/A', 'http://example.com/nextLetter', 'http://example.com/B'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.match(null, null, null).length, 7);
			assert.equal(g.toArray().length, 7);
			assert.equal(g.match(null, rdfns('type'), null).length, 5);
			assert.equal(g.match(null, rdfns('type'), 'http://example.com/Letter').length, 3);
			assert.equal(g.match('http://example.com/A', null, null).length, 3);
			assert.equal(g.match('http://example.com/A', rdfns('type'), null).length, 2);
			assert.equal(g.match('http://example.com/A', rdfns('type'), 'http://example.com/Letter').length, 1);
			var gg = new Graph;
			gg.addAll(g);
			assert.equal(gg.length, g.length);
		});
		it('multiple insert', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.match(null, null, null).length, 2);
			assert.equal(g.toArray().length, 2);
			assert.equal(g.match(null, rdfns('type'), null).length, 2);
			assert.equal(g.match(null, rdfns('type'), 'http://example.com/Letter').length, 1);
			assert.equal(g.match('http://example.com/A', null, null).length, 1);
			assert.equal(g.match('http://example.com/A', rdfns('type'), null).length, 1);
			assert.equal(g.match('http://example.com/A', rdfns('type'), 'http://example.com/Letter').length, 1);
			var gg = new Graph;
			gg.addAll(g);
			assert.equal(gg.length, g.length);
		});
	});
}
