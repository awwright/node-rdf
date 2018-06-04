var assert = require('assert');
var rdf = require('..');
var env = rdf.environment;
var util = require('util');

function generateRefTest(subject, topic, n3out, ntout, triplesout){
	// Setup tests
	var expectedGraph = new rdf.Graph;
	expectedGraph.addAll(triplesout);

	// Test interface
	var t = topic.ref(subject);
	assert.equal(typeof t.n3, 'function');
	assert.equal(typeof t.toNT, 'function');
	assert.equal(typeof t.graphify, 'function');

	// Run
	var n3 = t.n3();
	var NT = t.toNT();

	// test graphify
	var outputGraph = t.graphify();
	// Have the data, compare
	var expectedTriples = expectedGraph.toArray().sort();
	var outputTriples = outputGraph.toArray().sort();
	if(!expectedGraph.equals(outputGraph)){
		assert.equal(outputTriples.join('\n'), expectedTriples.join('\n'));
		assert(expectedGraph.equals(outputGraph));
	}
	return;

	// test n3
	assert.equal(n3, n3out);

	// Parse the generated n3 as Turtle
	var outputGraph = env.createGraph();
	var parser = new rdf.TurtleParser;
	parser.parse(n3, undefined, 'http://example.com/', null, outputGraph);
	// Have the data, compare
	var expectedTriples = expectedGraph.toArray().sort();
	var outputTriples = outputGraph.toArray().sort();
	if(!expectedGraph.equals(outputGraph)){
		assert.equal(outputTriples.join('\n'), expectedTriples.join('\n'));
		assert(expectedGraph.equals(outputGraph));
	}

	// test toNT
	assert.equal(NT, ntout);

	// Parse the generated N-Triples
	var outputGraph = env.createGraph();
	var parser = new rdf.TurtleParser;
	parser.parse(NT, undefined, 'http://example.com/', null, outputGraph);
	// Have the data, compare
	var expectedTriples = expectedGraph.toArray().sort();
	var outputTriples = outputGraph.toArray().sort();
	if(!expectedGraph.equals(outputGraph)){
		assert.equal(outputTriples.join('\n'), expectedTriples.join('\n'));
		assert(expectedGraph.equals(outputGraph));
	}
}

describe('Object builtins', function(){
	before(function(){
		rdf.setBuiltins();
	});
	after(function(){
		rdf.unsetBuiltins();
	});

	it('().ref the a keyword', function(){
		generateRefTest('_:topic1', {a: 'rdfs:Class'},
			'_:topic1\n\trdf:type rdfs:Class .',
			'_:topic1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
			[ env.createTriple('_:topic1', "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", 'http://www.w3.org/2000/01/rdf-schema#Class')
			]);
	});
	it('().ref integer', function(){
		generateRefTest('_:topic2', {rdf$value: 42},
			'_:topic2\n\trdf:value 42 .',
			'_:topic2 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "42"^^<http://www.w3.org/2001/XMLSchema#integer> .',
			[ env.createTriple('_:topic2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral('42',null,'http://www.w3.org/2001/XMLSchema#integer'))
			]);
	});
	it('().ref decimal', function(){
		generateRefTest('_:decimal', {rdf$value: 4.4},
			'_:float\n\trdf:value 4.4 .',
			'_:float <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "42"^^<http://www.w3.org/2001/XMLSchema#decimal> .',
			[ env.createTriple('_:float', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral('4.4',null,'http://www.w3.org/2001/XMLSchema#decimal'))
			]);
	});
	it('().ref string', function(){
		generateRefTest('_:topic3', {rdf$value: "A string.".l()},
			'_:topic3\n\trdf:value "A string." .',
			'_:topic3 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "A string." .',
			[ env.createTriple('_:topic3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("A string."))
			]);
	});
	it('().ref string spaces', function(){
		generateRefTest('_:topic4', {rdf$value: env.createLiteral("A string 2000",null,null)},
			'_:topic4\n\trdf:value "A string 2000" .',
			'_:topic4 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "A string 2000" .',
			[ env.createTriple('_:topic4', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("A string 2000"))
			]);
	});
	it('().ref language literal', function(){
		generateRefTest('_:topic5', {rdf$value: "The Hobbit".l('en')},
			'_:topic5\n\trdf:value "The Hobbit"@en .',
			'_:topic5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "The Hobbit"@en .',
			[ env.createTriple('_:topic5', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', env.createLiteral("The Hobbit", "@en"))
			]
		);
	});
	it('(_:topic6).ref', function(){
		// Normally, use env.createBlankNode
		// For deterministic tests, we use BlankNode with a name
		generateRefTest('_:topic6', {rdf$value: new rdf.BlankNode('_:b1')},
			'_:topic6\n\trdf:value _:b1 .',
			'_:topic6 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> _:b1 .',
			[ env.createTriple('_:topic6', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', '_:b1')
			]);
	});
	it('(_:topic7).ref objects are unlabeled blank nodes', function(){
		// Normally, use env.createBlankNode
		// For deterministic tests, we use BlankNode with a name
		var b1 = new rdf.BlankNode('_:b1');
		var b2 = new rdf.BlankNode('_:b2');
		generateRefTest('_:topic6', {rdf$value: {rdf$value: b2}},
			'_:topic6\n\trdf:value _:b1 .',
			'_:topic6 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> _:b1 .',
			[ env.createTriple('_:topic6', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', b1)
			, env.createTriple(b1, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', b2)
			]);
	});
	it('(dbr:Albert_Einstein).ref', function(){
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
			[ env.createTriple("http://dbpedia.org/resource/Albert_Einstein", "http://xmlns.com/foaf/0.1/depiction", 'http://en.wikipedia.org/wiki/Image:Albert_Einstein_Head.jpg')
			, env.createTriple("http://dbpedia.org/resource/Albert_Einstein", "http://dbpedia.org/property/dateOfBirth", env.createTypedLiteral("1879-03-14T00:00:00Z",rdf.xsdns('dateTime')))
			]);
	});
});
