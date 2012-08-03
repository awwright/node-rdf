var vows=require('vows');
var assert=require('assert');
var rdf=require('rdf');
var env=rdf.environment;

var batches = {};
var id=0;
function addDocument(turtle, triples){
	if(turtle instanceof Array) turtle=turtle.join("\n");
	var batch = batches['#'+(++id)+': '+turtle.replace(/\n/g,"\\n ").replace(/\t/g," ")] = { topic: function(){
		// The tests expect bnodes to be numbered starting with 1
		rdf.BlankNode.NextId = 0;
		var graph = new rdf.IndexedGraph;
		var turtleParser = new (require('rdf/TurtleParser').Turtle)(env, undefined, undefined, graph);
		turtleParser.parse(turtle, undefined, 'http://example.com/', undefined, graph);
		//console.log("\nTurtle:\n\t"+turtle.replace(/\n/g,'\n\t')+"\nTriples:\n\t"+require('util').inspect(graph.index, false, 5, true).replace(/\n/g,'\n\t')+"\n");
		return graph;
	} };
	batch["length==="+triples.length] = function(graph){ assert.strictEqual(graph.length, triples.length); }
	for(var i=0; i<triples.length; i++){
		var triple = triples[i];
		batch["Exists: "+triple.toString()] = (function(triple){ return function(graph){
			assert.isTrue(graph.some(function(v){ return triple.equals(v); }));
		} })(triple);
	}
	return batch;
}

addDocument('<http://example.com/report> a <http://example.com/Document>.',
	[ env.createTriple("http://example.com/report", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://example.com/Document")
	]);

addDocument('<http://example.com/report> rdf:type <http://example.com/Document>.',
	[ env.createTriple("http://example.com/report", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://example.com/Document")
	]);

addDocument('<http://example.com/report> rdf:value "22".',
	[ env.createTriple("http://example.com/report", "http://www.w3.org/1999/02/22-rdf-syntax-ns#value", env.createLiteral("22",null,null))
	]);

var a = addDocument(
	[ '# this is a complete turtle document'
	, '@prefix foo: <http://example.org/ns#> .'
	, '@prefix : <http://other.example.org/ns#> .'
	, 'foo:bar foo: : .'
	, ':bar : foo:bar .'
	],
	[ env.createTriple("http://example.org/ns#bar", "http://example.org/ns#", 'http://other.example.org/ns#')
	, env.createTriple("http://other.example.org/ns#bar", "http://other.example.org/ns#", 'http://example.org/ns#bar')
	]);
a["Does not exist: <http://example.org/> <http://example.org/> <http://example.org/>."] = function(graph){
	assert.isFalse(graph.some(function(v){ return env.createTriple('http://example.org/','http://example.org/','http://example.org/').equals(v); }));
}

addDocument(
	[ '@prefix m: <http://magnode.org/>.'
	, '<http://magnode.org/admin/auth/login>'
	, '	a m:HTTPAuthForm;'
	, '	m:domain "/";'
	, '	m:action "/createSession";'
	, '	m:credentials <http://example.org/admin/auth/password>.'
	],
	[ env.createTriple('http://magnode.org/admin/auth/login', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://magnode.org/HTTPAuthForm')
	, env.createTriple('http://magnode.org/admin/auth/login', 'http://magnode.org/domain', env.createLiteral('/',null,null))
	, env.createTriple('http://magnode.org/admin/auth/login', 'http://magnode.org/action', env.createLiteral('/createSession',null,null))
	, env.createTriple('http://magnode.org/admin/auth/login', 'http://magnode.org/credentials', 'http://example.org/admin/auth/password')
	]);

addDocument(
	[ '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .'
	, '@prefix dc: <http://purl.org/dc/elements/1.1/> .'
	, '@prefix ex: <http://example.org/stuff/1.0/> .'
	, ''
	, '<http://www.w3.org/TR/rdf-syntax-grammar>'
	, '  dc:title "RDF/XML Syntax Specification (Revised)" ;'
	, '  ex:editor ['
	, '    ex:fullName "Dave Beckett";'
	, '    ex:homePage <http://purl.org/net/dajobe/>'
	, '  ] .'
	],
	[ env.createTriple('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title', env.createLiteral('RDF/XML Syntax Specification (Revised)',null,null))
	, env.createTriple('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b1')
	, env.createTriple('_:b1', 'http://example.org/stuff/1.0/fullName', env.createLiteral('Dave Beckett',null,null))
	, env.createTriple('_:b1', 'http://example.org/stuff/1.0/homePage', 'http://purl.org/net/dajobe/')
	]);

// Changing base and prefix
addDocument(
	[ '# this is a complete turtle document'
	, '# In-scope base URI is the document URI at this point'
	, '<a1> <b1> <c1> .'
	, '@base <http://example.org/ns/> .'
	, '# In-scope base URI is http://example.org/ns/ at this point'
	, '<a2> <http://example.org/ns/b2> <c2> .'
	, '@base <foo/> .'
	, '# In-scope base URI is http://example.org/ns/foo/ at this point'
	, '<a3> <b3> <c3> .'
	, '@prefix : <bar#> .'
	, ':a4 :b4 :c4 .'
	, '@prefix : <http://example.org/ns2#> .'
	, ':a5 :b5 :c5 .'
	],
	[ env.createTriple('http://example.com/a1', 'http://example.com/b1', 'http://example.com/c1')
	, env.createTriple('http://example.org/ns/a2', 'http://example.org/ns/b2', 'http://example.org/ns/c2')
	, env.createTriple('http://example.org/ns/foo/a3', 'http://example.org/ns/foo/b3', 'http://example.org/ns/foo/c3')
	, env.createTriple('http://example.org/ns/foo/bar#a4', 'http://example.org/ns/foo/bar#b4', 'http://example.org/ns/foo/bar#c4')
	, env.createTriple('http://example.org/ns2#a5', 'http://example.org/ns2#b5', 'http://example.org/ns2#c5')
	]);

addDocument(
	'<http://example.org/> rdf:value ().',
	[ env.createTriple('http://example.org/', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
	]);

// Any id for the bnode values passes, so long as different bnodes don't have the same id
addDocument(
	'<http://example.org/> rdf:value (1 "2" <http://example.com/3>).',
	[ env.createTriple('http://example.org/', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', '_:b1')
	, env.createTriple('_:b1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', env.createLiteral("1",null,"http://www.w3.org/2001/XMLSchema#integer"))
	, env.createTriple('_:b1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', '_:b2')
	, env.createTriple('_:b2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', env.createLiteral("2",null,null))
	, env.createTriple('_:b2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', '_:b3')
	, env.createTriple('_:b3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.com/3')
	, env.createTriple('_:b3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
	]);

vows.describe('Turtle parsing').addBatch(batches).export(module);
