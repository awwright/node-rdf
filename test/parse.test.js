var assert = require('assert');
var rdf = require('..');
var env = rdf.environment;
var util = require('util');

function triple(s, p, o){
	// Don't normally use `new rdf.BlankNode`, except where determinism in output is needed
	return rdf.environment.createTriple(
		typeof s=='string' ? (s.substring(0,2)=='_:' ? new rdf.BlankNode(s) : rdf.environment.createNamedNode(s)) : s ,
		typeof p=='string' ? (p.substring(0,2)=='_:' ? new rdf.BlankNode(p) : rdf.environment.createNamedNode(p)) : p ,
		typeof o=='string' ? (o.substring(0,2)=='_:' ? new rdf.BlankNode(o) : rdf.environment.createNamedNode(o)) : o
	);
}

function generateRefTest(subject, topic, n3out, ntout, triplesout){
	var t = rdf.parse(topic, subject);
	assert.equal(typeof t.n3, 'function');
	assert.equal(typeof t.toNT, 'function');
	assert.equal(typeof t.graphify, 'function');
	assert.equal(typeof t.toNT, 'function');
	assert.equal(t.n3(), n3out);
	assert.equal(t.toNT(), ntout);
	var graph = t.graphify();
	assert.strictEqual(graph.length, triplesout.length);
	for(var i=0; i<triplesout.length; i++){
		var triple = triplesout[i];
		assert.ok(graph.some(function(v){ return triple.equals(v); }));
	}
}

describe('parse', function(){
	it('parse(_:topic1)', function(){
		generateRefTest('_:topic1', {a: 'rdfs:Class'},
			'_:topic1\n\trdf:type rdfs:Class .',
			'_:topic1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
			[ triple('_:topic1', "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", 'http://www.w3.org/2000/01/rdf-schema#Class')
			]);
	});
	it('parse(_:topic2)', function(){
		generateRefTest('_:topic2', {rdf$value: 42},
			'_:topic2\n\trdf:value 42 .',
			'_:topic2 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "42"^^<http://www.w3.org/2001/XMLSchema#double> .',
			[ triple('_:topic2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral('42',null,'http://www.w3.org/2001/XMLSchema#integer'))
			]);
	});
	it('parse(_:topic3)', function(){
		generateRefTest('_:topic3', {rdf$value: env.createLiteral("A string.")},
			'_:topic3\n\trdf:value "A string." .',
			'_:topic3 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "A string." .',
			[ triple('_:topic3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("A string.",null,null))
			]);
	});
	it('parse(_:topic4)', function(){
		generateRefTest('_:topic4', {rdf$value: env.createLiteral("A string 2000",null,null)},
			'_:topic4\n\trdf:value "A string 2000" .',
			'_:topic4 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "A string 2000" .',
			[ triple('_:topic4', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("A string 2000"))
			]);
	});
	it('parse(_:topic5)', function(){
		generateRefTest('_:topic5', {rdf$value: env.createLiteral("2")},
			'_:topic5\n\trdf:value "2" .',
			'_:topic5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "2" .',
			[ triple('_:topic5', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("2"))
			]
		);
	});
	it('parse(_:topic6)', function(){
		// Normally, use env.createBlankNode
		// For deterministic tests, we use BlankNode with a name
		generateRefTest('_:topic6', {rdf$value: new rdf.BlankNode('_:b1')},
			'_:topic6\n\trdf:value _:b1 .',
			'_:topic6 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> _:b1 .',
			[ triple('_:topic6', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', '_:b1')
			]);
	});
	it('parse(dbr:Albert_Einstein)', function(){
		/*
			dbp:dateOfBirth "1879-03-14"^^xsd:date ;
			foaf:depiction <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .
		*/
		generateRefTest( 'dbr:Albert_Einstein',
			{ $context: { 'dbr': 'http://dbpedia.org/resource/',  'dbp': 'http://dbpedia.org/property/', 'foaf': 'http://xmlns.com/foaf/0.1/',}
			, dbp$dateOfBirth: new Date("1879-03-14")
			, 'foaf:depiction': 'http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg'
			},
			'dbr:Albert_Einstein dbp:dateOfBirth "1879-03-14"^^xsd:date;\n\tfoaf:depiction <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .',
			'<http://dbpedia.org/resource/Albert_Einstein> <http://dbpedia.org/property/dateOfBirth> "1879-03-14T00:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n<http://dbpedia.org/resource/Albert_Einstein> <http://xmlns.com/foaf/0.1/depiction> <http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg> .',
			[ triple("http://dbpedia.org/resource/Albert_Einstein", "http://xmlns.com/foaf/0.1/depiction", 'http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg')
			, triple("http://dbpedia.org/resource/Albert_Einstein", "http://dbpedia.org/property/dateOfBirth", env.createLiteral("1879-03-14",null,'http://www.w3.org/2001/XMLSchema#date'))
			]);
	});
});
