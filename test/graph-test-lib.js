var rdf=require('rdf');
var vows=require('vows');
var assert=require('assert');

function rdfns(v){ return "http://www.w3.org/1999/02/22-rdf-syntax-ns#".concat(v); }

module.exports = function GenerateGraphTest(Graph){
	var batches = {};
	batches[Graph.name+' methods exist'] =
		{ topic: new Graph
		, 'add exists': function(t){assert.isFunction(t.add)}
		, 'remove exists': function(t){assert.isFunction(t.remove)}
		, 'removeMatches exists': function(t){assert.isFunction(t.removeMatches)}
		, 'toArray exists': function(t){assert.isFunction(t.toArray)}
		, 'some exists': function(t){assert.isFunction(t.some)}
		, 'every exists': function(t){assert.isFunction(t.every)}
		, 'filter exists': function(t){assert.isFunction(t.filter)}
		, 'forEach exists': function(t){assert.isFunction(t.forEach)}
		, 'match exists': function(t){assert.isFunction(t.match)}
		, 'merge exists': function(t){assert.isFunction(t.merge)}
		, 'addAll exists': function(t){assert.isFunction(t.addAll)}
		, 'actions exists': function(t){assert.isArray(t.actions)}
		, 'addAction exists': function(t){assert.isFunction(t.addAction)}
		};
	batches[Graph.name+' insert/query'] =
		{ topic: function(){
			var g = new Graph;
			g.add(rdf.environment.createTriple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
			g.add(rdf.environment.createTriple('http://example.com/Vowel', 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'http://example.com/Letter'));
			g.add(rdf.environment.createTriple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
			g.add(rdf.environment.createTriple('http://example.com/A', rdfns('type'), 'http://example.com/Vowel'));
			g.add(rdf.environment.createTriple('http://example.com/A', 'http://example.com/nextLetter', 'http://example.com/B'));
			g.add(rdf.environment.createTriple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
			g.add(rdf.environment.createTriple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));
			return g;
			}
		, 'match(null, null, null)':
			{ topic: function(t){ return t.match(null,null,null); }
			, 'length': function(t){ assert.lengthOf(t, 7) }
			}
		, 'match(null, a, null)':
			{ topic: function(t){ return t.match(null,rdfns('type'),null); }
			, 'length': function(t){ assert.lengthOf(t, 5) }
			}
		, 'match(null, a, ex:Letter)':
			{ topic: function(t){ return t.match(null,rdfns('type'),'http://example.com/Letter'); }
			, 'length': function(t){ assert.lengthOf(t, 3) }
			}
		, 'match(ex:A, a, null)':
			{ topic: function(t){ return t.match('http://example.com/A',null,null); }
			, 'length': function(t){ assert.lengthOf(t, 3) }
			}
		, 'match(ex:A, a, null)':
			{ topic: function(t){ return t.match('http://example.com/A',rdfns('type'),null); }
			, 'length': function(t){ assert.lengthOf(t, 2) }
			}
		, 'match(ex:A, a, ex:Letter)':
			{ topic: function(t){ return t.match('http://example.com/A',rdfns('type'),'http://example.com/Letter'); }
			, 'length': function(t){ assert.lengthOf(t, 1) }
			}
		, 'addAll()':
			{ topic: function(t){ var g = new Graph; g.addAll(t); return g; }
			, 'length': function(t2){ assert.lengthOf(t2.toArray(), 7) }
			}
		};
	return batches;
}
