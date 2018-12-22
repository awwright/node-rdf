var assert = require('assert');
var rdf = require('..');

const rdfns = rdf.rdfns;
const rdfsns = rdf.rdfsns;
const xsdns = rdf.xsdns
const ex = rdf.ns('http://example.com/');

function quad(s, p, o, g){
	return new rdf.Quad(
		typeof s=='string' ? rdf.environment.createNamedNode(s) : s ,
		typeof p=='string' ? rdf.environment.createNamedNode(p) : p ,
		typeof o=='string' ? rdf.environment.createNamedNode(o) : o ,
		typeof g=='string' ? rdf.environment.createNamedNode(g) : g
	);
}

var Dataset = rdf.Dataset;

describe('Dataset', function GenerateDatasetTest(){
	describe(Dataset.name+' methods exist', function(){
		var t = new Dataset;
		it('add exists', function(){ assert.equal(typeof t.add, 'function'); });
		it('remove exists', function(){ assert.equal(typeof t.remove, 'function'); });
		it('removeMatches exists', function(){ assert.equal(typeof t.removeMatches, 'function'); });
		it('toArray exists', function(){ assert.equal(typeof t.toArray, 'function'); });
		it('some exists', function(){ assert.equal(typeof t.some, 'function'); });
		it('every exists', function(){ assert.equal(typeof t.every, 'function'); });
		it('filter exists', function(){ assert.equal(typeof t.filter, 'function'); });
		it('forEach exists', function(){ assert.equal(typeof t.forEach, 'function'); });
		it('match exists', function(){ assert.equal(typeof t.match, 'function'); });
		it('union exists', function(){ assert.equal(typeof t.union, 'function'); });
		it('addAll exists', function(){ assert.equal(typeof t.addAll, 'function'); });
		//it('actions exists', function(){ assert.ok(Array.isArray(t.actions)); });
		//it('addAction exists', function(){ assert.equal(typeof t.addAction, 'function'); });
	});
	describe(Dataset.name+' data', function(){
		it('add', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('Vowel'), rdfsns('subClassOf'), ex('Letter'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Vowel'), ex('graph')));
			g.add(quad(ex('A'), ex('nextLetter'), ex('B'), ex('graph')));
			g.add(quad(ex('B'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('C'), rdfns('type'), ex('Letter'), ex('graph')));
			assert.equal(g.match(null, null, null, null).length, 7);
			assert.equal(g.toArray().length, 7);
			assert.equal(g.match(null, rdfns('type'), null, null).length, 5);
			assert.equal(g.match(null, rdfns('type'), ex('Letter'), null).length, 3);
			assert.equal(g.match(ex('A'), null, null, null).length, 3);
			assert.equal(g.match(ex('A'), rdfns('type'), null, null).length, 2);
			assert.equal(g.match(ex('A'), rdfns('type'), ex('Letter'), null).length, 1);
			assert.equal(g.match(ex('A'), rdfns('type'), ex('Letter'), ex('graph')).length, 1);
			var gg = new Dataset;
			gg.addAll(g);
			assert.equal(gg.length, g.length);
		});
		it('add (multiples)', function(){
			// "Datasets MUST NOT contain duplicate quads."
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			assert.equal(g.match(null, null, null, null).length, 2);
			assert.equal(g.toArray().length, 2);
			assert.equal(g.match(null, rdfns('type'), null, null).length, 2);
			assert.equal(g.match(null, rdfns('type'), ex('Letter'), null).length, 1);
			assert.equal(g.match(ex('A'), null, null, null).length, 1);
			assert.equal(g.match(ex('A'), rdfns('type'), null, null).length, 1);
			assert.equal(g.match(ex('A'), rdfns('type'), ex('Letter'), ex('graph')).length, 1);
		});
		it('addAll', function(){
			// "the import must not produce any duplicates."
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			var gg = new Dataset;
			assert.equal(gg.length, 0);
			gg.addAll(g);
			gg.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			assert.equal(gg.length, g.length);
			assert.equal(gg.match(null, null, null, null).length, 2);
			assert.equal(gg.toArray().length, 2);
			assert.equal(gg.match(null, rdfns('type'), null, null).length, 2);
			assert.equal(gg.match(null, rdfns('type'), ex('Letter'), null).length, 1);
			assert.equal(gg.match(ex('A'), null, null, null).length, 1);
			assert.equal(gg.match(ex('A'), rdfns('type'), null, null).length, 1);
			assert.equal(gg.match(ex('A'), rdfns('type'), ex('Letter'), null).length, 1);
			assert.equal(gg.match(ex('A'), rdfns('type'), ex('Letter'), ex('graph')).length, 1);
		});
		it('every', function(){
			// "Universal quantification method, tests whether every quad in the Dataset passes the test implemented by the provided quadFilter."
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('B'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('C'), rdfns('type'), ex('Letter'), ex('graph')));
			assert.ok(!g.every(function(quad){
				return quad.subject.equals(new rdf.NamedNode(ex('Letter')));
			}));
			assert.ok(g.every(function(quad){
				return quad.predicate.equals(new rdf.NamedNode(rdfns('type')));
			}));
			assert.ok(g.every(function(quad){
				return quad.graph.equals(new rdf.NamedNode(ex('graph')));
			}));
		});
		it('filter', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('B'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('C'), rdfns('type'), ex('Letter'), ex('graph')));
			assert.equal(g.filter(function(quad){
				return quad.predicate.equals(new rdf.NamedNode(rdfns('type')));
			}).length, 4);
			assert.equal(g.filter(function(quad){
				return quad.subject.equals(new rdf.NamedNode(ex('Letter')));
			}).length, 1);
			assert.ok(g.filter(function(quad){ return true; }) instanceof rdf.Dataset);
		});
		it('forEach', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal('Letter', '@en'), ex('graph')));
			g.add(quad(ex('A'), rdfsns('label'), new rdf.Literal('A'), ex('graph')));
			g.add(quad(ex('B'), rdfsns('label'), new rdf.Literal('B'), ex('graph')));
			g.add(quad(ex('C'), rdfsns('label'), new rdf.Literal('C'), ex('graph')));
			var len = 0;
			g.forEach(function(quad){
				len += quad.object.valueOf().length;
			});
			assert.equal(len, 9);
		});
		it('match', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal('Letter', '@en'), ex('graph')));
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			var len = 0;
			var matches = g.match(
				null,
				rdf.environment.createNamedNode(rdfns('type')),
				rdf.environment.createNamedNode(ex('Letter')),
				rdf.environment.createNamedNode(ex('graph'))
			);
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches instanceof rdf.Dataset);
		});
		it('match(iri, iri, iri, any)', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			var t = graph.match(
				env.createNamedNode(ex('foo')),
				env.createNamedNode(rdfns('type')),
				env.createNamedNode(rdfsns('Class')),
				null,
			);
			assert.ok(t); // returns empty Dataset
			assert.equal(t.length, 0);
		});
		it('match(bnode, iri, bnode, any)', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			var t = graph.match(
				env.createNamedNode(ex('foo')),
				env.createNamedNode(rdfns('type')),
				env.createNamedNode(rdfsns('Class')),
				null,
			);
			assert.ok(t); // returns empty Dataset
			assert.equal(t.length, 0);
		});
		it('match(iri, iri, literal, any)', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			var t = graph.match(
				env.createNamedNode(ex('foo')),
				env.createNamedNode(rdfns('type')),
				env.createLiteral('string!'),
				null
			);
			assert.ok(t); // returns empty Dataset
			assert.equal(t.length, 0);
		});
		it('match: literal subject throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					env.createLiteral('string!'),
					env.createNamedNode(rdfns('type')),
					env.createNamedNode(rdfsns('Class')),
					null,
				);
			});
		});
		it('match: bnode predicate throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					env.createNamedNode(ex('foo')),
					env.createBlankNode(),
					env.createNamedNode(rdfsns('Class')),
					null
				);
			});
		});
		it('match: literal graph throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					env.createNamedNode(ex('foo')),
					null,
					env.createNamedNode(rdfsns('Class')),
					env.createLiteral('string!'),
				);
			});
		});
		it('match: bnode graph throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					env.createNamedNode(ex('foo')),
					null,
					env.createNamedNode(rdfsns('Class')),
					env.createBlankNode()
				);
			});
		});
		it('match: literal predicate throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					env.createNamedNode(ex('foo')),
					env.createLiteral('string!'),
					env.createNamedNode(rdfsns('Class')),
					null,
				);
			});
		});
		it('match: variable subject throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					new rdf.Variable('s'),
					env.createNamedNode(rdfns('type')),
					env.createNamedNode(rdfsns('Class')),
					null,
				);
			});
		});
		it('match: variable predicate throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					env.createNamedNode(ex('foo')),
					new rdf.Variable('p'),
					env.createNamedNode(rdfsns('Class')),
				);
			});
		});
		it('match: variable object throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					env.createNamedNode(ex('foo')),
					env.createNamedNode(rdfns('type')),
					new rdf.Variable('o'),
				);
			});
		});
		it('match: variable graph throws', function(){
			var env = new rdf.RDFEnvironment;
			var graph = new Dataset;
			assert.throws(function(){
				graph.match(
					env.createNamedNode(ex('foo')),
					env.createNamedNode(rdfns('type')),
					env.createNamedNode(rdfsns('Class')),
					new rdf.Variable('o'),
				);
			});
		});
		it('match (NamedNode)', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), '@en'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('string')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('anyURI')), ex('graph')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createNamedNode(rdfsns('Class')), null);
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph'))));
		});
		it('match (Literal)', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), '@en'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('string')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('anyURI')), ex('graph')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createLiteral(rdfsns('Class')), null);
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class')), ex('graph'))));
		});
		it('match (LanguageLiteral)', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), '@en'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('string')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('anyURI')), ex('graph')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createLiteral(rdfsns('Class'), '@en'), null);
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), '@en'), ex('graph'))));
		});
		it('match (xsd:string)', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), '@en'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('string')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('anyURI')), ex('graph')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createLiteral(rdfsns('Class'), xsdns('string')), null);
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			debugger;
			assert(matches.toArray()[0].equals(quad(ex('Letter'), rdfsns('label'), rdf.environment.createLiteral(rdfsns('Class'), xsdns('string')), ex('graph'))));
			assert(matches.toArray()[0].equals(quad(ex('Letter'), rdfsns('label'), rdf.environment.createLiteral(rdfsns('Class')), ex('graph'))));
		});
		it('match (xsd:anyURI)', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), '@en'), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('string')), ex('graph')));
			g.add(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('anyURI')), ex('graph')));
			var len = 0;
			var matches = g.match(null, null, rdf.environment.createLiteral(rdfsns('Class'), xsdns('anyURI')), null);
			assert.equal(matches.length, 1);
			assert.equal(matches.toArray().length, 1);
			assert(matches.toArray()[0].equals(quad(ex('Letter'), rdfsns('label'), new rdf.Literal(rdfsns('Class'), xsdns('anyURI')), ex('graph'))));
		});
		// TODO add test for `merge` which, despite the description in RDF Interfaces, should produce a different but isomorphic graph.
		it('union', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph1')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph2')));
			g.add(quad(ex('B'), rdfns('type'), ex('Letter'), ex('graph3')));
			g.add(quad(ex('C'), rdfns('type'), ex('Letter'), ex('graph4')));
			var m = g.union();
			assert.equal(m.length, 4);
		});
		it('remove', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph1')));
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph2')));
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph3')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph1')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph2')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph3')));
			assert.equal(g.length, 6);
			assert.equal(g.toArray().length, 6);
			g.remove(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph3')));
			assert.equal(g.length, 5);
			assert.equal(g.toArray().length, 5);
			g.remove(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph3')));
			assert.equal(g.length, 5);
			assert.equal(g.toArray().length, 5);
		});
		it('removeMatches', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph1')));
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph2')));
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph3')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph1')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph2')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph3')));
			assert.equal(g.length, 6);
			assert.equal(g.toArray().length, 6);
			g.removeMatches(
				new rdf.NamedNode(ex('A')),
				new rdf.NamedNode(rdfns('type')),
				new rdf.NamedNode(ex('Letter')),
				new rdf.NamedNode(ex('graph3')),
			);
			assert.equal(g.length, 5);
			assert.equal(g.toArray().length, 5);
			g.removeMatches(
				new rdf.NamedNode(ex('A')),
				new rdf.NamedNode(rdfns('type')),
				new rdf.NamedNode(ex('Letter')),
				null
			);
			assert.equal(g.length, 3);
			assert.equal(g.toArray().length, 3);
		});
		it('some', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('B'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('C'), rdfns('type'), ex('Letter'), ex('graph')));
			assert.ok(g.every(function(quad){
				return quad.predicate.equals(new rdf.NamedNode(rdfns('type')));
			}));
			assert.ok(!g.every(function(quad){
				return quad.subject.equals(new rdf.NamedNode(ex('Letter')));
			}));
		});
		it('toArray', function(){
			var g = new Dataset;
			g.add(quad(ex('Letter'), rdfns('type'), rdfsns('Class'), ex('graph')));
			g.add(quad(ex('A'), rdfns('type'), ex('Letter'), ex('graph')));
			g.add(quad(ex('B'), rdfns('type'), ex('Letter'), ex('graph1')));
			g.add(quad(ex('C'), rdfns('type'), ex('Letter'), ex('graph2')));
			var a = g.toArray();
			assert(Array.isArray(a));
			assert.equal(a.length, 4);
		});
		// TODO: Dataset#isomorphic was here
		// TODO: Dataset#equals was here
	});
});
