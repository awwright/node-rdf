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

function GenerateGraphTest(Graph){
	describe('methods exist', function(){
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
		it('add', function(){
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
		it('add (multiples)', function(){
			// "Graphs MUST NOT contain duplicate triples."
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
		});
		it('addAll', function(){
			// "the import must not produce any duplicates."
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			var gg = new Graph;
			assert.equal(gg.length, 0);
			gg.addAll(g);
			gg.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(gg.length, g.length);
			assert.equal(gg.match(null, null, null).length, 2);
			assert.equal(gg.toArray().length, 2);
			assert.equal(gg.match(null, rdfns('type'), null).length, 2);
			assert.equal(gg.match(null, rdfns('type'), 'http://example.com/Letter').length, 1);
			assert.equal(gg.match('http://example.com/A', null, null).length, 1);
			assert.equal(gg.match('http://example.com/A', rdfns('type'), null).length, 1);
			assert.equal(gg.match('http://example.com/A', rdfns('type'), 'http://example.com/Letter').length, 1);
		});
		it('has', function(){
			var g = new Graph;
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			assert(g.has(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter')));
			assert(!g.has(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter')));
		});
		it('every', function(){
			// "Universal quantification method, tests whether every Triple in the Graph passes the test implemented by the provided TripleFilter."
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.ok(g.every(function(triple){
				return triple.predicate.equals(new rdf.NamedNode(rdfns('type')));
			}));
			assert.ok(!g.every(function(triple){
				return triple.subject.equals(new rdf.NamedNode('http://example.com/Letter'));
			}));
		});
		it('filter', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.filter(function(triple){
				return triple.predicate.equals(new rdf.NamedNode(rdfns('type')));
			}).length, 4);
			assert.equal(g.filter(function(triple){
				return triple.subject.equals(new rdf.NamedNode('http://example.com/Letter'));
			}).length, 1);
			assert.ok(g.filter(function(triple){ return true; }) instanceof rdf.Graph);
		});
		it('forEach', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('Letter', '@en')));
			g.add(triple('http://example.com/A', rdfsns('label'), new rdf.Literal('A')));
			g.add(triple('http://example.com/B', rdfsns('label'), new rdf.Literal('B')));
			g.add(triple('http://example.com/C', rdfsns('label'), new rdf.Literal('C')));
			var len = 0;
			g.forEach(function(triple){
				len += triple.object.valueOf().length;
			});
			assert.equal(len, 9);
		});
		it('match', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('Letter', '@en')));
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			var len = 0;
			var matches = g.match(null, rdf.environment.createNamedNode(rdfns('type')), rdf.environment.createNamedNode('http://example.com/Letter'));
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches instanceof rdf.Graph);
		});
		it('match(iri, iri, iri)', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			var t = graph.match(
				env.createNamedNode('http://example.com/foo'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
			assert.ok(t); // returns empty Graph
			assert.equal(t.length, 0);
		});
		it('match(bnode, iri, bnode)', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			var t = graph.match(
				env.createNamedNode('http://example.com/foo'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
			);
			assert.ok(t); // returns empty Graph
			assert.equal(t.length, 0);
		});
		it('match(iri, iri, literal)', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			var t = graph.match(
				env.createNamedNode('http://example.com/foo'),
				env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
				env.createLiteral('string!'),
			);
			assert.ok(t); // returns empty Graph
			assert.equal(t.length, 0);
		});
		it('match: literal subject throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			assert.throws(function(){
				graph.match(
					env.createLiteral('string!'),
					env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
					env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
				);
			});
		});
		it('match: bnode predicate throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			assert.throws(function(){
				graph.match(
					env.createNamedNode('http://example.com/foo'),
					env.createBlankNode(),
					env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
				);
			});
		});
		it('match: literal predicate throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			assert.throws(function(){
				graph.match(
					env.createNamedNode('http://example.com/foo'),
					env.createLiteral('string!'),
					env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
				);
			});
		});
		it('match: variable subject throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			assert.throws(function(){
				graph.match(
					new rdf.Variable('s'),
					env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
					env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
				);
			});
		});
		it('match: variable predicate throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			assert.throws(function(){
				graph.match(
					env.createNamedNode('http://example.com/foo'),
					new rdf.Variable('p'),
					env.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
				);
			});
		});
		it('match: variable object throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Graph;
			assert.throws(function(){
				graph.match(
					env.createNamedNode('http://example.com/foo'),
					env.createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
					new rdf.Variable('o'),
				);
			});
		});
		it('match (NamedNode)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createNamedNode('http://www.w3.org/2000/01/rdf-schema#Class'));
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class')));
		});
		it('match (Literal)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createLiteral('http://www.w3.org/2000/01/rdf-schema#Class'));
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class'))));
		});
		it('match (LanguageLiteral)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createLiteral('http://www.w3.org/2000/01/rdf-schema#Class', '@en'));
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en'))));
		});
		it('match (xsd:string)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createLiteral('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string'));
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(triple('http://example.com/Letter', rdfsns('label'), rdf.environment.createLiteral('http://www.w3.org/2000/01/rdf-schema#Class'))));
		});
		it('match (xsd:anyURI)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
			g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createLiteral('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI'));
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI'))));
		});
		// TODO add test for `merge` which, despite the description in RDF Interfaces, should produce a different but isomorphic graph.
		it('union', function(){
			var g = new Graph;
			var h = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			h.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			h.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			h.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			var m = g.union(h);
			assert.equal(g.length, 1);
			assert.equal(h.length, 3);
			assert.equal(m.length, 4);
		});
		it('remove', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.length, 4);
			assert.equal(g.toArray().length, 4);
			g.remove(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.length, 3);
			assert.equal(g.toArray().length, 3);
			g.remove(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.length, 3);
			assert.equal(g.toArray().length, 3);
		});
		it('removeMatches (exact)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.length, 4);
			assert.equal(g.toArray().length, 4);
			g.removeMatches(new rdf.NamedNode('http://example.com/C'), new rdf.NamedNode(rdfns('type')), new rdf.NamedNode('http://example.com/Letter'));
			assert.equal(g.length, 3);
			assert.equal(g.toArray().length, 3);
			g.removeMatches(new rdf.NamedNode('http://example.com/C'), new rdf.NamedNode(rdfns('type')), new rdf.NamedNode('http://example.com/Letter'));
			assert.equal(g.length, 3);
			assert.equal(g.toArray().length, 3);
		});
		it('removeMatches (subject)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.length, 4);
			g.removeMatches(
				new rdf.NamedNode('http://example.com/C'),
				null,
				null,
			);
			assert.equal(g.length, 3);
		});
		it('removeMatches (predicate)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.length, 4);
			g.removeMatches(
				null,
				new rdf.NamedNode(rdfns('type')),
				null,
			);
			assert.equal(g.length, 0);
		});
		it('removeMatches (object)', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.equal(g.length, 4);
			g.removeMatches(
				null,
				null,
				new rdf.NamedNode('http://example.com/Letter'),
			);
			assert.equal(g.length, 1);
		});
		it('some', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			assert.ok(g.every(function(triple){
				return triple.predicate.equals(new rdf.NamedNode(rdfns('type')));
			}));
			assert.ok(!g.every(function(triple){
				return triple.subject.equals(new rdf.NamedNode('http://example.com/Letter'));
			}));
		});
		it('toArray', function(){
			var g = new Graph;
			g.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(triple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(triple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			var a = g.toArray();
			assert(Array.isArray(a));
			assert.equal(a.length, 4);
		});
		it('isomorphic', function(){
			function gen(idx){
				var gg = new Graph;
				for(var ba = []; ba.length<5; ba.push(new rdf.BlankNode));
				gg.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
				gg.add(triple(ba[0], rdfns('type'), 'http://example.com/Letter'));
				gg.add(triple(ba[0], rdfns('type'), ba[1]));
				gg.add(triple(ba[0], rdfns('type'), ba[2]));
				gg.add(triple(ba[idx], rdfns('type'), ba[3]));
				gg.add(triple(ba[1], rdfns('type'), ba[4]));
				return gg;
			}
			// Graph a
			var ga = gen(1);
			var gh = gen(1);
			assert(ga.isomorphic(gh));
			var gm = gen(2);
			assert(!gm.isomorphic(ga));
		});
		it('equals (no bnodes positive)', function(){
			function gen(sub){
				var gg = new Graph;
				for(var ba = []; ba.length<5; ba.push(new rdf.BlankNode));
				gg.add(triple(sub, rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
				gg.add(triple('http://example.com/A', rdfsns('label'), rdf.Literal.language('Label', 'en')));
				return gg;
			}
			// Graph a
			var ga = gen('http://example.com/A');
			var gb = gen('http://example.com/A');
			assert(ga.equals(gb));
		});
		it('equals (no bnodes negative)', function(){
			function gen(sub){
				var gg = new Graph;
				for(var ba = []; ba.length<5; ba.push(new rdf.BlankNode));
				gg.add(triple(sub, rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
				gg.add(triple('http://example.com/A', rdfsns('label'), rdf.Literal.language('Label', 'en')));
				return gg;
			}
			// Graph a
			var ga = gen('http://example.com/A');
			var gb = gen('http://example.com/B');
			assert(!ga.isomorphic(gb));
		});
		it('equals (various data positive)', function(){
			function gen(){
				var g = new Graph;
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
				return g;
			}
			// Graph a
			var ga = gen();
			var gb = gen();
			assert(ga.isomorphic(gb));
		});
		it('equals (various data negative)', function(){
			function gen(l){
				var g = new Graph;
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', l)));
				return g;
			}
			// Graph a
			var ga = gen('@fr');
			var gb = gen('@ja');
			assert(!ga.isomorphic(gb));
		});
	});
	describe('Graph#simplyEntails', function(){
		// Test that a graph G simply entails a graph E
		it('the empty graph is simply entailed by any graph', function(){
			var empty = new Graph;
			var anyGraph = new Graph;
			anyGraph.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			assert(anyGraph.simplyEntails(empty));
		});
		it('the empty graph does not simply entail any graph except itself', function(){
			var empty = new Graph;
			var anyGraph = new Graph;
			anyGraph.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			assert(!empty.simplyEntails(anyGraph));
			assert(empty.simplyEntails(new Graph));
		});
		it('a graph simply entails all its subgraphs', function(){
			var G = new Graph;
			G.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('Letter')));
			G.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			var E = new Graph;
			G.add(triple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			assert(G.simplyEntails(E));
		});
		it('a graph is simply entailed by any of its instances (1)', function(){
			var graph = new Graph;
			var b1 = new rdf.BlankNode;
			graph.add(triple('http://example.com/Letter', rdfsns('label'), b1));
			assert(graph.length, 1);
			var instance = new Graph;
			var b2 = new rdf.BlankNode;
			instance.add(triple('http://example.com/Letter', rdfsns('label'), b2));
			assert(instance.length, 1);
			var map = graph.simplyEntails(instance);
			assert(map);
			assert(b1.equals(map[b2]));
		});
		it('a graph is simply entailed by any of its instances (2)', function(){
			var graph = new Graph;
			var b1 = new rdf.Literal('string');
			graph.add(triple('http://example.com/Letter', rdfsns('label'), b1));
			assert(graph.length, 1);
			var instance = new Graph;
			var b2 = new rdf.BlankNode;
			instance.add(triple('http://example.com/Letter', rdfsns('label'), b2));
			assert(instance.length, 1);
			var map = graph.simplyEntails(instance);
			assert(map);
			assert(b1.equals(map[b2]));
		});
		it('If E is a lean graph and E1 is a proper instance of E, then E does not simply entail E1', function(){
			var E = new Graph;
			var bx = new rdf.BlankNode;
			E.add(triple('http://example.com/a', 'http://example.com/P', bx));
			E.add(triple(bx, 'http://example.com/P', bx));
			var E1 = new Graph;
			E1.add(triple('http://example.com/a', 'http://example.com/P', 'http://example.com/w'));
			E1.add(triple('http://example.com/w', 'http://example.com/P', 'http://example.com/w'));
			assert(!E.simplyEntails(E1));
		});
		it('simplyEntails (various data positive)', function(){
			function gen(){
				var g = new Graph;
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
				return g;
			}
			// Graph a
			var ga = gen();
			var gb = gen();
			assert(ga.simplyEntails(gb));
		});
		it('simplyEntails (subset positive)', function(){
			var ga = new Graph;
			ga.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			ga.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
			ga.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
			ga.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));

			var gb = new Graph;
			gb.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
			assert(ga.simplyEntails(gb));
		});
		it('simplyEntails (bnode positive)', function(){
			function gen(node){
				var g = new Graph;
				g.add(triple(node, rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
				g.add(triple(node, rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
				g.add(triple(node, rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
				g.add(triple(node, rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
				return g;
			}
			// Graph a
			var ga = gen('http://example.com/Letter');
			var gb = gen(new rdf.BlankNode);
			assert(ga.simplyEntails(gb));
		});
		it('simplyEntails (various data negative)', function(){
			function gen(l){
				var g = new Graph;
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', '@en')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#string')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', 'http://www.w3.org/2001/XMLSchema#anyURI')));
				g.add(triple('http://example.com/Letter', rdfsns('label'), new rdf.Literal('http://www.w3.org/2000/01/rdf-schema#Class', l)));
				return g;
			}
			// Graph a
			var ga = gen('@fr');
			var gb = gen('@ja');
			assert(!ga.simplyEntails(gb));
		});
	});
}

describe('Graph', function(){
	GenerateGraphTest(rdf.Graph);
});
